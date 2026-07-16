import crypto from 'crypto';
import { User, IUser } from '../users/users.model';
import { TokenService } from '../../services/token.service';
import { EmailService } from '../../services/email.service';
import { ApiError } from '../../utils/ApiError';
import type {
  RegisterInput,
  LoginInput,
  ResetPasswordInput,
} from './auth.validators';

const MAX_REFRESH_TOKENS = 5; // max concurrent sessions per user

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult {
  user: IUser;
  tokens: AuthTokens;
}

export class AuthService {
  // ─── Register ──────────────────────────────────────────────────────────────
  static async register(input: RegisterInput, userAgent?: string): Promise<AuthResult> {
    const { name, email, username, password } = input;

    // Check uniqueness
    const [emailExists, usernameExists] = await Promise.all([
      User.exists({ email }),
      User.exists({ username }),
    ]);

    if (emailExists) throw ApiError.conflict('An account with this email already exists');
    if (usernameExists) throw ApiError.conflict('This username is already taken');

    // Generate verification token
    const { raw: verificationRaw, hashed: verificationHashed } =
      TokenService.generateSecureToken();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Create user
    const user = await User.create({
      name,
      email,
      username,
      password,
      verificationToken: verificationHashed,
      verificationTokenExpiry,
    });

    // Issue tokens
    const tokens = await this.issueTokens(user, userAgent);

    // Send verification email (non-blocking — don't fail registration if email fails)
    EmailService.sendVerificationEmail(email, name, verificationRaw).catch((err) => {
      console.error('Failed to send verification email:', err);
    });

    return { user, tokens };
  }

  // ─── Login ─────────────────────────────────────────────────────────────────
  static async login(input: LoginInput, userAgent?: string): Promise<AuthResult> {
    const { email, password } = input;

    // Fetch user WITH password field (excluded by default)
    const user = await User.findByEmail(email);
    if (!user) throw ApiError.unauthorized('Invalid email or password');

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) throw ApiError.unauthorized('Invalid email or password');

    // Update last seen
    user.lastSeen = new Date();
    await user.save();

    const tokens = await this.issueTokens(user, userAgent);
    return { user, tokens };
  }

  // ─── Refresh token rotation ────────────────────────────────────────────────
  static async refreshTokens(
    incomingToken: string,
    userAgent?: string,
  ): Promise<AuthTokens> {
    // Verify JWT signature + expiry
    const payload = TokenService.verifyRefreshToken(incomingToken);

    // Find user and check stored token (prevents reuse after rotation)
    const user = await User.findById(payload.sub).select('+refreshTokens');
    if (!user) throw ApiError.unauthorized('User not found');

    const hashedIncoming = TokenService.hashToken(incomingToken);
    const storedToken = user.refreshTokens.find(
      (t) => t.token === hashedIncoming && t.tokenId === payload.tokenId,
    );

    if (!storedToken) {
      // Token not in DB — possible reuse attack: revoke ALL tokens
      user.refreshTokens = [];
      await user.save();
      throw ApiError.unauthorized('Refresh token reuse detected. Please log in again.');
    }

    if (storedToken.expiresAt < new Date()) {
      throw ApiError.unauthorized('Refresh token expired. Please log in again.');
    }

    // Rotate: remove old token, issue new pair
    user.refreshTokens = user.refreshTokens.filter(
      (t) => t.tokenId !== payload.tokenId,
    );

    const newRefresh = TokenService.signRefreshToken(user._id.toString());
    const hashedNew = TokenService.hashToken(newRefresh.token);

    user.refreshTokens.push({
      token: hashedNew,
      tokenId: newRefresh.tokenId,
      createdAt: new Date(),
      expiresAt: newRefresh.expiresAt,
      userAgent,
    });

    // Enforce max concurrent sessions
    if (user.refreshTokens.length > MAX_REFRESH_TOKENS) {
      user.refreshTokens = user.refreshTokens.slice(-MAX_REFRESH_TOKENS);
    }

    await user.save();

    const accessToken = TokenService.signAccessToken({
      sub: user._id.toString(),
      username: user.username,
      role: user.role,
    });

    return { accessToken, refreshToken: newRefresh.token };
  }

  // ─── Logout ────────────────────────────────────────────────────────────────
  static async logout(userId: string, refreshToken: string): Promise<void> {
    const user = await User.findById(userId).select('+refreshTokens');
    if (!user) return;

    const hashed = TokenService.hashToken(refreshToken);
    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== hashed);
    await user.save();
  }

  // ─── Logout all devices ────────────────────────────────────────────────────
  static async logoutAll(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $set: { refreshTokens: [] } });
  }

  // ─── Verify email ──────────────────────────────────────────────────────────
  static async verifyEmail(rawToken: string): Promise<IUser> {
    const hashed = TokenService.hashToken(rawToken);

    const user = await User.findOne({
      verificationToken: hashed,
      verificationTokenExpiry: { $gt: new Date() },
    }).select('+verificationToken +verificationTokenExpiry');

    if (!user) throw ApiError.badRequest('Invalid or expired verification link');
    if (user.isVerified) throw ApiError.badRequest('Email is already verified');

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    // Send welcome email
    EmailService.sendWelcomeEmail(user.email, user.name).catch(
      (err) => console.error('Failed to send welcome email:', err),
    );

    return user;
  }

  // ─── Resend verification email ─────────────────────────────────────────────
  static async resendVerificationEmail(email: string): Promise<void> {
    const user = await User.findOne({ email }).select(
      '+verificationToken +verificationTokenExpiry',
    );

    // Always return success (prevents user enumeration)
    if (!user || user.isVerified) return;

    const { raw, hashed } = TokenService.generateSecureToken();
    user.verificationToken = hashed;
    user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await EmailService.sendVerificationEmail(user.email, user.name, raw);
  }

  // ─── Forgot password ───────────────────────────────────────────────────────
  static async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email }).select(
      '+resetPasswordToken +resetPasswordExpiry',
    );

    // Always return success (prevents email enumeration)
    if (!user) return;

    const { raw, hashed } = TokenService.generateSecureToken();
    user.resetPasswordToken = hashed;
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await EmailService.sendPasswordResetEmail(user.email, user.name, raw);
  }

  // ─── Reset password ────────────────────────────────────────────────────────
  static async resetPassword(input: ResetPasswordInput): Promise<void> {
    const { token: rawToken, password } = input;
    const hashed = TokenService.hashToken(rawToken);

    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpiry: { $gt: new Date() },
    }).select('+password +resetPasswordToken +resetPasswordExpiry +refreshTokens');

    if (!user) throw ApiError.badRequest('Invalid or expired reset link');

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    // Invalidate all sessions after password reset
    user.refreshTokens = [];
    await user.save();
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────
  private static async issueTokens(
    user: IUser,
    userAgent?: string,
  ): Promise<AuthTokens> {
    const accessToken = TokenService.signAccessToken({
      sub: user._id.toString(),
      username: user.username,
      role: user.role,
    });

    const { token: refreshToken, tokenId, expiresAt } =
      TokenService.signRefreshToken(user._id.toString());

    const hashed = TokenService.hashToken(refreshToken);

    // Ensure refresh tokens are loaded
    if (!user.refreshTokens) {
      const freshUser = await User.findById(user._id).select('+refreshTokens');
      if (freshUser) user.refreshTokens = freshUser.refreshTokens;
    }

    user.refreshTokens.push({
      token: hashed,
      tokenId,
      createdAt: new Date(),
      expiresAt,
      userAgent,
    });

    // Cap at max sessions
    if (user.refreshTokens.length > MAX_REFRESH_TOKENS) {
      user.refreshTokens = user.refreshTokens.slice(-MAX_REFRESH_TOKENS);
    }

    await user.save();

    return { accessToken, refreshToken };
  }
}

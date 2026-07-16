import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './auth.validators';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as RegisterInput;
  const userAgent = req.headers['user-agent'];

  const { user, tokens } = await AuthService.register(input, userAgent);

  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(201).json(
    ApiResponse.created('Account created successfully', {
      user,
      accessToken: tokens.accessToken,
    }),
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as LoginInput;
  const userAgent = req.headers['user-agent'];

  const { user, tokens } = await AuthService.login(input, userAgent);

  res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

  res.json(
    ApiResponse.ok('Logged in successfully', {
      user,
      accessToken: tokens.accessToken,
    }),
  );
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  // Accept from cookie OR body (supports native mobile clients)
  const incomingToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingToken) {
    return res.status(401).json(
      new ApiResponse(401, 'No refresh token provided', null),
    );
  }

  const userAgent = req.headers['user-agent'];
  const tokens = await AuthService.refreshTokens(incomingToken, userAgent);

  res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

  res.json(
    ApiResponse.ok('Token refreshed', { accessToken: tokens.accessToken }),
  );
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshTokenValue = req.cookies?.refreshToken || req.body?.refreshToken;

  if (req.user && refreshTokenValue) {
    await AuthService.logout((req.user as any)._id.toString(), refreshTokenValue);
  }

  res.clearCookie('refreshToken', { path: '/' });
  res.json(ApiResponse.ok('Logged out successfully', null));
});

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  await AuthService.logoutAll((req.user as any)._id.toString());
  res.clearCookie('refreshToken', { path: '/' });
  res.json(ApiResponse.ok('Logged out of all devices', null));
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const user = await AuthService.verifyEmail(token);
  res.json(ApiResponse.ok('Email verified successfully', { user }));
});

export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as ForgotPasswordInput;
  await AuthService.resendVerificationEmail(email);
  res.json(
    ApiResponse.ok(
      'If that email exists and is unverified, a new link has been sent.',
      null,
    ),
  );
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as ForgotPasswordInput;
  await AuthService.forgotPassword(email);
  res.json(
    ApiResponse.ok(
      'If that email exists, a password reset link has been sent.',
      null,
    ),
  );
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as ResetPasswordInput;
  await AuthService.resetPassword(input);
  res.json(ApiResponse.ok('Password reset successfully. Please log in.', null));
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  res.json(ApiResponse.ok('Current user', { user: req.user }));
});

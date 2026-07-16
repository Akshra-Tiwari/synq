import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../modules/users/users.model';
import { TokenService } from '../services/token.service';
import bcrypt from 'bcryptjs';

export function initPassport() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return;

  passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:5000/api/v1/auth/google/callback',
    scope:        ['profile', 'email'],
  }, async (_at, _rt, profile, done) => {
    try {
      const email  = profile.emails?.[0]?.value;
      const avatar = profile.photos?.[0]?.value;
      if (!email) return done(new Error('No email from Google'), false);

      let user = await User.findOne({ email });

      if (!user) {
        const base     = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
        const username = `${base}_${Math.floor(Math.random() * 9000) + 1000}`;
        // Generate a random password that will never be used
        const { raw } = TokenService.generateSecureToken();
        const hashedPw = await bcrypt.hash(raw, 12);

        user = await User.create({
          name:       profile.displayName || base,
          username,
          email,
          password:   hashedPw,
          avatar,
          isVerified: true,
          provider:   'google',
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err as Error, false);
    }
  }));
}

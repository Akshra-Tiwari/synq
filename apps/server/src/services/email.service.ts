import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host:   env.SMTP_HOST,
  port:   env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth:   { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

const BRAND_COLOR = '#01796F';
const BG_COLOR    = '#08120A';
const SURFACE     = '#0D131C';

function baseTemplate(content: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BG_COLOR};font-family:Inter,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG_COLOR};padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:${SURFACE};border-radius:16px;border:1px solid rgba(109,129,150,0.12);overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="padding:28px 36px 24px;border-bottom:1px solid rgba(109,129,150,0.08);">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:32px;height:32px;background:${BRAND_COLOR};border-radius:8px;text-align:center;vertical-align:middle;">
                  <span style="color:white;font-size:16px;font-weight:bold;">S</span>
                </td>
                <td style="padding-left:10px;">
                  <span style="font-size:16px;font-weight:700;color:#DCE4EC;letter-spacing:-0.3px;">Synq</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Content -->
        <tr><td style="padding:36px;">${content}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 36px;border-top:1px solid rgba(109,129,150,0.08);text-align:center;">
            <p style="margin:0;font-size:12px;color:#50606E;">
              © ${new Date().getFullYear()} Synq · Built for developers<br/>
              <a href="${env.FRONTEND_URL}" style="color:${BRAND_COLOR};text-decoration:none;">${env.FRONTEND_URL}</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export class EmailService {
  static async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const url     = `${env.FRONTEND_URL}/verify-email?token=${token}`;
    const content = `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#DCE4EC;">Verify your email</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#94A2AF;line-height:1.6;">
        Hi ${name}, thanks for joining Synq. Click the button below to verify your email address.
      </p>
      <a href="${url}" style="display:inline-block;padding:12px 28px;background:${BRAND_COLOR};color:white;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;">
        Verify email →
      </a>
      <p style="margin:24px 0 0;font-size:12px;color:#50606E;">
        Link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
      </p>`;

    await transporter.sendMail({
      from:    `"Synq" <${env.EMAIL_FROM}>`,
      to:      email,
      subject: 'Verify your Synq email',
      html:    baseTemplate(content, 'Verify your email'),
    });
  }

  static async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const url     = `${env.FRONTEND_URL}/reset-password?token=${token}`;
    const content = `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#DCE4EC;">Reset your password</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#94A2AF;line-height:1.6;">
        Hi ${name}, we received a request to reset your password. Click the button below to create a new one.
      </p>
      <a href="${url}" style="display:inline-block;padding:12px 28px;background:${BRAND_COLOR};color:white;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;">
        Reset password →
      </a>
      <p style="margin:24px 0 0;font-size:12px;color:#50606E;">
        Link expires in 1 hour. If you didn't request this, please ignore this email.
      </p>`;

    await transporter.sendMail({
      from:    `"Synq" <${env.EMAIL_FROM}>`,
      to:      email,
      subject: 'Reset your Synq password',
      html:    baseTemplate(content, 'Reset your password'),
    });
  }

  static async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const content = `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#DCE4EC;">Welcome to Synq 🎉</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#94A2AF;line-height:1.6;">
        Hi ${name}, your account is verified and ready. Start building your developer profile.
      </p>
      <a href="${env.FRONTEND_URL}/onboarding" style="display:inline-block;padding:12px 28px;background:${BRAND_COLOR};color:white;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;">
        Complete your profile →
      </a>`;

    await transporter.sendMail({
      from:    `"Synq" <${env.EMAIL_FROM}>`,
      to:      email,
      subject: 'Welcome to Synq!',
      html:    baseTemplate(content, 'Welcome to Synq'),
    });
  }
}

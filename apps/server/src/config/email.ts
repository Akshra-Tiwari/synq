import nodemailer from 'nodemailer';
import { env } from './env';

export const emailTransporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

// Verify transport connection on startup in non-test envs
if (env.NODE_ENV !== 'test') {
  emailTransporter.verify((error) => {
    if (error) console.error('Email transporter error:', error);
    else console.log('✅  Email transporter ready');
  });
}

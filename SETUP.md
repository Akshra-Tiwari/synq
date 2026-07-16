# Synq — Setup Guide

## Prerequisites
- Node.js v20+ (https://nodejs.org — choose LTS)
- No Docker needed

## Step 1: Install dependencies
```
npm install
```

## Step 2: Set up apps/server/.env
Create the file (copy from .env.example) and fill in:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# MongoDB Atlas (https://cloud.mongodb.com — free M0 cluster)
MONGODB_URI=mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/synq

# Generate TWICE with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=64_char_random_string
JWT_REFRESH_SECRET=different_64_char_random_string
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudinary (https://cloudinary.com — free)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Resend (https://resend.com — free)
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_your_api_key
EMAIL_FROM=onboarding@resend.dev

# Google OAuth (optional — https://console.cloud.google.com)
# GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
# GOOGLE_CLIENT_SECRET=xxx
# GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
```

## Step 3: Set up apps/web/.env.local
Create this file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Step 4: Run
```
npm run dev
```

- Frontend → http://localhost:3000
- Backend  → http://localhost:5000
- Health   → http://localhost:5000/health

## Troubleshooting

| Error | Fix |
|-------|-----|
| Network Error on login | Backend not running or .env missing |
| MongoDB connection failed | Check MONGODB_URI + Atlas IP whitelist (0.0.0.0/0) |
| Cannot find module | Delete node_modules, run npm install again |
| Build error on Tailwind | Delete apps/web/.next and restart |

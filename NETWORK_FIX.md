# Synq — Network Error Fix

If you see "Network Error" on login/signup, follow these steps:

## Step 1: Create apps/server/.env file

Copy from .env.example and fill in:

```
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/synq
JWT_ACCESS_SECRET=<64 char random>
JWT_REFRESH_SECRET=<64 char random>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_xxx
EMAIL_FROM=onboarding@resend.dev
```

## Step 2: Create apps/web/.env.local file

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Step 3: Verify backend is running

Open http://localhost:5000/health in browser.
You should see: {"status":"ok","service":"Synq API",...}

If NOT — check server terminal for errors.

## Step 4: Google Sign-in setup (optional)

1. Go to https://console.cloud.google.com
2. New Project → APIs & Services → OAuth consent screen → External
3. Credentials → Create OAuth client ID → Web application
4. Authorized redirect URIs: http://localhost:5000/api/v1/auth/google/callback
5. Copy Client ID and Secret → add to .env:

```
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
```

Google Sign-in will work automatically once these are set.
Without them, the Google button redirects back to login with an error message.

## Common errors

| Error | Fix |
|-------|-----|
| Network Error | Backend not running OR .env missing |
| MongoDB connection failed | Check MONGODB_URI and Atlas IP whitelist |
| Invalid credentials | Wrong JWT secrets or corrupted token |
| Google Sign-in failed | Missing GOOGLE_CLIENT_ID/SECRET in .env |

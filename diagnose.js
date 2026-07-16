#!/usr/bin/env node
/**
 * Synq Diagnostic Script
 * Run with: node diagnose.js
 * This checks your setup and tells you exactly what's wrong
 */

const fs   = require('fs');
const path = require('path');
const http = require('http');

console.log('\n🔍 Synq Diagnostic Tool\n');
console.log('='.repeat(50));

// ── Check 1: .env file ────────────────────────────────
const envPath = path.join(__dirname, 'apps', 'server', '.env');
console.log('\n📁 Check 1: apps/server/.env file');
if (!fs.existsSync(envPath)) {
  console.log('  ❌ MISSING — This is your problem!');
  console.log('  Fix: Create apps/server/.env from apps/server/.env.example');
  console.log('  See SETUP.md for full instructions\n');
  process.exit(1);
} else {
  console.log('  ✓ Found');
}

// ── Check 2: Required env vars ─────────────────────────
const envContent = fs.readFileSync(envPath, 'utf8');
const requiredVars = [
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'SMTP_HOST',
  'SMTP_PASS',
];

console.log('\n📋 Check 2: Required environment variables');
let missingVars = [];
for (const v of requiredVars) {
  const line = envContent.split('\n').find(l => l.startsWith(v + '='));
  const value = line ? line.split('=').slice(1).join('=').trim() : '';
  if (!value || value.includes('your_') || value.includes('xxx') || value.includes('paste_')) {
    console.log(`  ❌ ${v} — not set or still has placeholder value`);
    missingVars.push(v);
  } else {
    console.log(`  ✓ ${v}`);
  }
}

if (missingVars.length > 0) {
  console.log('\n  ❌ Fix these variables in apps/server/.env first!');
}

// ── Check 3: .env.local ───────────────────────────────
const envLocalPath = path.join(__dirname, 'apps', 'web', '.env.local');
console.log('\n📁 Check 3: apps/web/.env.local file');
if (!fs.existsSync(envLocalPath)) {
  console.log('  ❌ MISSING — This is causing Network Error!');
  console.log('  Fix: Create apps/web/.env.local with these contents:');
  console.log('  NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1');
  console.log('  NEXT_PUBLIC_SOCKET_URL=http://localhost:5000');
} else {
  const localContent = fs.readFileSync(envLocalPath, 'utf8');
  if (!localContent.includes('NEXT_PUBLIC_API_URL')) {
    console.log('  ❌ NEXT_PUBLIC_API_URL missing from .env.local!');
  } else {
    console.log('  ✓ Found');
  }
}

// ── Check 4: Backend reachable ─────────────────────────
console.log('\n🌐 Check 4: Backend server reachable at localhost:5000');
const req = http.get('http://localhost:5000/health', (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('  ✓ Backend is running! Response:', body.substring(0, 60));
    console.log('\n✅ Backend is up. If login still fails, check MongoDB URI.\n');
  });
});
req.on('error', () => {
  console.log('  ❌ Backend NOT running on port 5000!');
  console.log('  Possible reasons:');
  console.log('    1. apps/server/.env is missing or has wrong values');
  console.log('    2. Server crashed on startup — check terminal for red errors');
  console.log('    3. MongoDB connection failed');
  console.log('\n  Fix: Look at the @synq/server terminal tab for error messages\n');
});
req.setTimeout(3000, () => {
  req.destroy();
  console.log('  ❌ Backend timed out — not running or port 5000 blocked\n');
});

// ── Check 5: JWT secret length ─────────────────────────
console.log('\n🔑 Check 5: JWT secret length (must be 32+ chars)');
const jwtLine = envContent.split('\n').find(l => l.startsWith('JWT_ACCESS_SECRET='));
if (jwtLine) {
  const secret = jwtLine.split('=').slice(1).join('=').trim();
  if (secret.length < 32) {
    console.log(`  ❌ JWT_ACCESS_SECRET too short (${secret.length} chars, need 32+)`);
    console.log('  Generate with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  } else {
    console.log(`  ✓ Length OK (${secret.length} chars)`);
  }
}

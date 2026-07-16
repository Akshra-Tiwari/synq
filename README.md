# Synq

> The professional network built exclusively for developers.

[![CI](https://github.com/yourusername/devconnect/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/devconnect/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)

---

## What is Synq?

Synq is a full-stack developer networking platform built as a production-grade monorepo. It lets developers build professional profiles, showcase projects, write posts, connect with peers, and chat in real time — all in a premium dark-themed interface.

**Live demo:** [devconnect.app](https://devconnect.app)  
**API docs:** [api.devconnect.app/health](https://api.devconnect.app/health)

---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| Next.js 15 (App Router) | Framework, SSR, routing |
| TypeScript | End-to-end type safety |
| Tailwind CSS | Utility-first styling |
| Zustand | Global state management |
| React Hook Form + Zod | Form validation |
| Socket.io Client | Real-time messaging |
| Axios | HTTP client with interceptors |

### Backend
| Technology | Purpose |
|-----------|---------|
| Express.js + TypeScript | REST API server |
| MongoDB + Mongoose | Primary database |
| Redis (ioredis) | Session cache |
| Socket.io | WebSocket server |
| Cloudinary | Image storage and transforms |
| Nodemailer | Transactional email |
| JWT + bcryptjs | Authentication |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Vercel | Frontend deployment |
| Render | Backend deployment |
| MongoDB Atlas | Managed database |
| Upstash Redis | Managed Redis |
| GitHub Actions | CI/CD pipelines |

---

## Features

### Authentication
- JWT access tokens (15 min) + refresh token rotation (7 days)
- Reuse detection — all sessions revoked on token theft
- Email verification with SHA-256 hashed tokens
- Forgot/reset password flow
- Multi-device session management (max 5 concurrent)

### Developer Profiles
- Profile photo + cover banner (Cloudinary, auto-cropped)
- Skills + tech stack tag editor
- Work experience + education CRUD with date validation
- Profile completion score (8-factor, computed on save)
- Open-to-work badge with availability status
- Social links (GitHub, LinkedIn, Twitter, portfolio)

### Feed & Posts
- Cursor-based infinite scroll (O(log n) at any dataset size)
- 4 post types: text, image, project-showcase, achievement
- Multi-image upload (up to 4 per post, Cloudinary)
- Threaded comments with 1-level nested replies
- Optimistic like toggle with server reconciliation
- Visibility control: public or connections-only

### Project Showcase
- Full project pages with screenshot carousel
- Up to 6 screenshots per project (Cloudinary, auto-thumbnail)
- Tech stack badges, GitHub + live demo links
- Status: in-progress / completed / archived
- Like + save with counters
- Gallery with search, filter by tech, sort by newest/popular/saved

### Connections
- Send / accept / reject / remove / withdraw
- Connection status cache per user (Zustand, invalidated on action)
- Mutual connections count
- Skill-matched suggestions (excludes existing connections)
- Pending request inbox with accept/decline inline

### Real-time Messaging
- Socket.io 1-to-1 chat with conversation rooms
- Multi-tab presence (`Map<userId, Set<socketId>>`)
- Typing indicators with 2.5s auto-stop
- Read receipts (double-tick: grey = delivered, indigo = read)
- Cursor-based message history (scroll up to load older)
- Soft-delete messages

### Notifications
- Real-time fan-out via Socket.io personal rooms
- 7 notification types (likes, comments, connections, project saves)
- Deduplication — re-surfaces existing on re-like
- 90-day TTL auto-purge (MongoDB TTL index, no cron needed)
- NotificationBell dropdown + full notifications page

### Dashboard
- Profile completion checklist with direct action links
- Stats: connections, posts, projects, profile views
- Recent posts preview
- Suggested connections (skill-overlap algorithm)
- Quick-action shortcuts

### Admin Panel
- Platform analytics: user growth, post trends, top skills/tech
- 14-day sparkline charts (pure SVG, zero dependencies)
- User management: search, filter, verify, promote/demote, delete
- Content moderation: hide/restore/delete reported posts
- Severity colour coding (amber ≥5 reports, red ≥10)

### Search
- Unified full-text search across users, posts, and projects
- MongoDB text indexes with field weighting
- Filter by entity type, autocomplete suggestions
- Relevance-sorted results

---

## Architecture

```
devconnect/
├── apps/
│   ├── web/                    # Next.js 15 frontend
│   │   ├── src/
│   │   │   ├── app/            # App Router pages
│   │   │   ├── components/     # UI components
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── lib/            # API clients, stores, utils
│   │   │   └── providers/      # React context providers
│   │   └── package.json
│   └── server/                 # Express.js backend
│       ├── src/
│       │   ├── modules/        # Feature-first vertical slices
│       │   │   ├── auth/
│       │   │   ├── users/
│       │   │   ├── posts/
│       │   │   ├── projects/
│       │   │   ├── connections/
│       │   │   ├── messages/
│       │   │   ├── notifications/
│       │   │   ├── admin/
│       │   │   └── search/
│       │   ├── middleware/     # Auth, validation, rate limiting
│       │   ├── services/       # Token, email, upload
│       │   ├── sockets/        # Socket.io server
│       │   └── utils/          # ApiError, ApiResponse, asyncHandler
│       └── package.json
├── .github/workflows/          # CI + deploy pipelines
├── docker-compose.yml          # Local MongoDB + Redis
├── turbo.json                  # Turborepo pipeline config
└── package.json                # Workspace root
```

### API Design

All endpoints follow `GET|POST|PATCH|DELETE /api/v1/{resource}` REST conventions.

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/users/:username
PATCH  /api/v1/users/profile
GET    /api/v1/posts              (cursor feed)
POST   /api/v1/posts
GET    /api/v1/projects
POST   /api/v1/projects
POST   /api/v1/connections/request/:userId
GET    /api/v1/messages
GET    /api/v1/notifications
GET    /api/v1/search?q=...
GET    /api/v1/admin/analytics    (admin only)
```

**Full surface:** 50 REST endpoints + Socket.io events

### Socket.io Events

```
Client → Server          Server → Client
─────────────────────    ─────────────────────────
conversation:join        message:new
conversation:leave       messages:read
typing:start             typing:start / typing:stop
typing:stop              user:online / user:offline
messages:read            notification:new
                         connection:request
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- Docker (for local MongoDB + Redis)
- Cloudinary account
- SMTP provider (Resend recommended)

### Local development

```bash
# 1. Clone
git clone https://github.com/yourusername/devconnect.git
cd devconnect

# 2. Start local services
docker compose up -d

# 3. Configure server
cp apps/server/.env.example apps/server/.env
# Edit with your Cloudinary, SMTP, and JWT secrets

# 4. Configure frontend
echo 'NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000' > apps/web/.env.local

# 5. Install all workspace packages
npm install

# 6. Run both apps in parallel
npm run dev
# → Next.js:  http://localhost:3000
# → Express:  http://localhost:5000
```

### Generate JWT secrets

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run twice — one for `JWT_ACCESS_SECRET`, one for `JWT_REFRESH_SECRET`.

---

## Deployment

### Frontend → Vercel

```bash
# Install Vercel CLI
npm i -g vercel

cd apps/web
vercel

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://api.devconnect.app/api/v1
# NEXT_PUBLIC_SOCKET_URL=https://api.devconnect.app
```

### Backend → Render

1. Create a **Web Service** on Render
2. Connect your GitHub repo
3. Set **Root Directory** to `apps/server`
4. Set **Build Command** to `npm install && npm run build`
5. Set **Start Command** to `node dist/server.js`
6. Add all environment variables from `.env.example`
7. Copy the **Deploy Hook URL** → add as `RENDER_DEPLOY_HOOK_URL` secret in GitHub

CI/CD then auto-deploys on every push to `main`.

### Database → MongoDB Atlas

1. Create a free M0 cluster
2. Add your Render service's IP to the Atlas IP allowlist (or use `0.0.0.0/0` for simplicity)
3. Create a database user
4. Copy the connection string → `MONGODB_URI`

---

## Security Practices

| Layer | Implementation |
|-------|---------------|
| Passwords | bcrypt cost factor 12 |
| Auth tokens | Short-lived JWT (15m) + refresh rotation |
| Refresh tokens | SHA-256 hashed in DB, reuse detection revokes all sessions |
| Email tokens | SHA-256 hashed, never stored plaintext |
| Rate limiting | 100/15m global, 10/15m auth, 5/15m password reset |
| Input validation | Zod on every endpoint (body + params + query) |
| File uploads | MIME allowlist, 10MB cap, Multer memory storage |
| CORS | Origin allowlist only |
| Headers | helmet.js (CSP, HSTS, X-Frame-Options) |
| Env validation | Zod schema at startup — server refuses to boot on missing vars |
| Admin routes | `authenticate + authorize('admin')` double-guard at router level |

---

## Project Stats

| Metric | Value |
|--------|-------|
| Total files | 155 |
| API endpoints | 50 |
| Database models | 9 |
| Phases | 10 |
| Socket events | 12 |
| Lines of TypeScript | ~12,000 |

---

## License

MIT © Synq

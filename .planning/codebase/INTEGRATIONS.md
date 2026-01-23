# External Integrations

**Analysis Date:** 2026-01-23

## APIs & External Services

**Concept2 Logbook Integration:**
- Service: Concept2 (Rower ergometer manufacturer)
- What it's used for: Sync erg test results, workout data from indoor rower logbook
- SDK/Client: Built-in HTTP client (fetch/axios)
- Auth: OAuth 2.0 (authorization code flow)
- Env vars: `CONCEPT2_CLIENT_ID`, `CONCEPT2_CLIENT_SECRET`, `CONCEPT2_REDIRECT_URI`, `CONCEPT2_WEBHOOK_SECRET`
- Implementation: `server/services/concept2Service.js`
- API Docs: https://log.concept2.com/api (dev: https://log-dev.concept2.com)
- Token Storage: Encrypted in database (`Concept2Auth` model)
- Webhook Support: Yes - receives updates on athlete workouts
- Features:
  - Fetch user workouts and erg test results
  - Retrieve athlete profile information
  - Support for both development and production Concept2 environments
  - Token refresh handling

**Strava Integration:**
- Service: Strava (fitness activity tracking platform)
- What it's used for: Activity syncing, water workout tracking, activity data import
- SDK/Client: Built-in HTTP client (fetch/axios)
- Auth: OAuth 2.0 (authorization code flow with refresh)
- Env vars: `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REDIRECT_URI`
- Implementation: `server/services/stravaService.js`
- API Endpoint: https://www.strava.com/api/v3
- Token Storage: Encrypted in database (`StravaAuth` model)
- Scopes: `read`, `activity:read_all`, `activity:write`
- Features:
  - Fetch activities from Strava
  - Support C2→Strava uploads (concept2 workouts to Strava)
  - Per-user sync toggle
  - Token refresh and expiration handling
  - Activity type filtering (rower, bike erg, etc.)

**Stripe Billing:**
- Service: Stripe (payment processing)
- What it's used for: Subscription billing, team plan management
- SDK/Client: stripe package v20.2.0
- Auth: API key-based
- Env vars: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_ENTERPRISE`, `STRIPE_WEBHOOK_SECRET`
- Implementation: `server/services/stripeService.js`
- Webhook Support: Yes - handles subscription events
- Plan Structure:
  - Free: 15 athletes, 1 coach, basic features
  - Starter: 30 athletes, 3 coaches, erg data + lineups
  - Pro: 100 athletes, 10 coaches, all features
  - Enterprise: Unlimited, custom features + API access
- Features:
  - Checkout session creation
  - Customer management
  - Subscription lifecycle management
  - Webhook event processing (created, updated, canceled, payment_failed, payment_succeeded)
  - Plan limits enforcement

**Ollama LLM (Optional):**
- Service: Ollama (local LLM inference engine)
- What it's used for: AI-powered features (CSV column mapping, lineup optimization, analysis)
- HTTP Client: axios
- Auth: None (local service)
- Env vars: `OLLAMA_URL` (default: http://localhost:11434), `OLLAMA_MODEL` (default: llama3.2)
- Implementation: `server/services/aiService.js`
- API Endpoint: `/api/generate`, `/api/tags`
- Features:
  - CSV column auto-mapping
  - Lineup optimization with reasoning
  - Data analysis and insights
  - Graceful fallback (returns null if unavailable)

## Data Storage

**Databases:**
- Type/Provider: PostgreSQL 12+
- Connection: Via `DATABASE_URL` environment variable
- Client: `pg` driver v8.17.1
- Adapter: Prisma ORM with `@prisma/adapter-pg` v7.2.0
- Singleton: `PrismaClient` instance in `server/db/connection.js`
- Connection Pooling: Configured via pg Pool
- Features:
  - Automatic connection pooling
  - Logging in development (queries, errors, warnings)
  - Multi-tenant with team isolation
  - Cascade deletions for data integrity

**File Storage:**
- Type: Local filesystem only
- Storage: `/path/to/headshots` and other data directories (env-configured)
- Limit: Configurable via `STORAGE_LIMIT_BYTES` (default: 20GB)
- Monitoring: `server/utils/storageMonitor.js`
- Used for:
  - Athlete headshots/profile images
  - CSV imports
  - Exported files
  - Generated reports

**Caching:**
- Type: None (or optional Redis via `REDIS_URL`)
- Note: Environment variable defined but not implemented in current codebase
- Implementation: Could be used for session caching, rate limit tracking

## Authentication & Identity

**Auth Provider:**
- Type: Custom JWT-based
- Implementation: `server/services/authService.js`, `server/middleware/auth.js`

**Token Management:**
- Access Token: JWT with configurable expiry (default: 15m)
- Refresh Token: Long-lived JWT stored in database and cookies
- Refresh Token Rotation: Implemented with family IDs for security
- Token Family ID: Tracks token rotation chains to detect compromised tokens
- Storage:
  - Access token: Memory (client-side)
  - Refresh token: HttpOnly cookie + database

**Supported Auth Methods:**
- Email + password (custom registration)
- Admin accounts with username + password (optional email-less login)
- OAuth 2.0 for Concept2 (athlete data sync)
- OAuth 2.0 for Strava (activity sync)

**Session Management:**
- JWT-based stateless sessions
- Cookie-based refresh tokens (HttpOnly, Secure flags)
- Team-based authorization
- Role-based access: OWNER, COACH, ATHLETE

**Token Models:**
- `RefreshToken` - Database table for tracking valid refresh tokens
- `User` - Primary user record
- `Concept2Auth` - OAuth tokens for Concept2
- `StravaAuth` - OAuth tokens for Strava

## Monitoring & Observability

**Error Tracking:**
- Type: None (no Sentry, Rollbar, etc.)
- Alternative: Structured logging to Winston

**Logs:**
- Framework: Winston 3.19.0
- Implementation: `server/utils/logger.js`
- Levels: error, warn, info, debug
- Output:
  - Console (development)
  - File-based logging (production ready)
  - Request logging via middleware
  - Error logging via global handler
- Features:
  - Structured logging with metadata
  - Error stack traces
  - Request duration tracking

**Request Logging:**
- Middleware: `requestLogger` from Winston
- Tracked: Method, URL, status code, response time

**Health Check:**
- Endpoint: `GET /health`
- Route: `server/routes/health.js`
- Returns: API and database status

## CI/CD & Deployment

**Hosting:**
- Platform: Self-hosted or cloud (Node.js server)
- Frontend: Built static files served by Express
- Backend: Node.js HTTP server on configured PORT
- Reverse Proxy: Nginx or similar (docs reference cloudflare, nginx)

**CI Pipeline:**
- Type: None detected (no GitHub Actions, CircleCI, etc.)
- Note: Could be configured externally

**Build & Start:**
- Development: `npm run dev:full` (frontend + backend concurrent)
- Production: `npm run build && npm start`
- Scripts:
  - `npm run build` - Vite frontend build
  - `npm start` - Production server with env file loading
  - `npm run server` - Backend server only
  - `npm run dev` - Frontend dev server only

**Database Migrations:**
- Tool: Prisma
- Dev: `npm run db:migrate`
- Reset: `npm run db:reset` (drops and reseeds)
- Studio: `npm run db:studio` (visual database editor)

## Environment Configuration

**Required env vars:**
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - Session token signing
- `JWT_REFRESH_SECRET` - Refresh token signing
- `ENCRYPTION_KEY` - Token encryption (AES-256-GCM)
- `CONCEPT2_CLIENT_ID`, `CONCEPT2_CLIENT_SECRET` - OAuth
- `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET` - OAuth
- `STRIPE_SECRET_KEY` - Payment processing
- `STRIPE_WEBHOOK_SECRET` - Webhook verification

**Optional env vars:**
- `OLLAMA_URL` - AI service endpoint
- `OLLAMA_MODEL` - Model name
- `REDIS_URL` - Redis caching (defined but unused)
- `LOG_LEVEL` - Logging verbosity
- `NODE_ENV` - Environment mode
- `PORT` - Server port
- `FRONTEND_URL` - CORS origin
- `APP_URL` - OAuth callback base

**Secrets location:**
- `.env` file (git-ignored, never committed)
- Template provided: `.env.example`
- Secrets are: JWT keys, OAuth credentials, Stripe keys, encryption key

## Webhooks & Callbacks

**Incoming (Server Receives):**

1. **Concept2 Webhooks**
   - Endpoint: `POST /api/v1/concept2/webhook`
   - Events: Athlete workout updates
   - Verification: CONCEPT2_WEBHOOK_SECRET
   - Handler: `server/routes/concept2.js`

2. **Stripe Webhooks**
   - Endpoint: `POST /api/v1/stripe/webhooks`
   - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
   - Verification: STRIPE_WEBHOOK_SECRET (signature validation)
   - Handler: `server/routes/subscriptions.js`

**Outgoing (Server Calls External):**

1. **OAuth Callbacks (received by server)**
   - Concept2: `CONCEPT2_REDIRECT_URI`
   - Strava: `STRAVA_REDIRECT_URI`

2. **Background Sync Tasks**
   - Concept2 auto-sync: Periodic fetch of new workouts
   - Strava auto-sync: Periodic fetch of new activities
   - Scheduled via: `server/services/backgroundSyncService.js`
   - Trigger: node-cron job scheduler
   - No outgoing webhooks (polling-based)

## Real-time Communication

**WebSocket (Socket.IO):**
- Purpose: Real-time collaboration, presence, lineup updates
- Library: socket.io v4.8.3 (server), socket.io-client v4.8.3 (client)
- Implementation: `server/socket/collaboration.js`
- Authentication: JWT token via socket handshake
- Features:
  - User presence tracking (who's online)
  - Real-time lineup updates
  - Cursor position tracking
  - Conflict resolution for collaborative editing
  - Optimistic updates with rollback
- CORS Origin:
  - Production: https://rowlab.net
  - Development: http://localhost:3001, http://localhost:3002, http://10.0.0.17:3001
- Ping Interval: 25s, Timeout: 60s

---

*Integration audit: 2026-01-23*

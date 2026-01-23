# Architecture

**Analysis Date:** 2026-01-23

## Pattern Overview

**Overall:** Three-tier full-stack architecture with separated concerns across frontend (React/Vite), backend (Express/Node), and database (PostgreSQL/Prisma).

**Key Characteristics:**
- **Monorepo structure** - Frontend and backend code in single repository
- **API-driven communication** - REST API v1 for frontend-backend interaction
- **Multi-tenant team isolation** - All resources scoped to teams via `activeTeamId`
- **State-driven UI** - Zustand for frontend state management with persistence middleware
- **Service-based backend** - Business logic encapsulated in service layer independent of routes
- **Database-first design** - Prisma ORM with PostgreSQL as source of truth

## Layers

**Frontend (Client):**
- Purpose: React SPA with responsive UI, real-time updates, and complex boat lineup visualization
- Location: `src/`
- Contains: Pages, components, hooks, stores, services
- Depends on: Backend API (`/api/v1`), local storage via Zustand persistence
- Used by: Browser clients (desktop/mobile)

**Backend (Server):**
- Purpose: REST API for team management, athlete data, lineup building, external integrations (Strava, Concept2)
- Location: `server/`
- Contains: Routes, middleware, services, database connection
- Depends on: PostgreSQL database, external APIs (Stripe, OpenAI, Strava, Concept2)
- Used by: Frontend, webhooks (Stripe, Concept2 sync)

**Database:**
- Purpose: Persistent storage for users, teams, athletes, lineups, workouts, integrations
- Type: PostgreSQL with Prisma adapter
- Location: `prisma/schema.prisma`
- Provides: Multi-tenant isolation via team_id foreign keys, audit trails, transactional integrity

## Data Flow

**Authentication Flow:**

1. User logs in via `POST /api/v1/auth/login`
2. Server generates access token (JWT, 15m expiry) and refresh token (7d expiry, HTTP-only cookie)
3. Frontend stores access token in memory (Zustand state, not persisted)
4. Refresh token stored in HTTP-only cookie by server automatically
5. On 401 response, frontend triggers refresh via token rotation
6. Token rotation invalidates old token, issues new one in same family (reuse detection)

**Request Authorization Pattern:**

```
Browser Request
  ↓
Add Authorization: Bearer <accessToken> header
  ↓
Express.js Route Handler
  ↓
authenticateToken middleware (verify JWT, extract user.id, user.activeTeamId)
  ↓
teamIsolation middleware (verify user.activeTeamId matches resource.teamId)
  ↓
Route handler calls service function with teamId parameter
  ↓
Service queries Prisma with teamId filter (enforces tenant isolation)
  ↓
Response returned to client
```

**Lineup Creation Flow:**

1. Frontend (`Dashboard` or `LineupBuilder` page) calls `createLineup()` from store
2. Store makes `POST /api/v1/lineups` with assignments array
3. Backend route validates and calls `createLineup(teamId, data)` service
4. Service creates lineup with nested assignments in single transaction
5. Service returns formatted lineup to route handler
6. Route returns `{ success: true, data: { lineup } }` to frontend
7. Frontend stores lineup in `lineupStore` via Zustand, updates UI

**External Data Sync Flow:**

1. Concept2 or Strava integration configured in settings
2. Frontend redirects to OAuth provider, receives auth code
3. Frontend calls `/api/v1/concept2/callback?code=...` or `/api/v1/strava/callback`
4. Backend exchanges code for tokens, stores encrypted in database
5. Background sync job (runs on production startup) queries athletes with active integrations
6. Service calls Concept2/Strava API to fetch workouts
7. Workouts persisted as `Workout` records, automatically linked to athletes
8. Frontend polls `/api/v1/workouts` to display latest workouts

**State Management:**

- **Frontend state** → Zustand stores in `src/store/` (authStore, lineupStore, etc.)
- **Persistence** → Zustand persist middleware saves to localStorage (auth tokens only, not sensitive data)
- **Server-side state** → Prisma maintains database state, Redis not used
- **Real-time updates** → WebSocket socket.io planned but not fully implemented; polling used currently

## Key Abstractions

**Zustand Store Pattern:**

Purpose: Centralized state management for features (auth, lineups, athletes, etc.)

Example: `src/store/authStore.js`
```javascript
const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      teams: [],
      activeTeamId: null,
      accessToken: null,
      login: async (email, password) => { /* API call */ },
      logout: () => { /* clear state */ },
    }),
    { name: 'auth-store' } // persists to localStorage
  )
);
```

**Service Pattern (Backend):**

Purpose: Reusable business logic independent of HTTP layer

Location: `server/services/*Service.js`

Pattern:
```javascript
export async function createLineup(teamId, data) {
  // Validate data
  // Query database with Prisma
  // Apply business logic (calculations, transformations)
  // Return formatted result
}
```

Services are stateless functions that accept teamId as first parameter to enforce multi-tenant isolation.

**Middleware Chain (Express):**

Purpose: Cross-cutting concerns applied to routes

Pattern:
```javascript
router.get('/:id',
  authenticateToken,    // Verify JWT, attach user
  teamIsolation,        // Verify user.activeTeamId matches resource
  [param('id').isUUID()], // Input validation
  validateRequest,      // Check validation errors
  async (req, res) => { /* route handler */ }
);
```

**API Response Format:**

All routes return standardized response:
```javascript
{
  success: true,
  data: { /* resource or array */ }
}
// or
{
  success: false,
  error: { code: 'ERROR_CODE', message: 'Human readable message' }
}
```

## Entry Points

**Frontend Entry Point:**
- Location: `src/index.jsx`
- Invoked by: Browser loading `index.html`
- Renders: React app root into `#root` div
- Loads: `src/App.jsx` which sets up BrowserRouter

**App Routing:**
- Location: `src/App.jsx`
- Pattern: Uses React Router v6 with lazy-loaded pages and Suspense
- Public routes: `/` (landing), `/login`, `/register`, `/invite/:code`
- Protected routes: All dashboard routes checked by `useAuth()` hook
- Pages loaded: From `src/pages/` directory

**Backend Entry Point:**
- Location: `server/index.js`
- Started: `npm run server` or `npm start` in production
- Port: 3002 (configurable via `PORT` env var)
- Responsibilities:
  - Creates Express app instance
  - Applies middleware (security headers, CORS, rate limiting, logging)
  - Mounts all route handlers
  - Serves static files in production
  - Starts background sync service (production only)
  - Health checks on startup

**Backend Route Initialization:**
```javascript
// server/index.js imports and mounts routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/teams', apiLimiter, teamRoutes);
app.use('/api/v1/lineups', apiLimiter, lineupRoutesV1);
// ... 30+ other route files
```

**Database Initialization:**
- On first run: `npm run db:migrate` runs Prisma migrations
- On development: `npm run db:seed` populates admin user and sample data
- Connection: Single Prisma client singleton in `server/db/connection.js`

## Error Handling

**Strategy:** Standardized error responses with error codes for frontend handling

**Backend Error Pattern:**

```javascript
try {
  const result = await service.doSomething();
  res.json({ success: true, data: result });
} catch (error) {
  logger.error('Operation failed', { error: error.message, stack: error.stack });
  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      code: error.code || 'SERVER_ERROR',
      message: error.message,
      ...(NODE_ENV === 'development' && { stack: error.stack })
    }
  });
}
```

**Frontend Error Pattern:**

Components use `useAuth()` hook to check `authStore.error` and `isLoading`:
```javascript
const { error, isLoading, login } = useAuthStore();

// Display error via toast or error state
if (error) {
  showErrorToast(error);
}
```

**Special Error Cases:**

- **401 Unauthorized**: Token expired/invalid → frontend calls `refreshToken()` → retries original request
- **403 Forbidden**: User lacks role/permission → display "Access Denied" message
- **ValidationError**: Input validation failed → return 400 with field-level errors
- **NotFound (404)**: Resource belongs to different team or doesn't exist

## Cross-Cutting Concerns

**Logging:**

- Frontend: Simple `console.log/error` for development (no structured logging)
- Backend: Winston logger in `server/utils/logger.js`
  - Request logging middleware logs all requests
  - Error logging middleware captures exceptions
  - Services use logger for business logic events
  - Logs written to console and `logs/` directory

**Validation:**

- Backend: express-validator middleware validates all inputs
  - Email validation, UUID validation, boolean parsing
  - Custom validation functions for business rules (athlete names, etc.)
  - Errors collected and returned as 400 response
- Frontend: Form libraries (React Hook Form implied in some pages) with basic field validation

**Authentication:**

- Implemented via JWT access tokens + refresh token rotation
- Tokens include `sub` (user ID), `email`, `activeTeamId`, `activeTeamRole`
- Middleware `authenticateToken` required on all protected routes
- Middleware `teamIsolation` enforces user can only access their team's resources
- Refresh tokens use family-based reuse detection (revokes entire session family if replay detected)

**Rate Limiting:**

- `globalLimiter` (15 requests/min per IP): Applies to all routes
- `authLimiter` (5 requests/min per IP): Auth endpoints (login, register)
- `aiLimiter` (2 requests/min per IP): AI-powered endpoints
- `apiLimiter` (30 requests/min per IP): Standard API endpoints
- Applied via express-rate-limit middleware

**CORS:**

- Configured in `server/middleware/security.js`
- Allows frontend on same domain or whitelisted origins
- Credentials (cookies) allowed for auth flow

**Security Headers:**

- Helmet.js enforces HTTP security headers
- CSP, X-Frame-Options, X-Content-Type-Options, etc.

---

*Architecture analysis: 2026-01-23*

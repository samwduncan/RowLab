# Codebase Structure

**Analysis Date:** 2026-01-23

## Directory Layout

```
/home/swd/RowLab/
├── src/                          # Frontend React application
│   ├── index.jsx                 # React DOM root
│   ├── App.jsx                   # Main router component
│   ├── App.css                   # Global styles
│   ├── pages/                    # Route page components
│   ├── components/               # Reusable UI components
│   ├── store/                    # Zustand state stores
│   ├── hooks/                    # Custom React hooks
│   ├── services/                 # Frontend API clients
│   ├── utils/                    # Utility functions
│   ├── types/                    # TypeScript/JSDoc types
│   ├── theme/                    # Design tokens and theme config
│   ├── styles/                   # CSS/Tailwind styles
│   ├── layouts/                  # Layout wrapper components
│   ├── context/                  # React Context providers (unused - prefer stores)
│   └── test/                     # Shared test utilities
├── server/                       # Backend Express application
│   ├── index.js                  # Server entry point
│   ├── routes/                   # Express route handlers
│   ├── services/                 # Business logic (stateless)
│   ├── middleware/               # Express middleware
│   ├── db/                       # Database connection
│   ├── utils/                    # Server utilities (logging, etc.)
│   ├── prompts/                  # AI prompt templates
│   ├── socket/                   # WebSocket handlers (WIP)
│   └── tests/                    # Server tests
├── prisma/                       # Database schema and migrations
│   ├── schema.prisma             # Data model definitions
│   ├── migrations/               # Applied database migrations
│   └── seed.js                   # Database seeding script
├── public/                       # Static assets
│   └── images/                   # Product images, logos
├── data/                         # Data files
│   └── athletes.csv              # Predefined athlete list
├── .planning/                    # GSD planning documents
├── vite.config.ts                # Frontend build configuration
├── vitest.config.ts              # Test runner configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
├── .eslintrc.cjs                 # ESLint configuration
├── .prettierrc                   # Code formatter configuration
├── .env                          # Environment variables (local)
├── .env.example                  # Template for environment variables
├── package.json                  # Dependencies and scripts
└── docker-compose.yml            # Local database setup
```

## Directory Purposes

**src/ (Frontend Root):**
- Purpose: React Single Page Application source code
- Contains: All frontend components, pages, state management, styling
- Key files: `index.jsx` (entry), `App.jsx` (router), `App.css` (globals)

**src/pages/:**
- Purpose: Full-page components that map to routes
- Contains: Dashboard, AthletesPage, LineupBuilder, SettingsPage, etc.
- Naming: PascalCase with "Page" suffix (e.g., `Dashboard.jsx`, `AthletesPage.jsx`)
- Each page typically uses multiple components from `src/components/`

**src/components/:**
- Purpose: Reusable UI components and feature-specific component groups
- Structure: Organized into subdirectories by feature/domain
- Key subdirectories:
  - `ui/` - Basic components (Button, Badge, Card, Input)
  - `Layout/` - Page layout wrappers (AppLayout, DashboardLayout)
  - `Dashboard/` - Dashboard-specific components
  - `Assignment/` - Lineup assignment UI
  - `Concept2/` - Concept2 integration components
  - `Strava/` - Strava integration components (location inferred)
  - `Charts/` - Data visualization components
  - `Auth/` - Authentication forms
  - `CommandPalette/` - Command palette/search
  - `compound/` - Composite components using multiple primitives
  - `domain/` - Domain-specific business logic components (inferred)

**src/store/:**
- Purpose: Zustand state management stores for features
- Pattern: One store per feature (authStore, lineupStore, athleteStore, etc.)
- Format: Exported factory function using `create()` and `persist()` middleware
- Examples:
  - `authStore.js` - User authentication, team switching
  - `lineupStore.js` - Lineup state with undo/redo
  - `ergDataStore.js` - Erg test data
  - `settingsStore.js` - User preferences
  - `trainingPlanStore.js` - Training plan builder state

**src/hooks/:**
- Purpose: Custom React hooks for shared stateful logic
- Examples:
  - `useAuth.js` - Convenience wrapper around authStore
  - `useMediaQuery.js` - Responsive design queries
  - `useKeyboardShortcuts.ts` - Global shortcut handling
  - `useCollaboration.ts` - Real-time collaboration (WIP)
  - `useUndoRedo.ts` - Undo/redo functionality

**src/services/:**
- Purpose: Frontend API client functions (not React hooks)
- Examples:
  - `aiService.js` - OpenAI API calls
  - `concept2Service.js` - Concept2 API integration
  - `stravaService.js` - Strava API integration
  - `lineupExportService.js` - Export lineups to PDF/CSV
  - `lineupOptimizer.ts` - Lineup optimization algorithms

**src/utils/:**
- Purpose: Pure utility functions (no React dependency)
- Examples:
  - `api.js` - Fetch wrapper with error handling
  - `formatters.js` - Date, number, text formatting
  - `validators.js` - Input validation functions

**src/theme/:**
- Purpose: Design system tokens, colors, typography
- Contains:
  - `tokens/` - CSS custom properties definitions
  - Theme configuration for styled components

**src/test/:**
- Purpose: Shared test utilities and mock factories
- Contains:
  - `utils/` - Test helper functions
  - `api/` - Mock API responses
  - `stores/` - Store test setup
  - `components/` - Component test utilities

**server/ (Backend Root):**
- Purpose: Express.js REST API backend
- Contains: Route handlers, business logic, database access

**server/routes/:**
- Purpose: Express route handlers organized by resource
- Structure:
  - `v1/` - New multi-tenant API endpoints
    - `lineups.js` - Lineup CRUD
    - `shells.js` - Boat shell configuration
  - Root level - Legacy/shared endpoints
    - `auth.js` - Authentication (shared between v1 and legacy)
    - `athletes.js` - Athlete management
    - `teams.js` - Team management
    - `concept2.js` - Concept2 OAuth callbacks and data
    - `strava.js` - Strava OAuth callbacks and data
    - `ai.js` - AI-powered features (lineup suggestions, analysis)
    - `subscriptions.js` - Stripe webhook handling
- Pattern: Each route file exports `express.Router()` with endpoint definitions

**server/services/:**
- Purpose: Business logic encapsulated from HTTP layer
- Structure: One service per domain
- Examples (30+ services):
  - `lineupService.js` - Lineup creation, updates, exports
  - `athleteService.js` - Athlete CRUD, name parsing
  - `concept2Service.js` - Concept2 API interaction, athlete sync
  - `stravaService.js` - Strava API interaction, workout sync
  - `aiLineupOptimizerService.js` - AI-powered lineup generation
  - `eloRatingService.js` - Athlete performance rating
  - `marginCalculationService.js` - Race prediction margins
  - `seatRaceService.js` - Seat race analysis and scoring
  - `subscriptionService.js` - Billing via Stripe
- Pattern: Pure functions accepting `teamId` as first param, querying Prisma, returning formatted data

**server/middleware/:**
- Purpose: Express middleware for cross-cutting concerns
- Files:
  - `auth.js` - JWT verification, team isolation, role checking
  - `security.js` - CORS, rate limiting, security headers
  - `validation.js` - Input validation chains
  - `planLimits.js` - Plan-based feature access control

**server/db/:**
- Purpose: Database connection and initialization
- Files:
  - `connection.js` - Prisma client singleton with PostgreSQL adapter

**server/utils/:**
- Purpose: Shared utility functions
- Examples:
  - `logger.js` - Winston logger configuration
  - `storageMonitor.js` - Disk space monitoring
  - `tokenService.js` - JWT generation, refresh token rotation

**prisma/:**
- Purpose: Database schema and migration history
- Files:
  - `schema.prisma` - Data models (40+ models)
  - `migrations/` - Historical migrations
  - `seed.js` - Initial data population

**public/, data/:**
- Purpose: Static assets served by server
- `public/images/` - UI images, logos
- `data/athletes.csv` - Predefined athlete list for import

**.planning/codebase/:**
- Purpose: GSD documentation generated by codebase mapper
- Files:
  - `ARCHITECTURE.md` - Architecture patterns and layers
  - `STRUCTURE.md` - This file
  - `STACK.md` - Technology stack
  - `TESTING.md` - Testing patterns
  - `CONVENTIONS.md` - Code conventions
  - `CONCERNS.md` - Technical debt and issues

## Key File Locations

**Entry Points:**
- `src/index.jsx` - Frontend entry point
- `src/App.jsx` - Frontend router configuration
- `server/index.js` - Backend entry point and Express setup
- `vite.config.ts` - Frontend build configuration

**Configuration:**
- `.env` - Runtime environment variables (DATABASE_URL, JWT_SECRET, API keys, etc.)
- `.env.example` - Template for required variables
- `vite.config.ts` - Frontend build, path aliases, proxy configuration
- `vitest.config.ts` - Test runner configuration
- `tsconfig.json` - TypeScript compiler options
- `tailwind.config.js` - Tailwind CSS theme and plugin configuration
- `prisma/schema.prisma` - Database schema definition

**Core Logic:**
- `server/services/` - All business logic implementations
- `src/store/` - All state management
- `src/components/` - All reusable UI

**Testing:**
- `src/store/*.test.ts` - Store tests
- `src/test/api/` - API mock tests
- `server/tests/` - Backend tests
- `vitest.config.ts` - Test configuration

## Naming Conventions

**Files:**
- Components: PascalCase with `.jsx` extension (e.g., `LineupBuilder.jsx`, `AthleteCard.jsx`)
- Pages: PascalCase with "Page" suffix (e.g., `Dashboard.jsx`, `SettingsPage.jsx`)
- Services: camelCase with "Service" suffix (e.g., `lineupService.js`, `authService.js`)
- Stores: camelCase with "Store" suffix (e.g., `authStore.js`, `lineupStore.js`)
- Tests: Same name as source file with `.test.ts` or `.test.jsx` suffix
- Utilities: camelCase (e.g., `formatters.js`, `validators.js`)
- Routes: camelCase plural or plural resource name (e.g., `athletes.js`, `lineups.js`)

**Directories:**
- Feature directories: PascalCase (e.g., `components/Dashboard/`, `components/Concept2/`)
- Internal directories: lowercase (e.g., `src/store/`, `server/services/`, `prisma/migrations/`)

**Functions:**
- Service functions: camelCase verb + noun (e.g., `createLineup()`, `getAthletes()`, `deleteTeam()`)
- Hook functions: camelCase with "use" prefix (e.g., `useAuth()`, `useMediaQuery()`)
- Component functions: PascalCase (e.g., `Dashboard()`, `Button()`)
- Utility functions: camelCase (e.g., `formatDate()`, `parseCSV()`)

**Variables/Constants:**
- State variables: camelCase (e.g., `activeTeamId`, `lineupAssignments`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_URL`, `MAX_ATHLETES_PER_BOAT`)
- Boolean variables: prefixed with "is" or "has" (e.g., `isLoading`, `hasError`, `isCoxswain`)

**Type Names:**
- TypeScript types: PascalCase (e.g., `type Athlete = { ... }`)
- Interfaces: PascalCase with "I" prefix optional (e.g., `interface UserResponse { ... }`)

## Where to Add New Code

**New Feature:**
- Primary code: `src/pages/NewFeaturePage.jsx` (or nested in `pages/` subdir)
- Store: `src/store/newFeatureStore.js` (if state needed)
- Components: `src/components/NewFeature/` (create directory for feature)
- Tests: `src/test/stores/newFeatureStore.test.ts` or `src/test/components/NewFeature/`
- Backend route: `server/routes/newFeature.js`
- Backend service: `server/services/newFeatureService.js`

**New Component/Module:**
- Reusable UI component: `src/components/ui/NewComponent.jsx`
- Feature-specific component: `src/components/FeatureName/NewComponent.jsx`
- Test: Alongside component with `.test.jsx` suffix
- Export: Add to `src/components/ui/index.js` barrel file if public

**New Page:**
- File: `src/pages/NewPageName.jsx` (PascalCase + Page suffix)
- Route: Add to `src/App.jsx` with React Router lazy loading
- Styles: Use Tailwind classes (preferred) or `src/styles/` for complex layouts

**Utilities/Helpers:**
- Shared helpers: `src/utils/helperName.js`
- API clients: `src/services/serviceName.js`
- Custom hooks: `src/hooks/useHookName.js`
- Backend utilities: `server/utils/utilityName.js`

**Database Changes:**
- Schema changes: Edit `prisma/schema.prisma`
- Create migration: `npm run db:migrate -- --name descriptive_name`
- Seeders: Update `prisma/seed.js` for sample data

**API Endpoints:**
- V1 endpoints: Create in `server/routes/v1/resourceName.js`
- Service logic: `server/services/resourceNameService.js`
- Middleware: Reuse existing auth/validation in `server/middleware/`

## Special Directories

**src/components/compound/:**
- Purpose: Composite components that combine multiple UI primitives
- Generated: No (maintained by hand)
- Committed: Yes - part of source code
- Examples: Complex form layouts, multi-step wizards

**src/components/domain/:**
- Purpose: Domain-specific business logic components (internal structure inferred)
- Generated: No
- Committed: Yes
- Pattern: Encapsulate feature-specific UI and state

**src/layouts/:**
- Purpose: Page layout wrapper components
- Contains: AppLayout (main authenticated layout with sidebar/nav)
- Pattern: Accept `{children}` to wrap page content

**server/prompts/:**
- Purpose: AI prompt templates for Claude/Phi models
- Contains: Templates for lineup optimization, race prediction analysis
- Pattern: Plain text or template strings for LLM consumption

**server/socket/:**
- Purpose: WebSocket (Socket.io) handlers (WIP - not fully implemented)
- Pattern: Real-time updates planned but currently using polling
- Committed: Yes (framework in place)

**logs/:**
- Purpose: Server runtime logs
- Generated: Yes (auto-created)
- Committed: No (in .gitignore)

**dist/:**
- Purpose: Built frontend distribution
- Generated: Yes (`npm run build`)
- Committed: No (in .gitignore)
- Output location: Served by Express in production mode

**node_modules/:**
- Purpose: Installed dependencies
- Generated: Yes (`npm install`)
- Committed: No (in .gitignore)

**coverage/:**
- Purpose: Test coverage reports
- Generated: Yes (`npm run test:coverage`)
- Committed: No (in .gitignore)

---

*Structure analysis: 2026-01-23*

# Technology Stack

**Analysis Date:** 2026-01-23

## Languages

**Primary:**
- TypeScript 5.9.3 - Frontend code and type safety
- JavaScript (ES2022) - Backend Node.js server and database seeding

**Secondary:**
- SQL - PostgreSQL database queries (via Prisma ORM)
- JSON - Configuration files and data serialization

## Runtime

**Environment:**
- Node.js 22.21.0 - Backend runtime
- Browser (modern: Chrome, Firefox, Safari, Edge) - Frontend runtime

**Package Manager:**
- npm 11.7.0
- Lockfile: package-lock.json (present)

## Frameworks

**Frontend:**
- React 18.2.0 - UI component framework
- React Router DOM 6.30.2 - Client-side routing
- Vite 5.0.11 - Build tool and dev server
- TypeScript 5.9.3 - Static type checking

**Backend:**
- Express 4.18.2 - HTTP server and API routing
- Prisma 7.2.0 - ORM for PostgreSQL
- Socket.IO 4.8.3 - WebSocket server for real-time features
- Socket.IO Client 4.8.3 - WebSocket client

**Testing:**
- Vitest 4.0.16 - Unit and integration test framework
- Testing Library React 16.3.1 - Component testing utilities
- Testing Library User Event 14.6.1 - User interaction simulation
- jsdom 27.4.0 - DOM implementation for testing

**Build/Dev:**
- PostCSS 8.4.33 - CSS processing
- Tailwind CSS 3.4.1 - Utility-first CSS framework
- Autoprefixer 10.4.17 - CSS vendor prefixes
- Vite Coverage (v8) 4.0.16 - Code coverage reporting
- Rollup Plugin Visualizer 6.0.5 - Bundle analysis
- Concurrently 8.2.0 - Run multiple commands in parallel

## Key Dependencies

**UI Components & Animation:**
- Lucide React 0.400.0 - Icon library
- Phosphor Icons React 2.1.10 - Alternative icon set
- Framer Motion 11.18.2 - Animation library
- React Focus Lock 2.13.7 - Focus management for accessibility

**3D Rendering:**
- Three.js 0.160.1 - WebGL 3D graphics library
- @react-three/fiber 8.15 - React renderer for Three.js
- @react-three/drei 9.88 - Utilities for React Three Fiber

**Data Visualization:**
- Recharts 2.10.3 - Composable charting library

**Drag & Drop:**
- @dnd-kit/core 6.1.0 - Headless drag-and-drop library
- @dnd-kit/sortable 8.0.0 - Sortable UI implementation
- @dnd-kit/utilities 3.2.2 - Utility functions

**State Management:**
- Zustand 4.4.7 - Lightweight state management
- Context API (built-in React) - Application state

**Data Validation & Parsing:**
- Zod 4.3.4 - TypeScript-first schema validation
- CSV Parse 6.1.0 - CSV parsing library
- PapaParse 5.4.1 - CSV/JSON parser
- Fit File Parser 2.2.4 - FIT file format parsing

**Export & PDF:**
- jsPDF 3.0.4 - PDF generation
- html2canvas 1.4.1 - HTML to canvas rendering

**Security & Authentication:**
- JWT (jsonwebtoken 9.0.3) - Token-based authentication
- bcryptjs 3.0.3 - Password hashing
- Helmet 8.1.0 - HTTP headers security middleware
- CORS 2.8.5 - Cross-Origin Resource Sharing middleware
- Express Rate Limit 8.2.1 - Rate limiting
- Express Validator 7.3.1 - Input validation middleware
- Cookie Parser 1.4.7 - Cookie middleware

**HTTP & Data:**
- Axios 1.13.2 - HTTP client (used for external API calls)
- Stripe 20.2.0 - Payment processing SDK
- stripe-gradient 1.0.1 - Stripe UI component

**Database:**
- PostgreSQL (pg 8.17.1) - Database driver
- @prisma/client 7.2.0 - Prisma client
- @prisma/adapter-pg 7.2.0 - PostgreSQL adapter for Prisma

**Utilities:**
- UUID 13.0.0 - UUID generation
- Dotenv 17.2.3 - Environment variable loading
- Node-Cron 4.2.1 - Job scheduling for background tasks

**Logging:**
- Winston 3.19.0 - Structured logging

## Configuration

**Environment:**
- Loaded via `--env-file=.env` flag in package.json scripts
- Located at project root (`.env` file)
- Example template: `.env.example`

**Key Configs Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing key
- `JWT_REFRESH_SECRET` - Refresh token signing key
- `ENCRYPTION_KEY` - AES-256-GCM encryption for OAuth tokens
- `CONCEPT2_CLIENT_ID`, `CONCEPT2_CLIENT_SECRET`, `CONCEPT2_REDIRECT_URI` - OAuth
- `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REDIRECT_URI` - OAuth
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_PRICE_*` - Stripe price IDs for subscription tiers
- `STRIPE_WEBHOOK_SECRET` - Webhook signature verification
- `OLLAMA_URL` - LLM service endpoint (optional)
- `OLLAMA_MODEL` - Model name for AI features (optional)
- `PORT` - Server port (default 3002)
- `NODE_ENV` - Environment mode (development/production)

**Build Configs:**
- `vite.config.ts` - Frontend build configuration
- `vitest.config.ts` - Test framework configuration
- `tsconfig.json` - TypeScript compiler options
- `tailwind.config.js` - Tailwind CSS theme configuration
- `postcss.config.js` - PostCSS plugins
- `.prettierrc` - Code formatter options (semi: true, printWidth: 100, singleQuote: true)
- `.eslintrc.cjs` - Linting rules

**Database:**
- `prisma/schema.prisma` - Database schema and models
- Migrations in `prisma/migrations/`
- Seed script: `prisma/seed.js`

## Platform Requirements

**Development:**
- Node.js 22.x (or compatible version per `.nvmrc`)
- npm 11.x
- PostgreSQL 12+ (local or remote)
- (Optional) Ollama service for AI features
- (Optional) Stripe account for payment testing
- (Optional) Concept2 and Strava developer accounts for OAuth

**Production:**
- Node.js 22.x LTS
- PostgreSQL 12+ (managed or self-hosted)
- Environment with HTTPS/TLS
- ENCRYPTION_KEY must be set (64-char hex string)
- Stripe account (live mode for payments)
- Concept2 and Strava OAuth credentials for production domains

---

*Stack analysis: 2026-01-23*

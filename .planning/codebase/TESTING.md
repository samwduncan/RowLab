# Testing Patterns

**Analysis Date:** 2026-01-23

## Test Framework

**Runner:**
- Framework: Vitest 4.0.16
- Config: `vitest.config.ts` at project root
- Environment: jsdom (for DOM-dependent tests)
- Globals: true (no need to import describe, it, expect)

**Assertion Library:**
- Testing Library (React Testing Library)
- Vitest built-in expect() compatible with jest

**Run Commands:**
```bash
npm run test              # Run tests in watch mode
npm run test:run         # Run tests once (CI mode)
npm run test:coverage    # Run tests with coverage report
npm run test:ui          # Open test UI dashboard
```

## Test File Organization

**Location:**
- Co-located with source files
- Pattern: `[name].test.ts` or `[name].spec.ts` suffix
- Both `src/` and `server/` tests run with same configuration

**Naming:**
- Test files for stores: `*.test.ts` (e.g., `lineupStore.test.ts`, `authStore.test.ts`)
- Test files for API/server: `.test.js` (e.g., `encryption.test.js`, `concept2Service.test.js`)

**Structure:**
```
src/
├── test/                      # Shared test utilities
│   ├── setup.ts              # Global test setup (mocks, cleanup)
│   └── api/
│       └── auth.test.ts       # API endpoint tests
├── store/
│   ├── lineupStore.js
│   ├── lineupStore.test.ts    # Co-located test
│   └── authStore.test.ts
server/
├── tests/
│   ├── setup.js              # Server test setup
│   ├── encryption.test.js
│   ├── concept2Service.test.js
│   └── ...
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('FeatureName', () => {
  // Feature-level suite

  describe('Functionality Group', () => {
    // Nested describe for related tests

    it('should do something specific', () => {
      // Test body
      expect(result).toBe(expected);
    });
  });
});
```

**Patterns:**

Store tests use `getState()` and `setState()`:
```typescript
// From src/store/lineupStore.test.ts
describe('LineupStore', () => {
  beforeEach(() => {
    const store = useLineupStore.getState();
    store.clearLineup();
    store.clearHistory?.();
    store.setAthletes(mockAthletes);
    store.setBoatConfigs([mockBoatConfig]);
  });

  it('should add a boat to activeBoats', () => {
    const store = useLineupStore.getState();
    expect(store.activeBoats).toHaveLength(0);

    act(() => {
      store.addBoat(mockBoatConfig);
    });

    const updatedStore = useLineupStore.getState();
    expect(updatedStore.activeBoats).toHaveLength(1);
  });
});
```

API/fetch tests mock `fetch` globally:
```typescript
// From src/test/api/auth.test.ts
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Auth API', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should return user and token on successful login', async () => {
    const mockResponse = {
      success: true,
      data: { user: { ... }, accessToken: '...' },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const response = await fetch(`/api/v1/auth/login`, { /* ... */ });
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
```

## Mocking

**Framework:** Vitest `vi` (vi.fn(), vi.mock(), etc.)

**Patterns:**

Global mocks in `src/test/setup.ts`:
```typescript
// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock ResizeObserver
const mockResizeObserver = vi.fn();
mockResizeObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.ResizeObserver = mockResizeObserver as unknown as typeof ResizeObserver;
```

Fetch mocking pattern:
```typescript
mockFetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({ success: true, data: { ... } }),
});

// or for error responses
mockFetch.mockResolvedValueOnce({
  ok: false,
  status: 401,
  json: async () => ({ success: false, error: { code: 'INVALID_CREDENTIALS' } }),
});
```

**What to Mock:**
- External APIs (fetch calls)
- Browser APIs (matchMedia, IntersectionObserver, ResizeObserver)
- Environment variables (process.env.ENCRYPTION_KEY)
- Store state (using vi.spyOn or direct mocking)

**What NOT to Mock:**
- Testing Library components (use render from @testing-library/react)
- Store actions (test them with real store methods)
- DOM utilities (test.expect() assertions)
- Internal service functions (test with real implementations)

## Fixtures and Factories

**Test Data:**
Mock data defined at top of test file with `const mockXxx`:

```typescript
// From src/store/lineupStore.test.ts
const mockBoatConfig = {
  id: 1,
  name: 'Varsity 8+',
  numSeats: 8,
  hasCoxswain: true,
};

const mockAthletes = [
  { id: 1, lastName: 'Smith', firstName: 'John', country: 'USA', side: 'P' as const },
  { id: 2, lastName: 'Johnson', firstName: 'Mike', country: 'USA', side: 'S' as const },
  { id: 3, lastName: 'Williams', firstName: 'Bob', country: 'CAN', side: 'B' as const },
];
```

API response fixtures:
```typescript
// From src/test/api/auth.test.ts
const mockResponse = {
  success: true,
  data: {
    user: { id: '1', email: 'test@test.com', name: 'Test User' },
    teams: [{ id: 'team1', name: 'Team 1' }],
    activeTeamId: 'team1',
    accessToken: 'jwt-token-123',
  },
};
```

**Location:**
- Fixtures defined in test file itself (not in separate directory)
- Shared setup in `src/test/setup.ts` for browser mocks

## Coverage

**Requirements:** No explicit target set (coverage is optional)

**View Coverage:**
```bash
npm run test:coverage
# Generates HTML report in coverage/ directory
# Provider: v8
# Excludes: node_modules/, src/test/, **/*.d.ts, **/*.config.*, **/types/*
```

## Test Types

**Unit Tests:**
- Scope: Individual store slices, utilities, hooks
- Approach: Test single function or method in isolation with mock dependencies
- Example: `lineupStore.test.ts` tests boat management and athlete assignment independently
- Location: Co-located with source (`store/lineupStore.test.ts`)

**Integration Tests:**
- Scope: Multiple store actions or API interactions
- Approach: Test workflows combining multiple functions
- Example: `authStore.test.ts` tests login flow (login → token storage → state update)
- Location: In `src/test/api/auth.test.ts` for API integration tests

**E2E Tests:**
- Framework: Not currently used
- Status: Not detected in codebase

## Common Patterns

**Async Testing:**
```typescript
// Using await with fetch
it('should return user and token on successful login', async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ success: true, data: { ... } }),
  });

  const response = await fetch(`/api/v1/auth/login`, { /* ... */ });
  const data = await response.json();
  expect(data.success).toBe(true);
});

// Using Zustand act() for store updates
it('should add a boat to activeBoats', () => {
  const store = useLineupStore.getState();
  act(() => {
    store.addBoat(mockBoatConfig);
  });

  const updatedStore = useLineupStore.getState();
  expect(updatedStore.activeBoats).toHaveLength(1);
});
```

**Error Testing:**
```typescript
it('should return error for invalid credentials', async () => {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 401,
    json: async () => ({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
    }),
  });

  const response = await fetch(`/api/v1/auth/login`, { /* ... */ });
  expect(response.ok).toBe(false);
  const data = await response.json();
  expect(data.error.code).toBe('INVALID_CREDENTIALS');
});
```

**Store State Verification:**
```typescript
// Check initial state
it('should have null user initially', () => {
  const { user } = useAuthStore.getState();
  expect(user).toBeNull();
});

// Check state after action
it('should set user after successful login', async () => {
  mockFetch.mockResolvedValueOnce({ /* ... */ });

  const { login } = useAuthStore.getState();
  await login('test@test.com', 'password');

  const { user, accessToken, isAuthenticated } = useAuthStore.getState();
  expect(user).toEqual({ id: '1', email: 'test@test.com', name: 'Test User' });
  expect(accessToken).toBe('token123');
  expect(isAuthenticated).toBe(true);
});
```

**Cleanup Patterns:**
```typescript
describe('Feature', () => {
  beforeEach(() => {
    // Reset state before each test
    useLineupStore.setState({ athletes: [], activeBoats: [] });
    localStorage.clear();
    mockFetch.mockClear();
  });

  afterEach(() => {
    // Clean up mocks
    vi.clearAllMocks();
  });
});
```

## Setup Files

**Browser Tests (`src/test/setup.ts`):**
- Imports `@testing-library/jest-dom` for extended matchers
- Registers `afterEach(cleanup)` for Testing Library cleanup
- Mocks browser APIs: `matchMedia`, `IntersectionObserver`, `ResizeObserver`
- Optional: Suppresses console errors during tests

**Server Tests (`server/tests/setup.js`):**
- Minimal file for isolation
- Comment notes: "Server tests don't need jsdom-specific setup"

## Test Configuration

**Vitest Config (`vitest.config.ts`):**
```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,              // describe, it, expect available globally
    environment: 'jsdom',        // Use jsdom for DOM access
    setupFiles: ['./src/test/setup.ts', './server/tests/setup.js'],
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'server/**/*.{test,spec}.{js,jsx,ts,tsx}'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/*',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      // ... more aliases
    },
  },
});
```

---

*Testing analysis: 2026-01-23*

# Coding Conventions

**Analysis Date:** 2026-01-23

## Naming Patterns

**Files:**
- React components: PascalCase (e.g., `CommandPalette.tsx`, `BoatIcon.tsx`)
- Utilities and services: camelCase (e.g., `boatConfig.ts`, `authStore.js`, `lineupOptimizer.ts`)
- Test files: Match source file with `.test.ts` or `.spec.ts` suffix (e.g., `lineupStore.test.ts`, `encryption.test.js`)
- Hooks: PascalCase with `use` prefix (e.g., `useKeyboardShortcuts.ts`, `useUndoRedo.ts`)
- Store files: camelCase with `Store` suffix (e.g., `authStore.js`, `lineupStore.js`)

**Functions:**
- React components: PascalCase (exported as default or named export)
  - Example: `export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps)`
  - Named exports for multiple components in one file: `export function ShellIcon(...)`, `export function EightIcon(...)`
- Utility functions: camelCase
  - Example: `createBoatInstance()`, `parseErgTime()`, `calculatePowerScore()`
- Hooks: camelCase with `use` prefix
  - Example: `useKeyboardShortcuts()`, `useUndoRedo()`, `useCollaboration()`
- Store actions: camelCase
  - Example: `addBoat()`, `assignToSeat()`, `removeFromSeat()`, `getAvailableAthletes()`
- Event handlers: camelCase with `handle` prefix
  - Example: `handleKeyDown()`, `handleApiResponse()`, `handleChange()`
- Middleware/utilities: camelCase
  - Example: `validateRequest()`, `requestLogger()`, `globalLimiter`

**Variables:**
- State variables: camelCase
  - Example: `isLoading`, `selectedAthlete`, `activeTeamId`, `accessToken`
- Boolean flags: camelCase with `is`, `has`, `can`, or `should` prefix
  - Example: `isAuthenticated`, `hasCoxswain`, `canUndo`, `shouldReduceMotion`
- Constants: UPPER_SNAKE_CASE
  - Example: `API_URL`, `SEQUENCE_TIMEOUT`, `TEST_ENCRYPTION_KEY`
- Private store properties: camelCase with leading underscore
  - Example: `_history`, `_timeouts`

**Types:**
- Interfaces: PascalCase
  - Example: `Athlete`, `BoatConfig`, `CommandItem`, `UndoRedoState`
- Type aliases: PascalCase
  - Example: `Side`, `ErgTestType`, `BoatClass`
- Enum-like types: PascalCase
  - Example: `type Side = 'P' | 'S' | 'B' | 'Cox'`

**Components with Props:**
- Props interface: ComponentName + `Props`
  - Example: `CommandPaletteProps`, `BoatIconProps`, `IconProps`

## Code Style

**Formatting:**
- Tool: Prettier
- Settings from `.prettierrc`:
  - Semicolons: true
  - Single quotes: true
  - Tab width: 2 spaces
  - Trailing commas: es5 (objects and arrays)
  - Print width: 100 characters
  - Arrow parens: always (e.g., `(x) => x + 1`)
  - Bracket spacing: true
  - Bracket same line: false
  - Line ending: LF

**Linting:**
- Tool: ESLint (9.39.2) with TypeScript support
- Configuration: `.eslintrc.cjs`
- Key rules:
  - `react/prop-types`: off (TypeScript handles this)
  - `react/react-in-jsx-scope`: off (React 17+ JSX transform)
  - `@typescript-eslint/no-unused-vars`: warn with `argsIgnorePattern: '^_'` (allow prefixing unused parameters with `_`)
  - `react-hooks/rules-of-hooks`: error (strict enforcement)
  - `react-hooks/exhaustive-deps`: warn
  - `no-console`: warn except `console.warn` and `console.error`
  - `prefer-const`: error
  - `no-var`: error
  - `@typescript-eslint/no-explicit-any`: off in test files only

**TypeScript:**
- Compiler target: ES2022
- Module: ESNext
- Strict mode: true
  - `noUnusedLocals`: true
  - `noUnusedParameters`: true
  - `noFallthroughCasesInSwitch`: true
  - `noUncheckedIndexedAccess`: true

## Import Organization

**Order:**
1. External packages (React, third-party libraries)
   - Example: `import React, { useState } from 'react'`
   - Example: `import { motion, AnimatePresence } from 'framer-motion'`
2. Internal absolute imports (path aliases)
   - Example: `import { PageContainer } from '@/components'`
   - Example: `import useAuthStore from '@/store/authStore'`
3. Relative imports (if used)
   - Example: `import { helper } from '../utils'`

**Path Aliases:**
- `@/*`: `src/*`
- `@components/*`: `src/components/*`
- `@pages/*`: `src/pages/*`
- `@store/*`: `src/store/*`
- `@theme/*`: `src/theme/*`
- `@utils/*`: `src/utils/*`
- `@services/*`: `src/services/*`
- `@hooks/*`: `src/hooks/*`
- `@types/*`: `src/types/*`

**Barrel Exports:**
- Index files (e.g., `src/components/Layout/index.ts`) export all public components
- Pattern: `export { ComponentName } from './ComponentName'`
- Example from `src/components/Layout/index.ts`:
  ```typescript
  export { PageContainer } from './PageContainer';
  export { TopNav } from './TopNav';
  export { Breadcrumbs } from './Breadcrumbs';
  ```

## Error Handling

**Patterns:**
- Try-catch in async functions
- API responses use structured `{ success: boolean, data?: any, error?: { code: string, message: string } }`
- Example from `authStore.js`:
  ```javascript
  try {
    const res = await fetch(`${API_URL}/auth/login`, { /* ... */ });
    const data = await handleApiResponse(res, 'Login failed');
    set({ isAuthenticated: true, error: null });
    return { success: true };
  } catch (err) {
    set({ error: err.message });
    return { success: false, error: err.message };
  }
  ```
- Server validation uses `express-validator` with `validationResult(req)` and structured error response
- Example from `server/routes/athletes.js`:
  ```javascript
  const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() },
      });
    }
    next();
  };
  ```

## Logging

**Framework:** Console for browser, Winston for server

**Browser Logging Patterns:**
- `console.error()`: Error conditions
- `console.warn()`: Warning conditions (e.g., `'Cannot join session: not connected'`)
- `console.log()`: Generally avoided (ESLint rule warns against it)
- Example: `console.error('Collaboration error:', error)`

**Server Logging:**
- Tool: Winston logger (`src/utils/logger.js` and `server/utils/logger.js`)
- Usage: `logger.warn()`, `logger.error()`, `logger.info()`
- Middleware: `requestLogger`, `errorLogger` registered in `server/index.js`

## Comments

**When to Comment:**
- JSDoc/TSDoc for public functions and exports
- Inline comments for complex logic or non-obvious implementation details
- Section dividers for organizing code blocks (using `// =====` pattern)
- Example from `src/services/lineupOptimizer.ts`:
  ```typescript
  // =============================================================================
  // TYPES
  // =============================================================================
  ```

**JSDoc/TSDoc:**
- Used for service functions and store actions
- Pattern: Block comments with description, parameters, and return type
- Example from `server/routes/athletes.js`:
  ```javascript
  /**
   * GET /api/v1/athletes/me
   * Get current user's athlete profile and stats
   * Only works if the user has an athlete record linked
   * Supports pagination: ?ergPage=1&ergLimit=20&includeAllHistory=true
   */
  router.get('/me', async (req, res) => { ... })
  ```

## Function Design

**Size:**
- Most functions kept under 50 lines
- Complex operations broken into smaller utility functions
- Example: `parseErgTime()` is separate from `calculatePowerScore()`

**Parameters:**
- Use destructuring for object parameters
- Example: `{ email, password, name }` instead of separate params
- Props interfaces for React components
- Use optional chaining and nullish coalescing for optional parameters

**Return Values:**
- Functions return consistent shapes
- Success/failure patterns: `{ success: boolean, data?: any, error?: any }`
- Store actions return state or boolean for undo/redo support
- Hooks return state and action objects

## Module Design

**Exports:**
- Default exports: Single main export per file (React components, hooks)
  - Example: `export default function CommandPalette(...)`
  - Example: `export default useUndoRedo`
- Named exports: Multiple related exports in one file (icons, utilities)
  - Example: `export function ShellIcon(...) { ... } export function EightIcon(...) { ... }`
  - Example: `export { useDarkMode } from './useDarkMode'`

**Store Structure (Zustand):**
- Single store file per domain
- State organized into sections with comments
- Actions organized after state
- Pattern: `create(middleware((...) => ({ state, actions })))`
- Example from `src/store/lineupStore.js`:
  ```javascript
  const useLineupStore = create(
    undoMiddleware({
      trackedKeys: ['activeBoats'],
      historyLimit: 50,
    })((set, get) => ({
      // Data
      athletes: [],
      activeBoats: [],

      // Actions
      setAthletes: (athletes) => set({ athletes }),
      addBoat: (boatConfig) => { /* ... */ },
    }))
  );
  ```

**Barrel Files:**
- Used to organize exports: `src/components/Layout/index.ts`
- Pattern: Re-export from individual component files
- Reduces import paths for consumers

---

*Convention analysis: 2026-01-23*

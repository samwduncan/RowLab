# Codebase Concerns

**Analysis Date:** 2026-01-23

## Tech Debt

**Incomplete Feature Implementations:**
- Issue: Multiple features are stubbed but not implemented, causing dead code in the codebase
- Files: `src/components/CommandPalette/CommandPalette.tsx` (lines 128, 137, 149), `src/components/Layout/WorkspaceSwitcher.tsx` (line 169)
- Impact: Users attempt these features but get no functionality; command palette clutters UX with unusable options
- Fix approach: Either implement export/import/AI suggestions or remove from command palette entirely. Create tracked issues for feature completeness.

**Unsafe JWT Token Parsing:**
- Issue: JWT payload parsed without validation or error handling using `JSON.parse(atob(token.split('.')[1]))`
- Files: `src/hooks/useCollaboration.ts` (line 107)
- Impact: Malformed tokens crash the application; no fallback if token structure is invalid
- Fix approach: Add try-catch around JWT parsing, validate token format before attempting decode, use a JWT library (e.g., `jwt-decode`) instead of manual parsing

**Toast Notification Stubs:**
- Issue: Join/leave collaboration notifications are TODO without implementation
- Files: `src/hooks/useCollaboration.ts` (lines 86-88)
- Impact: Users don't know when collaborators join/leave session; reduces collaboration awareness
- Fix approach: Implement toast system (consider `react-hot-toast` or `sonner`) and wire callbacks to show notifications

## Known Bugs

**WebSocket Connection with Fallback:**
- Symptoms: WebSocket may silently fail to connect; only polling fallback logs warnings to console
- Files: `src/services/collaborationService.ts` (lines 43-51)
- Trigger: Network blocking WebSocket while allowing HTTPS polling
- Workaround: Check browser console for `Cannot join session: not connected` warning (line 93)
- Root cause: No user-facing error notification when WebSocket initialization fails; users unaware collaboration is degraded

**Stale Cursor Cleanup Safety Net:**
- Symptoms: Cursors remain visible even after users disconnect in rare race conditions
- Files: `src/hooks/useCollaboration.ts` (lines 178-187)
- Trigger: Network disconnect without proper cleanup emission
- Workaround: Safety interval runs but current implementation doesn't remove anything (returns prev unchanged at line 182)
- Root cause: Safety net is effectively a no-op; relies entirely on disconnect handler

**Missing Error Handling in Collaboration Service:**
- Symptoms: Failed operations emit but don't propagate errors back to caller
- Files: `src/services/collaborationService.ts` (lines 123-131, 136-140, 145-149)
- Trigger: Server rejects broadcast, selection update, or chat message
- Workaround: None - errors logged to console only
- Root cause: Event emitters lack acknowledgment/callback pattern

## Security Considerations

**Environment Variable Exposure:**
- Risk: `VITE_WS_URL` and other client env vars embedded in frontend bundle
- Files: `src/services/collaborationService.ts` (line 41), entire frontend build
- Current mitigation: Only non-sensitive vars exposed (no secrets in frontend)
- Recommendations: Ensure all `VITE_*` vars in production are safe for public exposure; use `VITE_` prefix convention strictly; never embed `JWT_SECRET`, `ENCRYPTION_KEY`, or OAuth secrets

**JWT Parsing Without Type Safety:**
- Risk: Assume token has `.id` field without validation; crashes if field missing
- Files: `src/hooks/useCollaboration.ts` (line 107)
- Current mitigation: Only called in useEffect context where token existence checked
- Recommendations: Use `jwt-decode` library; add TypeScript interface for decoded payload; validate required fields before use

**Authentication State in LocalStorage:**
- Risk: Sensitive tokens/theme preferences mixed in localStorage without encryption
- Files: `src/components/compound/Sidebar/Sidebar.tsx` (lines 95, 102, 115, 125, 135)
- Current mitigation: Only non-sensitive UI state (theme, sidebar collapsed)
- Recommendations: Verify auth tokens stored securely (likely in authStore); never persist auth tokens to localStorage without httpOnly cookie alternative

## Performance Bottlenecks

**Large Component Files - Cognitive Load:**
- Problem: Several components exceed 350+ lines making maintenance difficult
- Files:
  - `src/components/icons/RowingIcons.tsx` (543 lines) - Icon definitions
  - `src/components/compound/Sidebar/Sidebar.tsx` (381 lines) - Navigation + theme + collapse logic
  - `src/components/Racing/RaceDay/RaceDayView.tsx` (373 lines) - Race display logic
  - `src/components/Layout/WorkspaceSwitcher.tsx` (371 lines) - Team switching logic
- Cause: Multiple concerns (UI logic, state management, animation configs) in single files
- Improvement path: Extract animation variants to separate constants file, split into smaller sub-components for sidebar sections, separate race display logic into dedicated components

**Lineup Optimization Algorithm - O(n²) Complexity:**
- Problem: Seat assignment loops through all athletes for each seat position
- Files: `src/services/lineupOptimizer.ts` (lines 199-229)
- Cause: Greedy algorithm recomputes athlete ranking for each seat; multiple nested loops
- Impact: Noticeable lag with 50+ athletes; doesn't scale for larger squads
- Improvement path: Pre-compute power scores once, use indexed lookups instead of repeated findIndex (line 211), consider dynamic programming approach for better assignments

**Unoptimized Cursor Position Updates:**
- Problem: Cursor throttle set to 50ms (20 updates/sec) which is high for real-time collaboration
- Files: `src/hooks/useCollaboration.ts` (line 153)
- Cause: Aggressive throttling may still cause network spam with many simultaneous users
- Impact: High bandwidth usage with 5+ concurrent users tracking cursors
- Improvement path: Increase throttle to 100ms+ (10 updates/sec), implement delta-only sending (only send if moved >10px)

**Test Coverage Severely Lacking:**
- Problem: Only 3 test files for 54 source files (5.5% coverage by file count)
- Files: `src/store/authStore.test.ts`, `src/store/lineupStore.test.ts`, `src/test/api/auth.test.ts`
- Impact: No confidence in refactoring; integration bugs slip through; collaboration features untested
- Improvement path: Implement unit tests for critical utilities, add integration tests for lineup optimization, mock collaboration service for testing presence/updates

## Fragile Areas

**Sidebar Navigation State Management:**
- Files: `src/components/compound/Sidebar/Sidebar.tsx`
- Why fragile: Multiple independent state pieces (isDark, isCollapsed, viewAsAthlete) updated via localStorage without synchronization; CSS variable updated separately (lines 127-129); theme applied to document root (lines 111-115)
- Safe modification: Always update all three in sequence: state → localStorage → document; extract into custom hook for theme management
- Test coverage: None - manual testing required for theme persistence

**Collaboration Presence Tracking:**
- Files: `src/hooks/useCollaboration.ts` (lines 177-187), `src/services/collaborationService.ts` (lines 154-186)
- Why fragile: Multiple channels for user updates (session:users, session:state); cursors stored in Map without timeout; stale cursor cleanup doesn't actually clean (line 182 returns unchanged state); race conditions if disconnect before callback
- Safe modification: Consolidate user update events to single source of truth; implement proper cursor timeout with timestamp validation; ensure leaveSession fires before disconnect
- Test coverage: None - collaboration state untested

**Lineup Optimizer Power Scoring:**
- Files: `src/services/lineupOptimizer.ts` (lines 72-86)
- Why fragile: Linear normalization assumes times between 6:00-8:00 (lines 82-83); times outside range clamp to 0-100 without validation; hardcoded ideal positions per boat class (lines 113-124) don't generalize
- Safe modification: Add bounds checking with warnings for outlier times; make position preferences configurable per boat class; validate erg test data before scoring
- Test coverage: None - optimizer untested with edge cases (no erg data, invalid times)

**WebSocket URL Fallback:**
- Files: `src/services/collaborationService.ts` (line 41)
- Why fragile: Falls back to `window.location.origin` if VITE_WS_URL not set; assumes same origin for WebSocket; breaks if frontend hosted on different domain from API
- Safe modification: Require explicit VITE_WS_URL in production; add validation that WebSocket URL is reachable before attempting connection
- Test coverage: None - WebSocket connection untested

## Scaling Limits

**Real-time Collaboration with Socket.IO:**
- Current capacity: ~5-10 concurrent users per session (cursor updates, presence tracking)
- Limit: Socket.IO default memory store doesn't cluster across servers; single server can't handle 50+ users in same session
- Scaling path: Migrate to Redis adapter for Socket.IO (socket.io-redis), enable namespacing per lineup session, implement cursor position compression

**Lineup Optimization CPU Usage:**
- Current capacity: ~100 athletes max before noticeable lag (O(n²) algorithm)
- Limit: Greedy approach requires full re-evaluation for each seat; doesn't parallelize
- Scaling path: Implement multithreading using Web Workers, optimize algorithm to O(n log n), cache optimization results with athlete roster versioning

**Database Query N+1 Problems (Potential):**
- Current capacity: Lineups with 50+ athletes load sequentially
- Limit: If each seat assignment requires database query, 8-person boat = 8+ queries + cox query
- Scaling path: Use eager loading in Prisma (`.include({ athletes: true })`), batch load athlete details, implement query result caching

## Dependencies at Risk

**Socket.IO Version:**
- Risk: socket.io@4.8.3 is production-ready but upcoming v5 has breaking changes
- Impact: Will need adapter migration (socket.io-redis breaking changes) when upgrading
- Migration plan: Plan 2-3 sprint upgrade; audit all event handler patterns for compatibility; test with Redis adapter before production

**Prisma ORM:**
- Risk: @prisma/client@7.2.0 is recent; rapid release cycle may introduce subtle breaking changes
- Impact: Database schema migrations could break if not tested; adapter changes (@prisma/adapter-pg)
- Migration plan: Lock minor version in package.json (7.x), test all migrations in dev before deploying, maintain migration rollback scripts

**Framer Motion Animations:**
- Risk: framer-motion@11.18.2 has large bundle impact; multiple instances (Sidebar, CommandPalette, Layout components)
- Impact: ~60KB minified; contributes to initial bundle size
- Migration plan: Audit animation necessity in each component, consider CSS transitions for simple cases, profile bundle impact

## Missing Critical Features

**Error Boundary for Collaboration:**
- Problem: No error boundary around collaboration features; single failed event handler crashes entire session
- Blocks: Stable multi-user sessions; production deployments require manual recovery
- Severity: High - user-facing crashes in core feature

**Offline Support / Sync Queue:**
- Problem: No mechanism to queue changes when connection lost; user changes are silently discarded
- Blocks: Using app on unreliable networks; mobile scenarios
- Severity: Medium - degrades experience but not critical

**Undo/Redo for Lineup Changes:**
- Problem: Hook exists (`src/hooks/useUndoRedo.ts`) but not integrated with lineup store
- Blocks: Users can't recover from accidental lineup changes
- Severity: Medium - quality of life feature

**Audit Log for Lineup Modifications:**
- Problem: No tracking of who changed what when in shared lineups
- Blocks: Accountability in team environments; can't trace lineup evolution
- Severity: Medium - needed for production team use

## Test Coverage Gaps

**Collaboration Service:**
- What's not tested: Connection establishment, event broadcasting, disconnect handling, reconnection logic
- Files: `src/services/collaborationService.ts`
- Risk: WebSocket connection failures go undetected until production; event handlers could be wired incorrectly
- Priority: **High** - core to application reliability

**Lineup Optimizer:**
- What's not tested: Power scoring calculation, side compatibility checking, position selection, score calculation
- Files: `src/services/lineupOptimizer.ts`
- Risk: Algorithm bugs produce invalid lineups (incompatible sides, power imbalances); no validation before user sees suggestion
- Priority: **High** - directly impacts user experience quality

**Authentication Store:**
- What's not tested: Token refresh, team switching, logout persistence, role-based access
- Files: `src/store/authStore.test.ts` exists but only tests basic state (see lines 32-52, 54-99)
- Risk: Auth flow breaks silently; users remain logged in after token expiry
- Priority: **High** - security critical

**UI Components:**
- What's not tested: Sidebar navigation, workspace switcher dropdown, race day timeline, athlete bank panel
- Files: `src/components/` (no test files)
- Risk: Layout changes break navigation; accessibility broken silently
- Priority: **Medium** - impacts usability but not core logic

**Keyboard Shortcuts:**
- What's not tested: Sequence matching, scope isolation, input detection
- Files: `src/hooks/useKeyboardShortcuts.ts` (357 lines, no tests)
- Risk: Shortcuts trigger in wrong contexts (e.g., while typing); sequences fail silently
- Priority: **Medium** - nice-to-have feature, lower risk

---

*Concerns audit: 2026-01-23*

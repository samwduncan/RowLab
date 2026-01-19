# RowLab Precision Instrument Redesign - Implementation Plan

**Design Doc:** `docs/plans/2026-01-19-rowlab-precision-instrument-redesign.md`
**Created:** 2026-01-19
**Status:** Ready for Implementation

---

## Overview

Complete visual redesign of RowLab following the "Precision Instrument" design system. This is a **full redesign**, not an incremental update.

### Phases

| Phase | Focus | Estimated Tasks |
|-------|-------|-----------------|
| 1 | Foundation (colors, fonts, CSS vars) | 4 tasks |
| 2 | Base Components (cards, buttons, inputs) | 6 tasks |
| 3 | Landing Page | 8 tasks |
| 4 | Application Layout | 5 tasks |
| 5 | Domain Components (boats, athletes) | 5 tasks |
| 6 | Polish & Animation | 4 tasks |

---

## Phase 1: Foundation

Establish the design system tokens. Everything else builds on this.

### Task 1.1: Update Tailwind Config
**File:** `tailwind.config.js`
**Action:** Replace color system, add fonts, shadows

```js
// Colors to add/replace:
colors: {
  void: {
    deep: '#08080A',
    surface: '#0c0c0e',
    elevated: '#121214',
  },
  blade: {
    green: '#00E599',
    'green-glow': 'rgba(0, 229, 153, 0.4)',
  },
  coxswain: {
    violet: '#7C3AED',
  },
  text: {
    primary: '#F4F4F5',
    secondary: '#A1A1AA',
    muted: '#52525B',
    disabled: '#3F3F46',
  },
  // Keep existing warning/danger semantic colors
}

// Fonts:
fontFamily: {
  display: ['Fraunces', 'Georgia', 'serif'],
  body: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
}

// Box shadows:
boxShadow: {
  'glow-green': '0 0 20px rgba(0, 229, 153, 0.4)',
  'glow-green-lg': '0 0 40px rgba(0, 229, 153, 0.3)',
  'glow-violet': '0 0 20px rgba(124, 58, 237, 0.4)',
  'inner-highlight': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
}
```

**Depends on:** Nothing
**Verify:** `npm run build` succeeds

---

### Task 1.2: Update Font Loading
**File:** `index.html`
**Action:** Add Google Fonts preconnect and stylesheet

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

**Depends on:** Nothing
**Verify:** Fonts load in browser (check Network tab)

---

### Task 1.3: Create CSS Variables Foundation
**File:** `src/App.css`
**Action:** Add `:root` CSS variables block at top (replace existing if present)

```css
:root {
  /* Void Scale */
  --void-deep: #08080A;
  --void-surface: #0c0c0e;
  --void-elevated: #121214;

  /* Text */
  --text-primary: #F4F4F5;
  --text-secondary: #A1A1AA;
  --text-muted: #52525B;
  --text-disabled: #3F3F46;

  /* Accents */
  --blade-green: #00E599;
  --coxswain-violet: #7C3AED;
  --warning-orange: #F59E0B;
  --danger-red: #EF4444;

  /* Fonts */
  --font-display: 'Fraunces', Georgia, serif;
  --font-body: 'Inter', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', monospace;

  /* Easing */
  --ease-snappy: cubic-bezier(0.2, 0.8, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Depends on:** Nothing
**Verify:** Variables accessible in DevTools

---

### Task 1.4: Set Base Styles
**File:** `src/App.css`
**Action:** Update body/html base styles

```css
html {
  background: var(--void-deep);
}

body {
  font-family: var(--font-body);
  color: var(--text-primary);
  background: var(--void-deep);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

**Depends on:** Task 1.3
**Verify:** Page background is warm void (#08080A), not pure black

---

## Phase 2: Base Components

Build the reusable component library.

### Task 2.1: Create Button Components
**File:** `src/components/ui/Button.jsx`
**Action:** Complete rewrite with new variants

**Variants to implement:**
- `glow` - Primary action (text + glowing underline)
- `pill` - Secondary (glass pill shape)
- `ghost` - Tertiary (text + hover underline)
- `icon` - Square icon button

**Props:** `variant`, `size`, `color` (green/violet/orange/danger), `loading`, `disabled`

See design doc Section 5.2 for full CSS.

**Depends on:** Phase 1 complete
**Verify:** Storybook or test page shows all variants

---

### Task 2.2: Create Card Components
**File:** `src/components/ui/Card.jsx`
**Action:** Complete rewrite with glass physics

**Variants to implement:**
- `glass` - Primary (gradient stroke, blur, top-lit)
- `solid` - No blur, for dense areas
- `inset` - Nested/recessed appearance
- `interactive` - Hover glow effect

See design doc Section 5.1 for full CSS.

**Depends on:** Phase 1 complete
**Verify:** Cards render with gradient borders, hover states work

---

### Task 2.3: Create Input Components
**File:** `src/components/ui/Input.jsx`
**Action:** Complete rewrite with inset styling

**Components:**
- `Input` - Text input with focus glow
- `Select` - Custom select with chevron
- `Checkbox` - Custom checkbox
- `Toggle` - Switch with spring animation

See design doc Section 5.3 for full CSS.

**Depends on:** Phase 1 complete
**Verify:** Focus states show green glow ring

---

### Task 2.4: Create Typography Components
**File:** `src/components/ui/Typography.jsx` (new file)
**Action:** Create text components

```jsx
// Components to create:
export function DisplayXL({ children }) // 72px Fraunces
export function DisplayLG({ children }) // 48px Fraunces
export function DisplayMD({ children }) // 32px Fraunces
export function BodyLG({ children })    // 18px Inter
export function BodyMD({ children })    // 15px Inter
export function BodySM({ children })    // 13px Inter
export function MonoStat({ children })  // 24px+ JetBrains
export function MonoLabel({ children }) // 11px JetBrains uppercase
```

**Depends on:** Phase 1 complete
**Verify:** Each component renders with correct font/size

---

### Task 2.5: Create Glass Utility Classes
**File:** `src/App.css`
**Action:** Add glass morphism utilities

```css
.glass-surface { /* backdrop blur + gradient border */ }
.glass-card { /* card variant with all physics */ }
.gradient-stroke { /* border trick only */ }
.inner-highlight { /* top-lit shadow only */ }
```

**Depends on:** Task 1.3
**Verify:** Classes work when applied to divs

---

### Task 2.6: Create Glow Utilities
**File:** `src/App.css`
**Action:** Add neon glow utilities

```css
.text-glow-green { text-shadow: 0 0 10px rgba(0,229,153,0.5), 0 0 30px rgba(0,229,153,0.3); }
.text-glow-violet { /* similar */ }
.box-glow-green { box-shadow: 0 0 20px rgba(0,229,153,0.4); }
.box-glow-green-lg { box-shadow: 0 0 40px rgba(0,229,153,0.3); }
```

**Depends on:** Task 1.3
**Verify:** Text and boxes glow when classes applied

---

## Phase 3: Landing Page

Complete redesign of LandingPage.jsx.

### Task 3.1: Create Hero Section
**File:** `src/pages/LandingPage.jsx` (or `src/components/landing/Hero.jsx`)
**Action:** Build the cockpit hero

**Components:**
- Void background with dual spotlight gradients
- 3D tilting glass card (Framer Motion)
- Editorial headline with tilted accent
- CTA buttons (glow + pill)

**Key implementation:**
```jsx
// HeroCockpitCard with mouse tracking
// See design doc Section 6.1 for full code
```

**Depends on:** Phase 2 complete
**Verify:** Card tilts on mouse move, spotlights render

---

### Task 3.2: Create Navigation Bar
**File:** `src/components/landing/Navbar.jsx` (new file)
**Action:** Fixed glass navbar

- Transparent initially, glass on scroll
- Logo, nav links, auth buttons
- Mobile hamburger menu

**Depends on:** Task 2.1, Task 2.5
**Verify:** Nav appears/disappears on scroll

---

### Task 3.3: Create Social Proof Bar
**File:** `src/components/landing/ProofBar.jsx` (new file)
**Action:** Stats strip

- 3 metrics with mono values
- Gradient dividers
- Centered layout

**Depends on:** Task 2.4
**Verify:** Numbers render in JetBrains Mono

---

### Task 3.4: Create Bento Grid Section
**File:** `src/components/landing/FeaturesGrid.jsx` (new file)
**Action:** Asymmetric feature grid

- SpotlightCard component (mouse-following glow)
- 5 cards: 1 hero (7×2), 2 medium, 1 wide, 1 narrow
- Video/image backgrounds as textures
- Content: icon, title, description

**Depends on:** Task 2.2
**Verify:** Spotlight follows mouse, grid is asymmetric

---

### Task 3.5: Create Data Stream Ticker
**File:** `src/components/landing/DataStream.jsx` (new file)
**Action:** Infinite scroll metrics

- Horizontal scroll animation
- Edge fade masks
- Highlighted metrics with glow
- Pause on hover
- Reduced motion support

**Depends on:** Task 2.4, Task 2.6
**Verify:** Ticker scrolls, pauses on hover, edges fade

---

### Task 3.6: Create Pricing Section
**File:** `src/components/landing/Pricing.jsx` (new file)
**Action:** Three-tier pricing cards

- Featured card with gradient glow border
- "RECOMMENDED" badge
- Feature lists with checkmarks
- CTA buttons

**Depends on:** Task 2.1, Task 2.2
**Verify:** Middle card has green-to-violet gradient border

---

### Task 3.7: Create Final CTA Section
**File:** `src/components/landing/FinalCTA.jsx` (new file)
**Action:** Full-width call to action

- Spotlight gradient background
- Large headline
- Two buttons

**Depends on:** Task 2.1, Task 2.4
**Verify:** Spotlight gradient visible at top

---

### Task 3.8: Create Footer
**File:** `src/components/landing/Footer.jsx` (new file)
**Action:** Minimal footer

- Logo (muted, brightens on hover)
- Link columns
- Legal text

**Depends on:** Phase 1 complete
**Verify:** Links hover correctly

---

### Task 3.9: Assemble Landing Page
**File:** `src/pages/LandingPage.jsx`
**Action:** Complete rewrite using new components

```jsx
export function LandingPage() {
  return (
    <div className="bg-void-deep min-h-screen">
      <Navbar />
      <Hero />
      <ProofBar />
      <FeaturesGrid />
      <DataStream />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
}
```

**Depends on:** Tasks 3.1-3.8
**Verify:** Full page renders, all sections visible

---

## Phase 4: Application Layout

Redesign the app shell.

### Task 4.1: Create New Sidebar
**File:** `src/components/compound/Sidebar/Sidebar.tsx`
**Action:** Complete rewrite - Linear style

- 64px wide, icon-only
- Tooltip on hover
- Active state with green glow indicator
- Mobile: bottom tab bar

See design doc Section 7.2 for full CSS.

**Depends on:** Phase 2 complete
**Verify:** Sidebar is thin, tooltips appear, active glows

---

### Task 4.2: Create Topbar
**File:** `src/components/compound/Topbar/Topbar.tsx` (new file)
**Action:** Sticky header bar

- Page title
- Breadcrumbs (optional)
- Action buttons area
- Glass effect

**Depends on:** Task 2.5
**Verify:** Topbar sticks on scroll, blur works

---

### Task 4.3: Update App Layout
**File:** `src/layouts/AppLayout.jsx`
**Action:** Restructure layout

```jsx
<div className="app-layout">
  <Sidebar />
  <main className="app-main">
    <Topbar title={pageTitle} />
    <div className="app-canvas">
      <Outlet />
    </div>
  </main>
</div>
```

**Depends on:** Tasks 4.1, 4.2
**Verify:** Sidebar + content + topbar render correctly

---

### Task 4.4: Add Mobile Layout
**File:** `src/layouts/AppLayout.jsx` + CSS
**Action:** Responsive sidebar → bottom tabs

- Sidebar transforms at 768px breakpoint
- Bottom tab bar with safe area
- Main content margin adjusts

**Depends on:** Task 4.3
**Verify:** Resize browser, sidebar moves to bottom

---

### Task 4.5: Update Page Backgrounds
**Files:** All page components in `src/pages/`
**Action:** Ensure void background

- Remove any conflicting background colors
- Use `bg-void-deep` as base
- Cards use `bg-void-elevated`

**Depends on:** Phase 1 complete
**Verify:** No white/light backgrounds anywhere in app

---

## Phase 5: Domain Components

Redesign rowing-specific components.

### Task 5.1: Create Athlete Card
**File:** `src/components/domain/AthleteCard.tsx` (new or rewrite)
**Action:** Trading card style with score ring

- Whoop-style circular progress
- Name, position
- Key stat (2K split)
- Drag handle
- Zone colors (green/yellow/red)

See design doc Section 7.4 for full CSS.

**Depends on:** Phase 2 complete
**Verify:** Ring animates, colors change by score

---

### Task 5.2: Create Seat Slot
**File:** `src/components/domain/SeatSlot.tsx` (new or rewrite)
**Action:** Boat seat drop zone

- Seat number label
- Empty state (dashed border, + icon)
- Filled state (athlete card)
- Drag-over state (green glow)
- Coxswain variant (violet)

**Depends on:** Task 5.1
**Verify:** Drag over shows glow, coxswain is violet

---

### Task 5.3: Create Boat Shell View
**File:** `src/components/domain/BoatShell.tsx` (new or rewrite)
**Action:** Horizontal boat layout

- Shell name + type header
- Row of seat slots
- Predicted speed display with glow
- Delta indicator (faster/slower)

**Depends on:** Task 5.2
**Verify:** Speed updates and pulses on change

---

### Task 5.4: Create Athlete Bank
**File:** `src/components/domain/AthleteBank.tsx` (new or rewrite)
**Action:** Draggable athlete pool

- Header with count
- Grid of athlete cards
- Search/filter (optional)

**Depends on:** Task 5.1
**Verify:** Athletes are draggable

---

### Task 5.5: Assemble Lineup Builder
**File:** `src/components/domain/Lineup/LineupBoard.tsx`
**Action:** Combine boat shell + athlete bank

- Layout: boat shells above, athlete bank below
- Drag-drop between bank and seats
- Speed recalculation on change

**Depends on:** Tasks 5.3, 5.4
**Verify:** Full drag-drop flow works

---

## Phase 6: Polish & Animation

Final touches.

### Task 6.1: Add Framer Motion Variants
**File:** `src/lib/animations.ts` (new file)
**Action:** Reusable animation configs

```ts
export const fadeInUp = { /* ... */ };
export const scaleIn = { /* ... */ };
export const staggerContainer = { /* ... */ };
export const springConfig = { stiffness: 150, damping: 20 };
```

**Depends on:** Nothing
**Verify:** Import works in components

---

### Task 6.2: Add Page Transitions
**Files:** Page components
**Action:** Wrap pages in motion.div

- Fade in on mount
- Stagger children

**Depends on:** Task 6.1
**Verify:** Pages animate in smoothly

---

### Task 6.3: Add Reduced Motion Support
**File:** `src/App.css`
**Action:** Media query for prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Depends on:** Nothing
**Verify:** Animations stop when OS setting enabled

---

### Task 6.4: Performance Audit
**Action:** Review and optimize

- Limit backdrop-filter usage
- Check for repaints on scroll
- Verify animations use transform/opacity only
- Test on slower devices

**Depends on:** All previous tasks
**Verify:** Lighthouse performance score ≥ 90

---

## Implementation Order Summary

```
Phase 1: Foundation (4 tasks)
├── 1.1 Tailwind config
├── 1.2 Font loading
├── 1.3 CSS variables
└── 1.4 Base styles

Phase 2: Base Components (6 tasks)
├── 2.1 Buttons
├── 2.2 Cards
├── 2.3 Inputs
├── 2.4 Typography
├── 2.5 Glass utilities
└── 2.6 Glow utilities

Phase 3: Landing Page (9 tasks)
├── 3.1 Hero section
├── 3.2 Navigation
├── 3.3 Proof bar
├── 3.4 Bento grid
├── 3.5 Data stream
├── 3.6 Pricing
├── 3.7 Final CTA
├── 3.8 Footer
└── 3.9 Assemble page

Phase 4: App Layout (5 tasks)
├── 4.1 Sidebar
├── 4.2 Topbar
├── 4.3 Layout structure
├── 4.4 Mobile layout
└── 4.5 Page backgrounds

Phase 5: Domain Components (5 tasks)
├── 5.1 Athlete card
├── 5.2 Seat slot
├── 5.3 Boat shell
├── 5.4 Athlete bank
└── 5.5 Lineup builder

Phase 6: Polish (4 tasks)
├── 6.1 Animation variants
├── 6.2 Page transitions
├── 6.3 Reduced motion
└── 6.4 Performance audit
```

---

## Dependencies

```json
{
  "dependencies": {
    "framer-motion": "^11.x"
  }
}
```

Run: `npm install framer-motion` if not already installed.

---

## Verification Checklist

After each phase, verify:

- [ ] No TypeScript/build errors
- [ ] No console errors
- [ ] Responsive at 768px and 640px breakpoints
- [ ] Dark mode only (no light mode artifacts)
- [ ] Focus states visible for accessibility
- [ ] Hover states work on desktop

---

## Notes

- **Don't patch** — Each component gets a complete rewrite
- **Mobile-first** — Test responsive at each step
- **Commit often** — Commit after each task
- **Reference the design doc** — All CSS is specified there

---

**Ready to begin Phase 1?**

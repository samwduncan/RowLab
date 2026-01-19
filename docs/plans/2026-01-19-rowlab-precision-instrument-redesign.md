# RowLab Precision Instrument Design System

> **Philosophy:** "You don't design websites. You design systems of precision."

**Date:** 2026-01-19
**Status:** Complete Design Specification
**Approach:** Complete redesign (not iterative update)

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Visual References](#2-visual-references)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Component Physics](#5-component-physics)
6. [Landing Page](#6-landing-page)
7. [Application UI](#7-application-ui)
8. [Animation System](#8-animation-system)
9. [Implementation Notes](#9-implementation-notes)

---

## 1. Design Philosophy

### The Precision Instrument Manifesto

RowLab is not a "web app." It's a **precision instrument** for rowing coaches. Every element must feel:

- **Engineered** — Not designed. Components have physics, not just styles.
- **Exclusive** — Like a native app, not a website.
- **Data-first** — Numbers are the UI. Metrics glow.
- **Fast** — Snappy interactions. No lag. Spring physics.

### Interaction Fidelity

- **Hero section:** Full 3D physics (mouse-tracking, spring animations)
- **Everything else:** Elevated basics (CSS transitions + simple Framer Motion)

### Editorial Chaos Rule

**Surgical chaos** — One dramatic moment only. The hero headline gets the tilted/overlapping treatment. Everything else stays on the grid.

---

## 2. Visual References

### Primary Influences

| Reference | What We Take |
|-----------|--------------|
| **Raycast** | Void backgrounds, neon glows, glass with noise texture, monospace labels |
| **Linear** | Thin sidebars, micro-borders, subtle precision |
| **Vercel** | Gradient masks, fade-to-void edges |
| **Whoop** | Circular progress rings, data-first UI, zone gradients |
| **Rauno Freiberg** | Spring physics, mouse velocity (hero only) |

### Anti-Patterns (Avoid)

- ❌ Standard 3-column grids
- ❌ Flat blue buttons
- ❌ Centered H1s with no contrast
- ❌ Generic "AI startup" aesthetics
- ❌ Stock photography as banners

---

## 3. Color System

### The Void Scale

The foundation is absence. Not pure black—**warm void**.

```css
:root {
  /* Void Scale */
  --void-deep: #08080A;      /* Page background */
  --void-surface: #0c0c0e;   /* Subtle elevation */
  --void-elevated: #121214;  /* Cards, sidebars */

  /* Text Hierarchy */
  --text-primary: #F4F4F5;   /* Headlines, important */
  --text-secondary: #A1A1AA; /* Body text */
  --text-muted: #52525B;     /* Labels, timestamps */
  --text-disabled: #3F3F46;  /* Inactive states */

  /* Neon Accents (they emit light) */
  --blade-green: #00E599;    /* Primary action, success */
  --coxswain-violet: #7C3AED;/* Leadership, navigation */
  --warning-orange: #F59E0B; /* Attention, high strain */
  --danger-red: #EF4444;     /* Errors, port side */

  /* Glow Values */
  --glow-green: 0 0 20px rgba(0, 229, 153, 0.4);
  --glow-violet: 0 0 20px rgba(124, 58, 237, 0.4);
  --glow-orange: 0 0 20px rgba(245, 158, 11, 0.4);
  --glow-red: 0 0 20px rgba(239, 68, 68, 0.4);
}
```

### Glass Surfaces

Glass has physics—not just blur.

```css
.glass-surface {
  background: rgba(18, 18, 20, 0.8);
  backdrop-filter: blur(20px) saturate(180%);

  /* Gradient stroke trick */
  border: 1px solid transparent;
  background-clip: padding-box;
  background-image:
    linear-gradient(rgba(18, 18, 20, 0.8), rgba(18, 18, 20, 0.8)),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0));
  background-origin: padding-box, border-box;

  /* Top-lit effect */
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.06);
}
```

**Dev Note:** Neon text uses `text-shadow` for glow, not `filter: drop-shadow()` (performance). For maximum punch, add `mix-blend-mode: plus-lighter` on dark backgrounds only.

---

## 4. Typography

### Font Stack

```css
:root {
  --font-display: 'Fraunces', Georgia, serif;
  --font-body: 'Inter', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', monospace;
}
```

### Voice 1: Editorial (Fraunces)

For hero headlines, section titles, emotional moments. **Never below 24px.**

```css
.headline-editorial {
  font-family: var(--font-display);
  font-weight: 600;
  font-optical-sizing: auto;
  letter-spacing: -0.03em;
  line-height: 1.1;
}
```

| Class | Size | Use |
|-------|------|-----|
| `display-xl` | 72px | Hero headline only |
| `display-lg` | 48px | Section titles |
| `display-md` | 32px | Card headlines |

### Voice 2: Instrument (Inter + JetBrains Mono)

For UI labels, body text, navigation, data.

```css
.label-instrument {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}
```

| Class | Font | Size | Use |
|-------|------|------|-----|
| `body-lg` | Inter | 18px | Landing page prose |
| `body-md` | Inter | 15px | App body text |
| `body-sm` | Inter | 13px | Secondary text |
| `mono-stat` | JetBrains | 24px+ | Split times, scores |
| `mono-label` | JetBrains | 11px | Metadata, timestamps |

### The Raycast Contrast Pattern

Pair tiny monospace label above massive editorial headline:

```html
<span class="mono-label text-blade-green">LINEUP OPTIMIZER</span>
<h1 class="display-xl">Build faster boats.</h1>
```

---

## 5. Component Physics

### 5.1 Cards

#### Gradient Stroke Card

```css
.card-glass {
  background:
    linear-gradient(#121214, #121214) padding-box,
    linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.12) 0%,
      rgba(255, 255, 255, 0.04) 50%,
      rgba(255, 255, 255, 0) 100%
    ) border-box;

  border: 1px solid transparent;
  border-radius: 16px;
  backdrop-filter: blur(20px) saturate(180%);
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.06);

  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.card-glass:hover {
  box-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.06),
    0 0 30px -10px rgba(0, 229, 153, 0.3);
  transform: translateY(-2px);
}
```

#### Card Variants

| Variant | Use | Blur | Hover |
|---------|-----|------|-------|
| `card-glass` | Primary containers | Yes | Green glow + lift |
| `card-solid` | Dense data areas | No | Subtle lift only |
| `card-interactive` | Clickable items | Yes | Strong glow |
| `card-inset` | Nested containers | No | None |

#### Noise Texture (Optional)

```css
.card-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: url('/textures/noise.png');
  opacity: 0.03;
  pointer-events: none;
  mix-blend-mode: overlay;
}
```

---

### 5.2 Buttons

**Rule: No solid rectangles.** Buttons emit light or contain glass.

#### Glow Button (Primary)

```css
.btn-glow {
  position: relative;
  padding: 12px 24px;
  background: transparent;
  border: none;

  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--blade-green);

  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-glow::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--blade-green);
  border-radius: 1px;
  box-shadow: 0 0 8px var(--blade-green);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.btn-glow:hover::after {
  box-shadow:
    0 0 12px var(--blade-green),
    0 0 24px rgba(0, 229, 153, 0.4);
  transform: scaleX(1.05);
}
```

#### Glass Pill (Secondary)

```css
.btn-pill {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);

  border: 1px solid transparent;
  background-clip: padding-box;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.06)),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0));
  background-origin: padding-box, border-box;

  border-radius: 100px;

  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);

  transition: all 0.2s ease;
}

.btn-pill:hover {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
}
```

#### Ghost Button (Tertiary)

```css
.btn-ghost {
  padding: 8px 12px;
  background: transparent;
  border: none;

  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);

  position: relative;
  transition: color 0.15s ease;
}

.btn-ghost::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 12px;
  right: 12px;
  height: 1px;
  background: var(--blade-green);
  transform: scaleX(0);
  opacity: 0;
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  color: var(--text-primary);
}

.btn-ghost:hover::after {
  transform: scaleX(1);
  opacity: 1;
}
```

#### Icon Button

```css
.btn-icon {
  width: 40px;
  height: 40px;
  padding: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;

  color: var(--text-secondary);
  transition: all 0.15s ease;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
  color: var(--text-primary);
}
```

#### Color Variants

```css
.btn-glow.violet {
  color: var(--coxswain-violet);
}
.btn-glow.violet::after {
  background: var(--coxswain-violet);
  box-shadow: 0 0 8px var(--coxswain-violet);
}

.btn-glow.warning {
  color: var(--warning-orange);
}
.btn-glow.warning::after {
  background: var(--warning-orange);
  box-shadow: 0 0 8px var(--warning-orange);
}

.btn-glow.danger {
  color: var(--danger-red);
}
.btn-glow.danger::after {
  background: var(--danger-red);
  box-shadow: 0 0 8px var(--danger-red);
}
```

---

### 5.3 Inputs & Forms

#### Text Input

```css
.input {
  width: 100%;
  padding: 12px 16px;

  background: #0c0c0e;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);

  font-family: var(--font-body);
  font-size: 14px;
  color: var(--text-primary);

  transition: all 0.15s ease;
}

.input::placeholder {
  color: var(--text-muted);
}

.input:focus {
  outline: none;
  border-color: var(--blade-green);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.2),
    0 0 0 3px rgba(0, 229, 153, 0.15);
}
```

#### Toggle Switch

```css
.toggle {
  position: relative;
  width: 44px;
  height: 24px;

  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 100px;

  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;

  background: var(--text-secondary);
  border-radius: 50%;

  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toggle[data-checked="true"] {
  background: var(--blade-green);
  border-color: var(--blade-green);
  box-shadow: 0 0 12px rgba(0, 229, 153, 0.4);
}

.toggle[data-checked="true"]::after {
  left: calc(100% - 20px);
  background: #fff;
}
```

#### Validation States

```css
.input.error {
  border-color: var(--danger-red);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.2),
    0 0 0 3px rgba(239, 68, 68, 0.15);
}

.input.success {
  border-color: var(--blade-green);
}
```

---

## 6. Landing Page

### 6.1 Hero Section (Cockpit View)

The **one moment of full physics**. 3D-tilting glass card with mouse tracking.

#### Background: The Void Stage

```css
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--void-deep);
}

/* App Store-style spotlight */
.hero::before {
  content: '';
  position: absolute;
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  width: 150%;
  height: 70%;

  background: radial-gradient(
    ellipse at center top,
    rgba(0, 229, 153, 0.15) 0%,
    rgba(0, 229, 153, 0.05) 30%,
    transparent 70%
  );

  pointer-events: none;
}

/* Secondary ambient glow */
.hero::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 60%;

  background: radial-gradient(
    ellipse at center,
    rgba(124, 58, 237, 0.08) 0%,
    transparent 60%
  );

  pointer-events: none;
}
```

#### 3D Cockpit Card (React/Framer Motion)

```tsx
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export function HeroCockpitCard() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div
      className="cockpit-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      initial={{ opacity: 0, y: 40, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <LineupPreview />
    </motion.div>
  );
}
```

```css
.cockpit-card {
  position: relative;
  width: 700px;
  max-width: 90vw;
  padding: 32px;

  background:
    linear-gradient(rgba(18, 18, 20, 0.9), rgba(18, 18, 20, 0.9)) padding-box,
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.2) 0%,
      rgba(255, 255, 255, 0.05) 50%,
      rgba(255, 255, 255, 0) 100%
    ) border-box;

  border: 1px solid transparent;
  border-radius: 24px;
  backdrop-filter: blur(40px) saturate(200%);

  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.05),
    0 20px 50px -20px rgba(0, 0, 0, 0.5),
    0 0 100px -20px rgba(0, 229, 153, 0.2);

  transform-style: preserve-3d;
}

/* Top highlight line */
.cockpit-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 20%;
  right: 20%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
}
```

#### Hero Typography (Surgical Chaos)

```css
.hero-headline {
  font-family: var(--font-display);
  font-size: clamp(48px, 8vw, 80px);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: var(--text-primary);
  margin: 16px 0 24px;
}

/* The ONE tilted element */
.hero-accent {
  display: inline-block;
  color: var(--blade-green);
  text-shadow: 0 0 40px rgba(0, 229, 153, 0.5);
  transform: rotate(-2deg) translateY(-4px);
  transform-origin: left center;
}

.hero-subhead {
  font-family: var(--font-body);
  font-size: 18px;
  line-height: 1.6;
  color: var(--text-secondary);
  max-width: 440px;
}
```

---

### 6.2 Features Bento Grid (Engine Room)

Asymmetric grid. Chronicle-style layout with video backgrounds.

#### Grid Structure

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}

.bento-card.hero-feature { grid-column: span 7; grid-row: span 2; min-height: 560px; }
.bento-card.medium-top   { grid-column: span 5; }
.bento-card.medium-bottom{ grid-column: span 5; }
.bento-card.wide         { grid-column: span 8; }
.bento-card.narrow       { grid-column: span 4; }

@media (max-width: 768px) {
  .bento-grid { grid-template-columns: 1fr; }
  .bento-card { grid-column: span 1 !important; }
}
```

#### Bento Card with Texture Background

```css
.bento-card {
  position: relative;
  min-height: 280px;
  padding: 32px;
  overflow: hidden;

  background:
    linear-gradient(rgba(18, 18, 20, 0.85), rgba(18, 18, 20, 0.85)) padding-box,
    linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0)) border-box;
  border: 1px solid transparent;
  border-radius: 20px;

  isolation: isolate;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.bento-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -20px rgba(0, 0, 0, 0.4);
}

/* Boathouse photo as texture (not banner) */
.bento-card-bg {
  position: absolute;
  inset: 0;
  z-index: -2;

  background-size: cover;
  background-position: center;

  opacity: 0.08;
  filter: grayscale(100%) contrast(1.2);
  mix-blend-mode: luminosity;

  transition: opacity 0.4s ease;
}

.bento-card:hover .bento-card-bg {
  opacity: 0.12;
}
```

#### Spotlight Hover Effect

```tsx
export function SpotlightCard({ children, className }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  return (
    <motion.div className={`bento-card ${className}`} onMouseMove={handleMouseMove}>
      <motion.div
        className="spotlight"
        style={{
          background: `radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(0, 229, 153, 0.08), transparent 60%)`,
        }}
      />
      {children}
    </motion.div>
  );
}
```

---

### 6.3 Data Stream Ticker

Infinite horizontal scroll of rowing metrics with edge fading.

```css
.data-stream {
  position: relative;
  width: 100%;
  overflow: hidden;

  /* Vercel-style edge masks */
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 10%,
    black 90%,
    transparent 100%
  );
}

.data-stream-track {
  display: flex;
  width: max-content;
  animation: scroll-left 40s linear infinite;
}

@keyframes scroll-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.data-stream:hover .data-stream-track {
  animation-play-state: paused;
}

.metric-value {
  font-family: var(--font-mono);
  font-size: 32px;
  font-weight: 600;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.metric-item.highlight .metric-value {
  color: var(--blade-green);
  text-shadow:
    0 0 10px rgba(0, 229, 153, 0.5),
    0 0 30px rgba(0, 229, 153, 0.3);
}

@media (prefers-reduced-motion: reduce) {
  .data-stream-track { animation: none; }
}
```

---

### 6.4 Pricing Section

```css
/* Featured tier - gradient glow border */
.pricing-card.featured {
  position: relative;
  background:
    linear-gradient(var(--void-elevated), var(--void-elevated)) padding-box,
    linear-gradient(
      135deg,
      var(--blade-green) 0%,
      rgba(0, 229, 153, 0.3) 50%,
      var(--coxswain-violet) 100%
    ) border-box;
  border: 1px solid transparent;

  box-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.06),
    0 0 40px -10px rgba(0, 229, 153, 0.3);
}

.pricing-card.featured::before {
  content: 'RECOMMENDED';
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);

  padding: 4px 12px;
  background: var(--blade-green);
  border-radius: 100px;

  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--void-deep);
}
```

---

### 6.5 Navigation Bar

```css
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;

  padding: 16px 24px;

  background: rgba(8, 8, 10, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  opacity: 0;
  transform: translateY(-100%);
  transition: all 0.3s ease;
}

.navbar.visible {
  opacity: 1;
  transform: translateY(0);
}
```

---

## 7. Application UI

### 7.1 Layout Architecture

```
┌──────────────────────────────────────────────────┐
│  ┌────┐  ┌─────────────────────────────────────┐ │
│  │    │  │  Topbar (56px)                      │ │
│  │ 64 │  ├─────────────────────────────────────┤ │
│  │ px │  │                                     │ │
│  │    │  │           Main Canvas               │ │
│  │ S  │  │                                     │ │
│  │ I  │  │                                     │ │
│  │ D  │  │                                     │ │
│  │ E  │  │                                     │ │
│  │ B  │  │                                     │ │
│  │ A  │  │                                     │ │
│  │ R  │  └─────────────────────────────────────┘ │
│  └────┘                                          │
└──────────────────────────────────────────────────┘
```

```css
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--void-deep);
}

.app-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 64px;
  z-index: 50;

  display: flex;
  flex-direction: column;

  background: var(--void-elevated);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.app-main {
  flex: 1;
  margin-left: 64px;
  display: flex;
  flex-direction: column;
}

.app-topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  height: 56px;
  padding: 0 24px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  background: rgba(8, 8, 10, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.app-canvas {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
```

---

### 7.2 Sidebar (Linear Style)

Icon-only, 64px wide, tooltips on hover.

```css
.sidebar-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 48px;
  height: 48px;

  border-radius: 12px;
  color: var(--text-muted);

  transition: all 0.15s ease;
}

.sidebar-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.sidebar-item.active {
  background: rgba(0, 229, 153, 0.1);
  color: var(--blade-green);
}

/* Glow indicator */
.sidebar-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);

  width: 3px;
  height: 20px;

  background: var(--blade-green);
  border-radius: 0 2px 2px 0;
  box-shadow: 0 0 8px var(--blade-green);
}

/* Tooltip */
.sidebar-item[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  left: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%) translateX(-4px);

  padding: 8px 12px;
  background: var(--void-elevated);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);

  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;

  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.sidebar-item:hover[data-tooltip]::after {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
}
```

#### Mobile: Bottom Tab Bar

```css
@media (max-width: 768px) {
  .app-sidebar {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 64px;

    flex-direction: row;
    border-right: none;
    border-top: 1px solid rgba(255, 255, 255, 0.06);

    padding-bottom: env(safe-area-inset-bottom);
  }

  .sidebar-nav {
    flex: 1;
    flex-direction: row;
    justify-content: space-around;
  }

  .app-main {
    margin-left: 0;
    margin-bottom: 64px;
  }
}
```

---

### 7.3 Boat Canvas

The core lineup builder view.

#### Seat Slot

```css
.seat-slot {
  flex-shrink: 0;
  width: 80px;
  min-height: 100px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  padding: 12px 8px;

  background: rgba(255, 255, 255, 0.02);
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 12px;

  transition: all 0.2s ease;
}

.seat-slot.coxswain {
  background: rgba(124, 58, 237, 0.05);
  border-color: rgba(124, 58, 237, 0.2);
}

.seat-slot.drag-over {
  border-color: var(--blade-green);
  border-style: solid;
  background: rgba(0, 229, 153, 0.08);

  box-shadow:
    inset 0 0 20px rgba(0, 229, 153, 0.1),
    0 0 20px rgba(0, 229, 153, 0.2);
}

.seat-slot.filled {
  border-style: solid;
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
}
```

#### Predicted Speed Display

```css
.predicted-speed {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 12px;

  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.predicted-value {
  font-family: var(--font-mono);
  font-size: 36px;
  font-weight: 600;
  color: var(--blade-green);

  text-shadow:
    0 0 10px rgba(0, 229, 153, 0.5),
    0 0 30px rgba(0, 229, 153, 0.3),
    0 0 50px rgba(0, 229, 153, 0.1);
}

.predicted-value.updated {
  animation: pulse-glow 0.6s ease;
}

@keyframes pulse-glow {
  0%, 100% {
    text-shadow:
      0 0 10px rgba(0, 229, 153, 0.5),
      0 0 30px rgba(0, 229, 153, 0.3);
  }
  50% {
    text-shadow:
      0 0 20px rgba(0, 229, 153, 0.8),
      0 0 50px rgba(0, 229, 153, 0.5),
      0 0 80px rgba(0, 229, 153, 0.3);
  }
}

.predicted-delta.positive { color: var(--blade-green); }
.predicted-delta.negative { color: var(--danger-red); }
```

---

### 7.4 Athlete Cards (Trading Card Style)

```css
.athlete-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  width: 90px;
  padding: 12px 8px;

  background: var(--void-elevated);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;

  cursor: grab;
  transition: all 0.2s ease;
  user-select: none;
}

.athlete-card:hover {
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.athlete-card:active {
  cursor: grabbing;
  transform: scale(1.05);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
  z-index: 100;
}
```

#### Whoop-Style Score Ring

```css
.athlete-score-ring {
  position: relative;
  width: 44px;
  height: 44px;
}

.athlete-score-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.08);
  stroke-width: 3;
}

.ring-progress {
  fill: none;
  stroke: var(--blade-green);
  stroke-width: 3;
  stroke-linecap: round;
  filter: drop-shadow(0 0 4px rgba(0, 229, 153, 0.5));
  transition: stroke-dasharray 0.5s ease;
}

/* Zone colors */
.athlete-score-ring[data-zone="green"] .ring-progress {
  stroke: var(--blade-green);
  filter: drop-shadow(0 0 4px rgba(0, 229, 153, 0.5));
}

.athlete-score-ring[data-zone="yellow"] .ring-progress {
  stroke: var(--warning-orange);
  filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.5));
}

.athlete-score-ring[data-zone="red"] .ring-progress {
  stroke: var(--danger-red);
  filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.5));
}

.score-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}
```

---

## 8. Animation System

### Easing Functions

```css
:root {
  /* Snappy - for most UI interactions */
  --ease-snappy: cubic-bezier(0.2, 0.8, 0.2, 1);

  /* Spring - for overshoot effects (toggles, cards) */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Smooth - for longer transitions */
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);

  /* Enter - for elements appearing */
  --ease-enter: cubic-bezier(0, 0, 0.2, 1);

  /* Exit - for elements leaving */
  --ease-exit: cubic-bezier(0.4, 0, 1, 1);
}
```

### Standard Durations

| Duration | Use |
|----------|-----|
| `0.1s` | Micro-interactions (button press) |
| `0.15s` | Hover states |
| `0.2s` | Standard transitions |
| `0.3s` | Card movements |
| `0.5s-0.8s` | Page transitions, hero animations |

### Framer Motion Variants

```tsx
// Fade up entrance
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }
};

// Stagger children
const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

// Scale in
const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }
};
```

---

## 9. Implementation Notes

### Required Dependencies

```json
{
  "dependencies": {
    "framer-motion": "^11.x",
    "@fontsource/fraunces": "^5.x",
    "@fontsource/inter": "^5.x",
    "@fontsource/jetbrains-mono": "^5.x"
  }
}
```

### Font Loading (index.html)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

### Tailwind Config Tokens

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        void: {
          deep: '#08080A',
          surface: '#0c0c0e',
          elevated: '#121214',
        },
        blade: {
          green: '#00E599',
        },
        coxswain: {
          violet: '#7C3AED',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0, 229, 153, 0.4)',
        'glow-violet': '0 0 20px rgba(124, 58, 237, 0.4)',
      },
    },
  },
};
```

### Performance Considerations

1. **Backdrop blur:** Use sparingly. Each blurred element composites separately. Limit to nav, sidebar, key cards.

2. **Text shadows for glow:** Use `text-shadow`, not `filter: drop-shadow()`. Text shadow is GPU-accelerated.

3. **Animations:** Use `transform` and `opacity` only when possible. These are compositor-only properties.

4. **Noise texture:** Keep at 200x200 max, tile with `repeat`. 0.03 opacity or less.

5. **3D transforms:** Only on hero card. Use `will-change: transform` but remove after animation completes.

### Accessibility

- All interactive elements have visible focus states (green glow ring)
- Color contrast meets WCAG AA (text on void backgrounds)
- Reduced motion support via `prefers-reduced-motion`
- Tooltips accessible via keyboard focus
- Semantic HTML structure throughout

---

## Appendix: Quick Reference

### Color Tokens

| Token | Hex | Use |
|-------|-----|-----|
| `--void-deep` | #08080A | Page background |
| `--void-elevated` | #121214 | Cards, sidebar |
| `--blade-green` | #00E599 | Primary accent |
| `--coxswain-violet` | #7C3AED | Secondary accent |
| `--warning-orange` | #F59E0B | Warning states |
| `--danger-red` | #EF4444 | Error states |
| `--text-primary` | #F4F4F5 | Headlines |
| `--text-secondary` | #A1A1AA | Body text |
| `--text-muted` | #52525B | Labels |

### Component Quick Reference

| Component | Key CSS |
|-----------|---------|
| Glass card | `backdrop-filter: blur(20px); border: 1px solid transparent; gradient border-box` |
| Glow button | `::after` with `box-shadow: 0 0 8px accent` |
| Input focus | `box-shadow: 0 0 0 3px rgba(0,229,153,0.15)` |
| Active nav | `box-shadow: 0 0 8px accent` on `::before` indicator |
| Score ring | SVG circle with `stroke-dasharray` and `filter: drop-shadow` |

---

**End of Design Document**

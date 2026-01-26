# UI Micro-Interactions & Data Visualization Research

**Date:** 2026-01-26
**Source:** Gemini CLI Research

---

## 1. Satisfying vs Annoying Micro-Interactions

**Golden Rule:** Should feel like a physical reflex, not a movie special effect.

| Satisfying | Annoying |
|------------|----------|
| Immediate feedback (<100ms) | Delayed trigger (wait for API) |
| Physicality (spring physics) | Linear tweens (robotic) |
| Spatial consistency (origin from trigger) | Teleportation (pop from nowhere) |
| Subtle sound (soft click/thud) | Repetitive loud sounds |

**Implementation Strategy:**
- **Optimistic UI:** Animate success immediately, revert on API fail
- **Hit areas:** 44x44px minimum
- **Cursor cues:** Custom cursors hint interactivity

---

## 2. Framer Motion Patterns

### A. Tactile Button Click
```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.96 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  Save Workout
</motion.button>
```

### B. Success State ("The Pop")
```tsx
{isSuccess ? (
  <motion.div
    key="success"
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.8, opacity: 0 }}
    transition={{ type: "spring", duration: 0.3 }}
  >
    <CheckIcon />
  </motion.div>
) : (
  <motion.div key="default" exit={{ opacity: 0 }}>
    Save
  </motion.div>
)}
```

### C. Animated Number (Ticker Effect)
```tsx
function AnimatedNumber({ value }) {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  );

  useEffect(() => { spring.set(value); }, [value]);

  return <motion.span>{display}</motion.span>;
}
```

---

## 3. Data Visualization for Athletics

### Splits (Pacing)
- **Chart:** Ridgeline Plots or Stacked Area Charts
- **Why:** Shows pace distribution shift over event duration
- **Interaction:** Hover split highlights segment on timeline

### Rankings (Leaderboards)
- **Chart:** Bump Charts (rank flow)
- **Why:** Shows the story - who led early, who faded, who surged
- **Interaction:** Click athlete dims others, traces their path

### Trends (Fitness/Form)
- **Chart:** Small Multiples (Sparklines)
- **Why:** 10 small charts beats 1 messy chart with 10 lines
- **Interaction:** Crosshair moves across all charts simultaneously

---

## 4. Premium App Patterns to Steal

### From Linear (Speed & Keyboard)
- Keyboard shortcuts for date nav (←/→)
- CMD+K for athlete/workout search
- Heavy caching + skeleton screens matching layout

### From Raycast (Command Palette)
- Command bar for instant navigation
- "Show me John Doe's 5k PB" faster than 10 clicks
- Fuzzy search across all entities

### From Things 3 (Delight & Physics)
- "Pull to create" - drag workout card expands physically
- PR celebrations with particle effects / haptics
- Everything feels tactile and weighted

---

## Implementation Priority

### Must Have (Phase 17)
- [ ] Tactile button states (scale on press)
- [ ] Success state transforms (icon swap with pop)
- [ ] Animated numbers for live data
- [ ] Skeleton loaders matching content shape

### Should Have
- [ ] Bump charts for rankings over time
- [ ] Sparklines in tables/cards
- [ ] Crosshair sync across multiple charts

### Nice to Have
- [ ] PR celebration particles
- [ ] Sound design (optional toggle)
- [ ] Custom cursors for drag operations

---

*Research completed: 2026-01-26*

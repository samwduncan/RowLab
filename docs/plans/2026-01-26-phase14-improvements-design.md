# Phase 14+ Improvements Design

**Date:** 2026-01-26
**Status:** Approved

---

## Confirmed Decisions

### 1. Target Audience
- **Primary:** Collegiate programs
- **Universal:** Works for all levels (Club, High School, Collegiate, Elite)
- **No required NCAA compliance** - optional if coach wants to track hours
- **Simple recruiting** - visit scheduling with host assignment

### 2. Feature Architecture
**Progressive Unlock System** - start simple, toggle on advanced features

```
CORE FEATURES (Always on)
├── Roster & Attendance
├── Lineup Builder
├── Erg Data Tracking
├── Training Calendar
└── Basic Seat Racing

ADVANCED FEATURES (Toggle on in Settings)
├── Matrix Seat Racing & Bradley-Terry Rankings
├── Periodization Blocks & TSS Tracking
├── NCAA Compliance Tracking
├── Racing & Regatta Management
├── Recruiting & Visit Management
└── Video Analysis Integration [FUTURE]
```

### 3. Recruit Visit Feature
- Calendar event type: "Recruit Visit"
- Fields: Recruit name, date/time, host athlete
- Schedule: PDF upload OR rich text editor
- Host athlete sees visit in their dashboard
- Optional follow-up tasks

---

## Design Direction

### Philosophy: "Rowing Instrument"
- Precision timing aesthetic (like SpeedCoach display)
- Data-forward design (coaches scan lots of info)
- Unique rowing identity (not generic SaaS)
- Satisfying + Beautiful (not boring dashboards)

### Color Palette

```
DARK MODE (Warm, Premium)
├── Base: #0F0F0F (warm near-black)
├── Surface: #171717 (cards)
├── Elevated: #1F1F1F (modals)
├── Text Primary: #F5F5F4 (warm off-white)
├── Text Secondary: #A8A29E (warm gray)
└── Borders: #292524 (warm dark)

LIGHT MODE (Clean, Professional)
├── Base: #FAFAF9 (warm white)
├── Surface: #FFFFFF (cards)
├── Text: Standard dark hierarchy
└── Same warmth, inverted

ACCENT COLORS (Meaning-Based)
├── Blue: Water/Erg related
├── Green: Starboard / Positive / Success
├── Red: Port / Attention needed
├── Gold: Achievements, PRs
└── Purple: Premium features indicator
```

### Typography
```
HEADINGS: Inter Bold (or Geist)
BODY: Inter Regular
DATA: Geist Mono / JetBrains Mono (tabular nums)
LARGE METRICS: Inter Black, 48-72px

Key: Numbers should feel like looking at a stroke coach
```

### Animations & Micro-interactions

**High-Impact Moments (Go All Out)**
- Success confirmations: Button transforms, color pulse, toast
- PRs: Number pop + gold wash + badge animation
- Drag-drop: Physical feel with lift, shadows, spring physics
- Live data: Rolling digits, color flashes for changes

**Always Restrained**
- Loading states: Clean skeletons, single shimmer
- Scrolling: No parallax effects
- Backgrounds: No auto-playing animations

**Balance Test:** "Would you show this to a friend to say 'look how nice this feels'?"

### Mobile & Responsive

```
MOBILE (< 640px)
├── Bottom tab navigation
├── Tables → Stacked cards
├── Swipe gestures for actions
└── 44px minimum tap targets

TABLET (640-1024px)
├── Collapsible sidebar
├── Hybrid layouts

DESKTOP (> 1024px)
├── Full sidebar
├── Data tables
├── Drag-drop interfaces
```

---

## Roadmap

### Phase 14: Advanced Seat Racing Analytics ⚡ DIFFERENTIATOR
- Bradley-Terry ranking model
- Matrix session planner (Latin Square designs)
- Comparison graph visualization
- Passive ELO from practice data
- Composite ranking (weighted factors)
- Boat speed bias correction

### Phase 15: Feature Toggles & Recruiting
- Progressive unlock system in settings
- Recruit visit management (PDF/text schedule, host assignment)
- Team announcements (simple)
- Smart notifications foundation

### Phase 16: Gamification & Engagement
- Achievement system (badges, milestones)
- Personal records wall
- Team challenges
- Season journey visualization
- Streak tracking

### Phase 17: Complete Design Overhaul 🎨
- Design system foundation (colors, typography, spacing)
- Component library rebuild (buttons, cards, tables, charts)
- Animation system (Framer Motion configs)
- Theme polish (dark, light, field)
- Mobile responsive overhaul
- **Landing page redesign** (match app aesthetic, showcase features)

---

## Research Topics for Gemini

### Phase 14 Research
- [ ] Bradley-Terry model implementation details
- [ ] Latin Square experimental designs for rowing
- [ ] Confidence interval calculations
- [ ] Elite rowing program selection methods

### Design Research
- [ ] Best data visualization patterns for sports apps
- [ ] Premium dark mode design examples
- [ ] Satisfying micro-interaction patterns
- [ ] Landing page best practices for SaaS

---

*Document approved: 2026-01-26*

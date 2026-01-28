# Phase 19: Penpot Design System & Visual Identity - Research

**Researched:** 2026-01-28
**Domain:** Visual Design & Design Systems with Penpot MCP
**Confidence:** MEDIUM

## Summary

This phase is unique in the GSD workflow: it's a **design-first phase** using Penpot MCP to create high-fidelity visual designs before implementation. The research reveals that Penpot's Model Context Protocol (MCP) server enables programmatic design file creation and manipulation via AI assistants, aligning perfectly with Claude Code workflows.

The standard approach for this phase involves:
1. **MCP-driven design creation** using Penpot's plugin API for programmatic design generation
2. **Design system foundation** leveraging existing Phase 17 "Dark Editorial" tokens as the basis
3. **Component library architecture** organizing reusable components with naming conventions for developer handoff
4. **Landing page mockups** following 2026 SaaS best practices (product-led storytelling, interactive demos, minimalist layouts)
5. **Application UI designs** for data-heavy rowing dashboards with mobile-first considerations

**Primary recommendation:** Create a structured Penpot project with organized pages (Landing Page, App UI, Components Library, Brand Identity), use MCP to programmatically generate designs from existing Phase 17 tokens, and export assets/specs for direct implementation in React + Tailwind codebase.

## Standard Stack

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Penpot | 2.x (2026) | Open-source design platform | Only design tool with native design tokens, components, variants + MCP integration |
| Penpot MCP Server | Latest | AI-powered design automation | Official MCP server enables programmatic design via Plugin API |
| Fraunces | Latest | Display/headline serif font | Editorial typography for "Dark Editorial" aesthetic (Phase 17 decision) |
| Inter | Latest | Body text sans-serif | Clean, readable body text (Phase 17 decision) |
| Geist Mono | Latest | Data/metrics monospace | Tabular numbers for precision data display (Phase 17 decision) |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| Lucide Icons | Latest | Icon library | Match existing component patterns (already in codebase) |
| WebSocket client | N/A | Real-time Penpot communication | MCP server uses WebSocket for plugin API calls |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Penpot | Figma | Figma has no MCP integration, closed-source, vendor lock-in; Penpot is programmatically accessible |
| Fraunces serif | Source Serif Pro | Acceptable alternative if Fraunces unavailable, slightly less editorial feel |

**MCP Configuration:**
Already configured in `~/.mcp.json`:
```json
"penpot": {
  "command": "npx",
  "args": ["-y", "mcp-remote", "http://localhost:4401/sse", "--allow-http"]
}
```

## Architecture Patterns

### Recommended Penpot Project Structure
```
RowLab Design System (Penpot Project)
├── 01-Brand-Identity/        # Colors, typography, logo, imagery style
│   ├── Color-Palette          # Inkwell palette, data colors, chart colors
│   ├── Typography-System      # Font samples, sizes, weights, usage
│   └── Visual-Style           # Rowing imagery, photography direction
├── 02-Component-Library/      # Reusable design components
│   ├── Buttons                # Primary, secondary, ghost variants
│   ├── Cards                  # Editorial cards, data cards
│   ├── Forms                  # Inputs, selects, checkboxes
│   ├── Navigation             # Nav bars, tabs, breadcrumbs
│   ├── Data-Viz               # Chart templates, metric displays
│   └── Layout                 # Grid systems, spacing examples
├── 03-Landing-Page/           # Full landing page mockups
│   ├── Hero-Section           # Desktop + mobile
│   ├── Features-Bento         # Bento grid layout variations
│   ├── Technology-Cards       # Tech showcase section
│   ├── Gallery                # Image/video gallery layouts
│   └── CTA-Sections           # Call-to-action designs
├── 04-App-UI-Dashboard/       # Application interface mockups
│   ├── Dashboard-Home         # Overview/metrics dashboard
│   ├── Athletes-Roster        # Athlete management UI
│   ├── Lineup-Builder         # Boat lineup creation
│   └── Mobile-Views           # Mobile-first layouts
└── 05-Design-Specs/           # Developer handoff assets
    ├── Component-Specs        # Measurements, behaviors
    └── Export-Assets          # Icons, images, logos
```

### Pattern 1: Design Token Organization
**What:** Use Penpot's native Asset Libraries to store design tokens as reusable colors and typographies
**When to use:** Foundation phase before creating any components
**Example:**
```javascript
// Via Penpot MCP Plugin API (execute code in plugin context)
// Create color tokens matching Phase 17 tokens
const inkwellColors = {
  'Ink/Deep': '#0A0A0A',
  'Ink/Base': '#121212',
  'Ink/Raised': '#1A1A1A',
  'Ink/Border': '#262626',
  'Ink/Primary': '#E5E5E5',
  'Ink/Bright': '#FAFAFA',
};

const dataColors = {
  'Data/Excellent': '#22C55E',
  'Data/Good': '#3B82F6',
  'Data/Warning': '#F59E0B',
  'Data/Poor': '#EF4444',
};

// Use slash notation for hierarchical organization
// Penpot auto-creates groups from slash-separated names
```

### Pattern 2: Component with Variants
**What:** Create master components with multiple variants (states, sizes, themes)
**When to use:** For interactive elements like buttons, cards, inputs
**Example:**
```javascript
// Button component with variants
// Primary component: "Button/Primary"
// Variants: Default, Hover, Disabled
// Sizes: Small, Medium, Large
// Each variant is a separate component instance
// Developers can see all states in single component frame
```

### Pattern 3: Bento Grid Landing Layout
**What:** Mixed-density grid layout following Phase 17 implementation patterns
**When to use:** Landing page features section to show varied content density
**Best practices:**
- Use explicit column/row sizing (no auto-flow initially)
- Mix small (1x1), medium (2x1, 1x2), and large (2x2) tiles
- Maintain consistent gap spacing (24px typical)
- Use glassmorphism effects (`bg-white/[0.03]`, backdrop-blur)
- Reserve color for data metrics within tiles

### Pattern 4: Mobile-First Dashboard
**What:** Design mobile layouts first, then scale up to desktop
**When to use:** All application UI screens (dashboard, rosters, lineups)
**Best practices:**
- 44px minimum touch targets (WCAG compliance)
- Stack cards vertically on mobile
- Prioritize critical metrics in fold
- Use collapsible sections for secondary data
- Test with real rowing images at small sizes

### Anti-Patterns to Avoid
- **Designing in isolation:** Don't create designs without referencing existing Phase 17 CSS variables and component patterns
- **Over-designing states:** Focus on default, hover, active, disabled. Don't create excessive micro-interaction variants
- **Ignoring existing assets:** Must integrate 16+ rowing images and 5 videos from `public/images/rowing/`
- **Breaking monochrome UI:** UI chrome must remain grayscale; only data gets color (Phase 17 principle)
- **Complex spring animations:** Phase 17 uses precise ease-out curves, not bouncy physics (avoid designing "bouncy" interactions)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Custom icon creation | Don't draw icons from scratch | Lucide Icons (already in codebase) | Consistency with existing app; 1000+ icons available |
| Color palette generation | Don't invent new colors | Phase 17 Inkwell palette (Tailwind config) | Design system already defined; developer handoff easier |
| Typography scale | Don't create font sizes manually | Tailwind fontSize scale (xs, sm, base, lg, xl...) | Matches existing implementation; easier to implement |
| Motion timing curves | Don't design custom easings | Tailwind transitions (fast: 100ms, normal: 150ms, slow: 200ms) | Already configured; matches "Precision Instrument" philosophy |
| Glassmorphism effects | Don't design arbitrary blur/opacity | Existing patterns: `bg-white/[0.03]`, `backdrop-blur` | Matches landing page implementation |

**Key insight:** Phase 17 already established comprehensive design tokens in `tailwind.config.js` (400+ lines). Penpot designs should **visualize these tokens**, not invent new ones. The MCP approach allows programmatic generation of components that match the token system exactly.

## Common Pitfalls

### Pitfall 1: Design-Code Drift
**What goes wrong:** Designs use colors/spacing/fonts that don't exist in Tailwind config
**Why it happens:** Designer doesn't reference existing CSS variables and Tailwind tokens
**How to avoid:**
- Start by importing Phase 17 color palette into Penpot as Asset Library colors
- Use only fonts available in `tailwind.config.js`: Fraunces (display), Inter (sans), Geist Mono (mono/metric)
- Reference existing spacing scale (4px increments)
**Warning signs:** Developer says "this color/spacing isn't in Tailwind"; re-implementation required

### Pitfall 2: Over-Scoping Design System
**What goes wrong:** Team tries to design every possible component and state upfront
**Why it happens:** Traditional design system approach of "complete library first"
**How to avoid:**
- Focus on landing page needs first (hero, bento grid, CTA)
- Then core app UI (dashboard, athlete cards, lineup builder)
- Create components as needed, not exhaustively
**Warning signs:** Spending days on component library before any landing page mockups exist

### Pitfall 3: Ignoring Existing Implementation
**What goes wrong:** Designs don't match current landing page architecture (bento grid, spotlight effects, framer-motion patterns)
**Why it happens:** Not reviewing existing `LandingPage.tsx` implementation before designing
**How to avoid:**
- Review current landing page structure (hero, features bento, tech cards, gallery, audience split, CTA)
- Maintain bento grid for features section
- Design within existing motion patterns (fade-in-up reveals, staggered animations)
- Keep spotlight UI hover effects on cards
**Warning signs:** Designs propose drastically different layouts requiring full rewrite

### Pitfall 4: Poor Developer Handoff Documentation
**What goes wrong:** Developers can't translate designs to code; missing specs for spacing, states, behaviors
**Why it happens:** Assuming Penpot Inspect mode is sufficient; not providing measurements and notes
**How to avoid:**
- Annotate components with spacing measurements (8px, 16px, 24px)
- Document interactive states (hover, active, disabled, loading)
- Specify data-driven color logic ("green if above target, red if below")
- Export assets in correct formats (SVG for icons, WebP/PNG for images)
**Warning signs:** Developer asks multiple clarification questions about measurements or behaviors

### Pitfall 5: Misunderstanding MCP Workflow
**What goes wrong:** Expecting to manually click-and-drag in Penpot UI; not leveraging MCP for programmatic generation
**Why it happens:** Traditional design tool mindset; unfamiliarity with code-driven design
**How to avoid:**
- Use MCP to execute code snippets that generate shapes, boards, components
- Leverage Penpot Plugin API for batch operations (create 16 image tiles for gallery)
- Think "design as code" for reproducibility and speed
- Manual refinement is for final polish, not initial creation
**Warning signs:** Spending hours manually creating repetitive elements that could be scripted

## Code Examples

### Example 1: MCP Tool Usage (Executing Code in Plugin Context)
```javascript
// Via mcp__penpot__* tools (exact tool names TBD - check MCP server docs)
// General pattern: Execute JavaScript in Penpot Plugin API context

// Example: Create a color palette from Phase 17 tokens
const createColorPalette = () => {
  const inkwellColors = [
    { name: 'Ink/Deep', hex: '#0A0A0A' },
    { name: 'Ink/Base', hex: '#121212' },
    { name: 'Ink/Raised', hex: '#1A1A1A' },
    { name: 'Ink/Border', hex: '#262626' },
    { name: 'Ink/Primary', hex: '#E5E5E5' },
    { name: 'Ink/Bright', hex: '#FAFAFA' },
  ];

  inkwellColors.forEach(color => {
    // Use Penpot Plugin API to create color asset
    // (Exact API TBD - refer to penpot-mcp documentation)
    penpot.library.createColor(color.name, color.hex);
  });
};

// Execute via MCP server call
```

### Example 2: Component Asset Organization
```javascript
// Naming convention for components (slash notation creates groups)
const componentNames = [
  'Button/Primary',
  'Button/Secondary',
  'Button/Ghost',
  'Card/Editorial',
  'Card/Data',
  'Metric/Large',
  'Metric/Small',
  'Input/Text',
  'Input/Select',
];

// Penpot auto-creates groups:
// Button/
//   ├── Primary
//   ├── Secondary
//   └── Ghost
// Card/
//   ├── Editorial
//   └── Data
```

### Example 3: Typography Style Definition
```javascript
// Create typography assets matching Tailwind config
const typographyStyles = [
  { name: 'Display/Hero', font: 'Fraunces', size: 72, weight: 600, lineHeight: 1.1 },
  { name: 'Display/H1', font: 'Fraunces', size: 48, weight: 600, lineHeight: 1.15 },
  { name: 'Body/Large', font: 'Inter', size: 18, weight: 400, lineHeight: 1.75 },
  { name: 'Body/Base', font: 'Inter', size: 15, weight: 400, lineHeight: 1.5 },
  { name: 'Mono/Metric', font: 'Geist Mono', size: 48, weight: 600, lineHeight: 1.1 },
  { name: 'Mono/Data', font: 'Geist Mono', size: 13, weight: 500, lineHeight: 1.25 },
];

// Use Penpot Plugin API to create typography assets
// Developers can reference these by name in Inspect mode
```

### Example 4: Image Import for Gallery
```javascript
// Import rowing images from public/images/rowing/
const rowingImages = [
  'rowing-1.jpg', 'rowing-2.jpg', 'rowing-3.jpg', 'rowing-4.jpg',
  'rowing-5.jpg', 'rowing-6.jpg', 'rowing-7.jpg', 'rowing-8.jpg',
  'rowing-9.jpg', 'rowing-10.jpg', 'rowing-11.jpg', 'rowing-12.jpg',
  'rowing-13.jpg', 'rowing-14.jpg', 'rowing-15.jpg', 'rowing-16.jpg',
];

// Use MCP to import images as components or place in frames
// For gallery layout mockup: create bento grid with mixed image sizes
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual Figma design → manual handoff | Penpot MCP → programmatic design | January 2026 | AI-driven design workflows; code-first design generation |
| Export static PNGs for specs | Inspect mode with live CSS/HTML | Penpot 2.0 (2024) | Real-time code snippets; no more screenshot specs |
| Generic dark mode | "Dark Editorial" aesthetic | Phase 17 (completed) | Monochrome UI with chromatic data; editorial typography |
| Figma-style components | Native design tokens + variants | Penpot 2.0 (2024) | CSS-based component system; easier dev handoff |

**Deprecated/outdated:**
- **Graphics asset type:** Deprecated in Penpot 2.0+, replaced by components system
- **Manual icon creation:** Use Lucide Icons library (already integrated in RowLab codebase)
- **Isolated design files:** Penpot shared libraries allow real-time updates across files

## SaaS Landing Page Best Practices (2026)

Based on research, high-performing SaaS landing pages in 2026 follow these patterns:

### Hero Section
- **Product-led storytelling:** Show real product interface, not abstract illustrations
- **Outcome-focused headline:** Answer "what is it, who it's for, why it matters" in hero copy
- **Dual CTAs:** Primary (sign up) and secondary (see demo) actions
- **Social proof nearby:** Logos, testimonials, metrics close to CTA
- **Real visuals:** Screenshots or embedded product preview over 3D abstract shapes

**RowLab-specific:**
- Show actual dashboard preview in hero (data metrics glowing on dark background)
- Headline focus: "Your team's data, in print-quality dark" (editorial angle)
- Integrate rowing imagery (boathouse-sunset.jpg, crew-on-water.jpg as hero background)

### Features Section
- **Interactive product demos:** Embedded previews, video demos, guided tours in features section
- **Minimalist layouts:** Cut anything that doesn't support conversion; limit secondary actions
- **Bento grid:** Mixed-density layout (small/medium/large tiles) for visual interest
- **Concrete workflows:** Show primary screen or flow, not generic illustrations

**RowLab-specific:**
- Continue bento grid pattern from existing landing page
- Feature tiles show real data viz (charts, metrics) with chromatic colors
- Use autoplaying videos (muted/looping) for dynamic feel

### CTA Placement
- **Hero CTA:** Primary action above fold
- **Repeated CTAs:** Every 2-3 sections, not just end of page
- **Personalization:** Dynamic text, pricing previews, segmented messaging (2026 trend)

### Mobile-First Considerations
- **44px touch targets:** WCAG compliance for buttons/links
- **Stack vertically:** Hero content, feature tiles, CTAs all stack on mobile
- **Reduce imagery:** Prioritize text/CTAs over large images on small screens

## Rowing Dashboard Design Patterns

Based on research of rowing apps and sports dashboards:

### Data Visualization
- **Real-time metrics:** Speed, stroke rate, heart rate displayed with large monospace numbers
- **Performance coloring:** Green (above target), blue (on target), amber (below), red (needs attention)
- **Glowing emphasis:** Subtle text-shadow on critical metrics (matches Phase 17 implementation)
- **Clean spacing:** Generous whitespace around data for readability

### Dashboard Layout
- **Soft, elegant analytics:** Pastel palettes for charts (RowLab uses muted chart-1 through chart-6 colors)
- **Structured with clean spacing:** Grid-based layout, 16-24px gaps typical
- **Friendly yet professional:** Not cold/sterile; inviting interface with personality

### Mobile Dashboard
- **Priority metrics first:** Show most critical data in fold on mobile
- **Collapsible sections:** Secondary data hidden behind expand/collapse
- **Horizontal scroll for tables:** Allow scrolling for wide data tables vs forcing all columns visible
- **Bottom navigation:** Thumb-friendly nav bar for mobile app feel

## Open Questions

1. **Penpot MCP Tool Names**
   - What we know: MCP server exists at `http://localhost:4401/sse`, uses Penpot Plugin API
   - What's unclear: Exact tool names (mcp__penpot__execute? mcp__penpot__query?), parameter schemas
   - Recommendation: Check MCP server tool list at start of implementation; docs may be at GitHub repo

2. **Font Availability in Penpot**
   - What we know: Penpot supports custom fonts; Fraunces available via Google Fonts
   - What's unclear: Whether Geist Mono (from Vercel) is available in Penpot or needs manual upload
   - Recommendation: Test font availability during setup; fallback to JetBrains Mono if Geist unavailable

3. **Image Import Workflow**
   - What we know: Penpot allows image import; MCP can programmatically place images
   - What's unclear: Best practice for importing 16+ rowing images (individual vs batch import)
   - Recommendation: Use MCP batch operation to import all rowing images at once; create image gallery mockup programmatically

4. **Design Handoff Format**
   - What we know: Penpot Inspect mode provides CSS/HTML; can export assets as SVG/PNG
   - What's unclear: Whether to export all components as individual SVG files or rely on Inspect mode only
   - Recommendation: For icons/graphics use SVG export; for layouts use Inspect mode + screenshots; annotate directly in Penpot

5. **Interactive Prototype Requirements**
   - What we know: Penpot supports prototyping with interactive links between frames
   - What's unclear: Whether landing page mockups need interactive prototypes or static frames sufficient
   - Recommendation: Create static high-fidelity mockups first; add interactive prototype only if needed for stakeholder review

## Sources

### Primary (HIGH confidence)
- [Penpot Asset Libraries Documentation](https://help.penpot.app/user-guide/libraries/) - Component, color, typography management
- [Penpot Design Systems 101 Blog](https://penpot.app/blog/penpot-for-design-systems-101/) - Design system best practices
- [Penpot Official MCP Server GitHub](https://github.com/penpot/penpot-mcp) - MCP architecture and setup
- [Smashing Magazine: Penpot MCP Servers Article](https://www.smashingmagazine.com/2026/01/penpot-experimenting-mcp-servers-ai-powered-design-workflows/) - MCP technical details
- RowLab Phase 17 REDESIGN-BRIEF.md - Dark Editorial design system specification
- RowLab tailwind.config.js - Design tokens and implementation constraints

### Secondary (MEDIUM confidence)
- [Build Design Systems With Penpot Components - Smashing Magazine](https://www.smashingmagazine.com/2024/07/build-design-systems-penpot-components/) - Component architecture patterns
- [10 SaaS Landing Page Design Best Practices 2026](https://www.designstudiouiux.com/blog/saas-landing-page-design/) - Landing page patterns
- [Top Landing Page Design Trends for B2B SaaS in 2026 - SaaS Hero](https://www.saashero.net/content/top-landing-page-design-trends/) - Hero section best practices
- [Figma Developer Handoff Guide](https://www.figma.com/best-practices/guide-to-developer-handoff/) - General handoff best practices (applicable to Penpot)
- [LogRocket: Building Functional UI from Design Mockups with Penpot](https://blog.logrocket.com/building-functional-ui-design-mockups-penpot/) - Penpot to code workflow
- [7 Ways Penpot Empowers Developers](https://penpot.app/blog/7-ways-penpot-empowers-developers-to-do-their-best-work/) - Developer handoff features

### Tertiary (LOW confidence)
- [Best Dashboard Design Examples 2026 - Muzli Blog](https://muz.li/blog/best-dashboard-design-examples-inspirations-for-2026/) - Dashboard design inspiration (general, not rowing-specific)
- [Design System Pitfalls - Medium](https://medium.com/@withinsight1/design-systems-pitfalls-6b3113fa0898) - Common mistakes (not Penpot-specific)
- [Design System Adoption Pitfalls - Netguru](https://www.netguru.com/blog/design-system-adoption-pitfalls) - Cultural challenges (generic)

## Metadata

**Confidence breakdown:**
- Penpot MCP capabilities: MEDIUM - Official server exists, but tool names/parameters need validation at start of implementation
- Design system patterns: HIGH - Phase 17 tokens well-documented; Tailwind config comprehensive
- Landing page best practices: HIGH - Multiple consistent sources from 2026; verified patterns
- Dashboard design patterns: MEDIUM - General sports/fitness trends identified; rowing-specific details from app reviews
- Developer handoff workflow: HIGH - Penpot Inspect mode well-documented; export capabilities verified

**Research date:** 2026-01-28
**Valid until:** 2026-02-28 (30 days) - Design trends stable; MCP server actively developed, check for updates

**Key constraints from existing codebase:**
- Tailwind CSS with extensive custom theme (400+ lines)
- Framer Motion for animations (complex motion)
- React functional components with feature-folder structure
- Existing landing page uses bento grid, glassmorphism, spotlight effects
- 16 rowing images + 5 videos available in `public/images/rowing/`
- Dark Editorial aesthetic: monochrome UI, chromatic data only

**Success criteria for planning:**
- [ ] Understand Penpot MCP workflow (execute code in plugin context via WebSocket)
- [ ] Identify exact component structure needed (landing page sections + app UI screens)
- [ ] Map Phase 17 tokens to Penpot Asset Library structure
- [ ] Define developer handoff deliverables (Inspect mode + annotations + exported assets)
- [ ] Plan for rowing image integration (16 images in gallery/features)
- [ ] Establish mobile-first design approach for dashboard mockups

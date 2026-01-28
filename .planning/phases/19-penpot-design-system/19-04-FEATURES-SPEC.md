# Phase 19-04: Features Bento Grid & Technology Cards Specification

**Created:** 2026-01-28
**Purpose:** Comprehensive design specification for landing page features bento grid, technology cards, and integration badges sections
**Implementation:** Manual Penpot creation using this specification

---

## Overview

This specification documents the design for three key landing page sections:

1. **Features Bento Grid**: 6-8 mixed-size tiles showcasing product capabilities
2. **Technology Cards**: 3 cards highlighting technical differentiators
3. **Integration Badges**: 4 partner ecosystem badges

All designs follow Phase 17 "Dark Editorial" aesthetic with Phase 19 design system foundation (colors and typography from Plans 19-01 and 19-02).

---

## Penpot Project Structure

**Page:** `03-Landing-Page` (created in Plan 19-01)
**New Frames:**
- `Features-Bento` (1920×2400)
- `Features-Bento-Mobile` (375×2800)
- `Technology-Cards` (1920×800)
- `Technology-Cards-Mobile` (375×1200)
- `Integration-Badges` (1920×400)
- `Integration-Badges-Mobile` (375×600)

---

## Section 1: Features Bento Grid

### Desktop Layout (1920×2400 frame)

**Frame:** `Features-Bento`
**Background:** Ink/Deep (#0A0A0A)

#### Container Specifications
- **Max-width:** 1200px
- **Centered horizontally:** 360px offset from left (1920 - 1200 = 720 / 2 = 360)
- **Padding-top:** 120px
- **Grid structure:** 3 columns × auto rows
- **Column template:** 1fr 1fr 1fr (each ~384px at 1200px container)
- **Gap:** 24px

#### Grid Layout Pattern

```
┌─────────────────────────────────────────────┐
│  Section Header (centered, full-width)      │
├──────────────┬──────────────┬──────────────┤
│              │              │              │
│  Athlete Mgmt (2x1)         │ Seat Racing  │
│              │              │   (1x2)      │
│              │              │   TALL       │
├──────────────┼──────────────┤              │
│              │              │              │
│ Lineup Builder (2x2 HERO)   │              │
│              │              ├──────────────┤
│              │              │              │
│              │              │ Erg Perform  │
├──────────────┼──────────────┼──────────────┤
│              │              │              │
│ Training Cal │  Race Day    │  Roster Mgmt │
│              │   (VIDEO)    │              │
└──────────────┴──────────────┴──────────────┘
```

**CSS Grid equivalent:**
```
grid-template-columns: repeat(3, 1fr);
grid-auto-rows: 300px;
gap: 24px;

Athlete Management: grid-column: span 2 / grid-row: span 1
Seat Racing: grid-column: span 1 / grid-row: span 2
Lineup Builder: grid-column: span 2 / grid-row: span 2
Erg Performance: grid-column: span 1 / grid-row: span 1
Training Calendar: grid-column: span 1 / grid-row: span 1
Race Day: grid-column: span 1 / grid-row: span 1
Roster Management: grid-column: span 1 / grid-row: span 1
```

---

### Tile 1: Athlete Management (2x1 Large)

**Position:** Column 1-2, Row 1
**Size:** 792×300px (2 columns + 24px gap)
**Background Image:** rowing-1.jpg (from Visual-Style placeholders)

#### Tile Structure
```
Background layer:
├─ Image: rowing-1.jpg (fill container, object-fit: cover)
├─ Dark overlay gradient: linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.7) 100%)
└─ Glassmorphism overlay: bg-white/[0.03], backdrop-blur-sm

Content layer (relative, z-index: 10):
├─ Icon: Users (Lucide) - 24px, color: Ink/Primary (#E5E5E5)
├─ Title: "Athlete Management"
│   └─ Typography: Body/Large Bold (Inter 18px, 600 weight)
│   └─ Color: Ink/Bright (#FAFAFA)
│   └─ Position: 24px from top, 24px from left
├─ Description: "Complete roster management with biometrics, attendance, and performance tracking"
│   └─ Typography: Body/Base (Inter 15px, 400 weight)
│   └─ Color: Ink/Secondary (#A3A3A3)
│   └─ Position: Below title, 12px gap
│   └─ Max-width: 400px
└─ Preview: Avatar stack (3-4 colored circles)
    └─ Position: Bottom-right, 24px from edges
    └─ Circles: 32px diameter, -8px overlap
    └─ Colors: Data/Excellent, Data/Good, Data/Warning (from Asset Library)
```

#### Exact Positioning
- **Icon:** x=24, y=24
- **Title:** x=24, y=56 (icon + 8px gap)
- **Description:** x=24, y=86 (title + 12px gap)
- **Avatar stack:** x=700 (right-aligned with -24px margin), y=244 (bottom-aligned with -32px margin)

#### Border & Effects
- **Border:** 1px solid Ink/Border (#262626)
- **Border-radius:** 12px
- **Spotlight effect:** CSS custom properties --mouse-x, --mouse-y
  - Note: "Radial gradient at mouse position creates subtle highlight on hover"

---

### Tile 2: Seat Racing Analytics (1x2 Tall)

**Position:** Column 3, Row 1-2
**Size:** 384×624px (1 column, 2 rows + 24px gap)
**Background Image:** rowing-3.jpg

#### Tile Structure
```
Background layer:
├─ Image: rowing-3.jpg (fill container, object-fit: cover, position: center)
├─ Dark overlay gradient: linear-gradient(180deg, rgba(10,10,10,0.4) 0%, rgba(10,10,10,0.8) 100%)
└─ Glassmorphism overlay: bg-white/[0.03], backdrop-blur-sm

Content layer:
├─ Icon: BarChart3 (Lucide) - 24px, color: Ink/Primary
├─ Title: "Statistical Rankings"
│   └─ Typography: Body/Large Bold
│   └─ Color: Ink/Bright
├─ Description: "Bradley-Terry model with confidence intervals"
│   └─ Typography: Body/Base
│   └─ Color: Ink/Secondary
│   └─ Max-width: 300px
└─ Preview: Mini rankings list (3 rows)
    ├─ Row 1: "1  Thompson  2.47  ±0.12"
    ├─ Row 2: "2  Garcia   2.31  ±0.15"
    └─ Row 3: "3  Chen     2.18  ±0.11"
    └─ Styling:
        ├─ Background: bg-white/[0.02]
        ├─ Padding: 12px
        ├─ Border-radius: 8px
        ├─ Typography: Mono/Data (Geist Mono 13px, 500 weight)
        ├─ Rating color: Data/Good (#3B82F6)
        ├─ Confidence color: Ink/Tertiary (#737373)
```

#### Exact Positioning
- **Icon:** x=24, y=24
- **Title:** x=24, y=56
- **Description:** x=24, y=86
- **Preview:** x=24, y=400 (positioned near bottom)
  - Each row: height 40px, gap 8px between rows

---

### Tile 3: Lineup Builder (2x2 HERO)

**Position:** Column 1-2, Row 2-3
**Size:** 792×624px (2×2 grid spanning 4 cells)
**Background:** **VIDEO placeholder** - hero-video.mp4 OR rowing-5.jpg

#### VIDEO Implementation Note
```
If using video:
- Create frame with prominent "VIDEO" label
- Text: "VIDEO: hero-video.mp4" or "VIDEO: video-2.mp4"
- Typography: Mono/Metric (Geist Mono 48px, 600 weight)
- Color: Ink/Secondary (#A3A3A3)
- Position: Centered in frame
- Note below video label: "Inline video - click to play, shows lineup drag-drop in action"
- Playback behavior: Autoplay, muted, loop, playsInline

If using image:
- Use rowing-5.jpg as fallback
```

#### Tile Structure
```
Background layer:
├─ VIDEO: hero-video.mp4 (autoplay, muted, loop) OR Image: rowing-5.jpg
├─ Dark overlay: rgba(10,10,10,0.5)
└─ Glassmorphism: bg-white/[0.03]

Content layer:
├─ Icon: Ship (Lucide) - 32px (larger for hero tile)
├─ Title: "Visual Lineup Builder"
│   └─ Typography: Display/H3 (Fraunces 24px, 600 weight)
│   └─ Color: Ink/Bright
├─ Description: "Drag-drop boat configuration with real-time validation"
│   └─ Typography: Body/Large (Inter 18px)
│   └─ Color: Ink/Secondary
│   └─ Max-width: 500px
└─ Preview: Mini boat diagram
    ├─ 8 colored seat rectangles (16×48px each)
    ├─ Colors alternating: Rowing/Port (#DC2626), Rowing/Starboard (#16A34A)
    ├─ Layout: Vertical stack with 4px gaps
    ├─ Position: Bottom-right corner
```

#### Exact Positioning
- **Icon:** x=32, y=32 (larger padding for hero)
- **Title:** x=32, y=72
- **Description:** x=32, y=110
- **Boat diagram:** x=668, y=500 (bottom-right with margins)

---

### Tile 4: Erg Performance (1x1)

**Position:** Column 3, Row 3
**Size:** 384×300px
**Background Image:** rowing-2.jpg

#### Tile Structure
```
Background layer:
├─ Image: rowing-2.jpg
├─ Dark overlay: rgba(10,10,10,0.6)
└─ Glassmorphism: bg-white/[0.03]

Content layer:
├─ Icon: Timer (Lucide) - 24px
├─ Title: "Erg Tracking"
├─ Description: "Concept2 integration"
└─ Preview: Split time display
    ├─ "1:42.3" in large monospace
    ├─ Typography: Mono/Metric (Geist Mono 48px, 600 weight)
    ├─ Color: Data/Good (#3B82F6) with glow
    ├─ Text-shadow: 0 0 40px rgba(59,130,246,0.25)
    ├─ Position: Center of tile
```

#### Exact Positioning
- **Icon:** x=24, y=24
- **Title:** x=24, y=56
- **Description:** x=24, y=86
- **Split time:** x=192 (centered), y=180

---

### Tile 5: Training Calendar (1x1)

**Position:** Column 1, Row 4
**Size:** 384×300px
**Background:** Ink/Raised (#1A1A1A) - no image for cleaner data focus

#### Tile Structure
```
Background layer:
├─ Solid color: Ink/Raised
├─ Border: 1px solid Ink/Border
└─ No image (allows focus on calendar icon and description)

Content layer:
├─ Icon: Calendar (Lucide) - 24px, color: Ink/Primary
├─ Title: "Practice Planning"
│   └─ Typography: Body/Large Bold
├─ Description: "NCAA compliance tracking"
│   └─ Typography: Body/Base
└─ Optional: Small calendar grid preview (7×5 grid of dots)
    ├─ 7px circles in 3-row grid
    ├─ Colors: mix of Ink/Border (inactive) and Data/Excellent (active days)
    ├─ Position: Bottom-left
```

---

### Tile 6: Race Day (1x1)

**Position:** Column 2, Row 4
**Size:** 384×300px
**Background:** **VIDEO placeholder** - video-3.mp4 OR rowing-4.jpg

#### VIDEO Implementation Note
```
VIDEO placeholder styling:
- Frame with "VIDEO" label
- Text: "VIDEO: video-3.mp4"
- Typography: Mono/Metric (48px, 600 weight)
- Note: "Thumbnail with play icon - modal playback"
- Play button overlay:
  ├─ Circle: 64px diameter
  ├─ Background: bg-white/20, backdrop-blur
  ├─ Border: 2px solid white
  ├─ Play triangle: 20px, color white
  ├─ Position: Centered in frame
  ├─ Box-shadow: 0 8px 32px rgba(0,0,0,0.4)
```

#### Tile Structure
```
Content layer:
├─ Icon: Trophy (Lucide) - 24px
├─ Title: "Regatta Management"
├─ Description: "Real-time race coordination"
└─ Play button (if video)
```

---

### Tile 7: Roster Management (1x1)

**Position:** Column 3, Row 4
**Size:** 384×300px
**Background Image:** rowing-15.jpg

#### Tile Structure
```
Background layer:
├─ Image: rowing-15.jpg
├─ Dark overlay: rgba(10,10,10,0.6)
└─ Glassmorphism: bg-white/[0.03]

Content layer:
├─ Icon: Users (Lucide) - 24px
├─ Title: "Roster Management"
├─ Description: "Complete athlete database with biometrics and performance"
```

---

### Mobile Layout (375×2800 frame)

**Frame:** `Features-Bento-Mobile`
**Background:** Ink/Deep (#0A0A0A)

#### Layout Changes
- **Single column:** Full-width tiles
- **Container padding:** 16px left/right
- **Tile width:** 343px (375 - 32px padding)
- **Tile height:** 280px (reduced from desktop 300px)
- **Gap:** 16px between tiles
- **Stacking order:** Same as desktop (Athlete Mgmt → Seat Racing → Lineup → Erg → Training → Race Day → Roster)

#### Mobile Tile Adjustments
- **Reduce image background opacity:** Add darker overlay (rgba(10,10,10,0.8) instead of 0.6)
- **Increase text contrast:** Ensure readability on small screens
- **Hero tile (Lineup Builder):** Same height as others (280px) - remove 2x2 spanning
- **Video labels:** Reduce font size to Mono/Data (32px instead of 48px)
- **Preview elements:** Scale down or hide on smallest tiles
- **Icon size:** Keep at 24px (touch-friendly)

#### Mobile-Specific Positioning Template
```
Each tile:
- Padding: 20px (slightly reduced from desktop 24px)
- Icon: x=20, y=20
- Title: x=20, y=52
- Description: x=20, y=82, max-width: 300px
- Preview (if present): Position bottom with 20px margin
```

---

## Section 2: Technology Cards

### Desktop Layout (1920×800 frame)

**Frame:** `Technology-Cards`
**Background:** Ink/Base (#121212) - slightly lighter than Deep for section separation

#### Section Header
```
Position: Centered, 360px from left (matching bento grid container)
├─ Eyebrow: "Built for Serious Programs"
│   └─ Typography: Label/Large (Inter Medium 14px, 500 weight)
│   └─ Color: Ink/Secondary (#A3A3A3)
│   └─ Transform: uppercase, letter-spacing: 0.1em
├─ Title: "Technical Excellence Under the Hood"
│   └─ Typography: Display/H2 (Fraunces 36px, 600 weight)
│   └─ Color: Ink/Bright (#FAFAFA)
│   └─ Position: 16px below eyebrow
└─ Subtitle: (optional, omitted for brevity)
```

**Header Positioning:**
- **Eyebrow:** x=360, y=80
- **Title:** x=360, y=108

#### Card Container
- **Max-width:** 1200px
- **Layout:** 3 columns, equal width
- **Grid:** repeat(3, 1fr)
- **Gap:** 32px
- **Margin-top from header:** 80px

#### Card Dimensions
- **Width:** ~379px each (1200px - 64px gaps / 3)
- **Height:** 400px
- **Auto-height:** Content-based, min 400px

---

### Card 1: Bradley-Terry Statistical Model

**Position:** Column 1
**Size:** 379×400px

#### Card Structure
```
Container:
├─ Background: Ink/Raised (#1A1A1A)
├─ Border: 1px solid Ink/Border (#262626)
├─ Border-radius: 12px
├─ Padding: 32px
└─ Spotlight effect: --mouse-x, --mouse-y (same as bento tiles)

Content:
├─ Icon: Brain (Lucide)
│   └─ Size: 48px
│   └─ Color: Ink/Secondary (#A3A3A3)
│   └─ Position: x=32, y=32
├─ Badge: "PhD-level statistics"
│   └─ Background: bg-white/[0.05]
│   └─ Border: 1px solid Ink/Border
│   └─ Border-radius: 16px (pill shape)
│   └─ Padding: 4px 12px
│   └─ Typography: Label/Small (Inter Medium 12px, 500 weight)
│   └─ Color: Ink/Primary (#E5E5E5)
│   └─ Transform: uppercase, letter-spacing: 0.05em
│   └─ Position: Top-right, x=280, y=32
├─ Title: "Bradley-Terry Statistical Model"
│   └─ Typography: Body/Large Bold (Inter 18px, 600 weight)
│   └─ Color: Ink/Bright (#FAFAFA)
│   └─ Position: Below icon, 24px gap, x=32, y=104
└─ Description: "Maximum likelihood estimation with boat speed normalization and confidence intervals"
    └─ Typography: Body/Base (Inter 15px, 400 weight)
    └─ Color: Ink/Secondary (#A3A3A3)
    └─ Line-height: 1.6
    └─ Position: Below title, 16px gap, x=32, y=140
    └─ Max-width: 315px (card width - 64px padding)
```

#### Spotlight Effect Documentation
```
CSS implementation note:
.landing-tech-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    600px circle at var(--mouse-x) var(--mouse-y),
    rgba(255,255,255,0.06),
    transparent 40%
  );
  opacity: 0;
  transition: opacity 0.3s;
}

.landing-tech-card:hover::before {
  opacity: 1;
}
```

---

### Card 2: Real-Time Integration

**Position:** Column 2
**Size:** 379×400px

#### Card Structure
```
Container: (same as Card 1)

Content:
├─ Icon: Zap (Lucide) - 48px, Ink/Secondary
├─ Badge: "Zero lag"
│   └─ Styling: Same as Card 1 badge
│   └─ Position: Top-right
├─ Title: "Live Erg Dashboard"
│   └─ Typography: Body/Large Bold
├─ Description: "Direct Concept2 and Strava sync with 5-second polling during practice"
│   └─ Typography: Body/Base
│   └─ Color: Ink/Secondary
```

**Exact Positioning:**
- **Icon:** x=32, y=32
- **Badge:** x=280, y=32
- **Title:** x=32, y=104
- **Description:** x=32, y=140

---

### Card 3: NCAA Compliance

**Position:** Column 3
**Size:** 379×400px

#### Card Structure
```
Container: (same as Card 1)

Content:
├─ Icon: ClipboardCheck (Lucide) - 48px, Ink/Secondary
├─ Badge: "Audit-ready"
│   └─ Styling: Same as Card 1 badge
├─ Title: "20-Hour Tracking"
│   └─ Typography: Body/Large Bold
└─ Description: "Automatic CARA hour calculations with audit-ready compliance reports"
    └─ Typography: Body/Base
    └─ Color: Ink/Secondary
```

---

### Mobile Layout (375×1200 frame)

**Frame:** `Technology-Cards-Mobile`
**Background:** Ink/Base (#121212)

#### Layout Changes
- **Single column:** Stack cards vertically
- **Container padding:** 16px left/right
- **Card width:** 343px (375 - 32px)
- **Card height:** Auto (content-based)
- **Gap:** 24px between cards (reduced from desktop 32px)
- **Card padding:** 24px (reduced from desktop 32px)

#### Mobile Card Structure
```
Same content as desktop, adjusted positioning:
├─ Icon: x=24, y=24 (reduced padding)
├─ Badge: Right-aligned with 24px margin
├─ Title: x=24, y=96
└─ Description: x=24, y=132, max-width: 295px
```

---

## Section 3: Integration Badges

### Desktop Layout (1920×400 frame)

**Frame:** `Integration-Badges`
**Background:** Ink/Deep (#0A0A0A)

#### Section Header
```
Position: Centered
├─ Eyebrow: "INTEGRATIONS"
│   └─ Typography: Label/Large (Inter Medium 14px, 500 weight)
│   └─ Color: Ink/Secondary (#A3A3A3)
│   └─ Transform: uppercase, letter-spacing: 0.15em
│   └─ Position: x=860 (centered), y=80
```

#### Badge Container
- **Layout:** Horizontal row with wrap
- **Justify:** Center
- **Gap:** 16px
- **Margin-top from header:** 40px
- **Container width:** Auto (badges size themselves)

#### Individual Badge Styling
```
Badge structure:
├─ Background: transparent
├─ Border: 1px solid Ink/Border (#262626)
├─ Border-radius: 8px
├─ Padding: 12px 16px
├─ Display: flex, align-items: center, gap: 12px
└─ Hover: border-color: Ink/Secondary (#A3A3A3)

Content:
├─ Icon placeholder: 24×24px square
│   └─ Background: Ink/Raised (#1A1A1A)
│   └─ Border: 1px solid Ink/Border
│   └─ Border-radius: 4px
│   └─ Note: "Replace with actual logo SVG when available"
└─ Text: Integration name
    └─ Typography: Label/Default (Inter Medium 13px, 500 weight)
    └─ Color: Ink/Primary (#E5E5E5)
```

#### Four Integration Badges

**Badge 1: Concept2**
- Text: "Concept2"
- Icon placeholder: 24×24px (note: "C2 logo - rowing machine icon")
- Position: x=660, y=140

**Badge 2: Strava**
- Text: "Strava"
- Icon placeholder: 24×24px (note: "Strava logo - orange/red athlete icon")
- Position: x=780, y=140

**Badge 3: RegattaCentral**
- Text: "RegattaCentral"
- Icon placeholder: 24×24px (note: "RegattaCentral logo")
- Position: x=880, y=140

**Badge 4: USRowing**
- Text: "USRowing"
- Icon placeholder: 24×24px (note: "USRowing logo - oar icon")
- Position: x=1040, y=140

#### Badge Width Auto-sizing
- Concept2: ~110px
- Strava: ~100px
- RegattaCentral: ~160px
- USRowing: ~120px

---

### Mobile Layout (375×600 frame)

**Frame:** `Integration-Badges-Mobile`
**Background:** Ink/Deep (#0A0A0A)

#### Layout Changes
- **2×2 grid** instead of horizontal row
- **Grid template:** repeat(2, 1fr)
- **Gap:** 16px
- **Container padding:** 16px
- **Badge width:** 167px each ((343 - 16) / 2)

#### Mobile Badge Positioning
```
Grid layout:
Row 1: Concept2 | Strava
Row 2: RegattaCentral | USRowing

Badge 1 (Concept2): x=16, y=140
Badge 2 (Strava): x=199, y=140
Badge 3 (RegattaCentral): x=16, y=190
Badge 4 (USRowing): x=199, y=190
```

---

## Color Reference (from Asset Library)

All colors use Phase 19-01 Asset Library:

**Inkwell Scale:**
- Ink/Deep: #0A0A0A (page backgrounds)
- Ink/Base: #121212 (section backgrounds)
- Ink/Raised: #1A1A1A (card backgrounds)
- Ink/Border: #262626 (borders, dividers)
- Ink/Secondary: #A3A3A3 (secondary text, icons)
- Ink/Primary: #E5E5E5 (primary text)
- Ink/Bright: #FAFAFA (headings, emphasis)

**Data Colors:**
- Data/Excellent: #22C55E (green, positive metrics)
- Data/Good: #3B82F6 (blue, standard metrics)
- Data/Warning: #F59E0B (amber, caution)
- Data/Poor: #EF4444 (red, negative)

**Rowing Semantic:**
- Rowing/Port: #DC2626 (red, port side)
- Rowing/Starboard: #16A34A (green, starboard side)

---

## Typography Reference (from Asset Library)

**Display (Fraunces, serif):**
- Display/H2: 36px, 600 weight, line-height 1.2
- Display/H3: 24px, 600 weight, line-height 1.3

**Body (Inter, sans-serif):**
- Body/Large: 18px, 400 weight, line-height 1.75
- Body/Large Bold: 18px, 600 weight, line-height 1.75
- Body/Base: 15px, 400 weight, line-height 1.5

**Metric (Geist Mono, monospace):**
- Mono/Metric: 48px, 600 weight, line-height 1.1, tabular-nums
- Mono/Data: 13px, 500 weight, line-height 1.25, tabular-nums

**Label (Inter Medium):**
- Label/Large: 14px, 500 weight, line-height 1.4, uppercase
- Label/Default: 13px, 500 weight, line-height 1.4
- Label/Small: 12px, 500 weight, line-height 1.3, uppercase

---

## Implementation Notes

### Glassmorphism Effect
```
CSS equivalent:
.glassmorphism {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
```

### Video Placeholder Best Practices
1. Create frame with dark background (#1A1A1A)
2. Add large "VIDEO" text in center (Mono/Metric 48px)
3. Add filename below: "video-3.mp4" (Mono/Data 13px)
4. Add usage note: "Autoplay, muted, loop" or "Click to play, modal playback"
5. For play button overlay: 64px circle with white triangle icon

### Spotlight Effect Implementation
- Use CSS custom properties: `--mouse-x` and `--mouse-y`
- JavaScript tracks mouse position, sets properties on cards
- Radial gradient creates subtle highlight at cursor position
- Opacity transition on hover (0 → 1 over 300ms)

### Image Background Overlay
All tiles with background images use gradient overlay for text contrast:
```
linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.7) 100%)
```
Darker at bottom ensures description text is readable.

---

## Verification Checklist

### Features Bento Grid
- [ ] Desktop frame created (1920×2400)
- [ ] 7 feature tiles created with correct grid positioning
- [ ] Athlete Management tile: 2x1 size, rowing-1.jpg background, avatar stack preview
- [ ] Seat Racing tile: 1x2 size, rowing-3.jpg background, rankings preview
- [ ] Lineup Builder tile: 2x2 size, VIDEO or rowing-5.jpg background, boat diagram
- [ ] Erg Performance tile: 1x1 size, rowing-2.jpg background, split time preview
- [ ] Training Calendar tile: 1x1 size, solid Ink/Raised background
- [ ] Race Day tile: 1x1 size, VIDEO or rowing-4.jpg background, play button
- [ ] Roster Management tile: 1x1 size, rowing-15.jpg background
- [ ] All tiles have glassmorphism overlay (bg-white/[0.03], backdrop-blur)
- [ ] All tiles have Ink/Border (#262626) 1px border, 12px border-radius
- [ ] All tile icons 24px (32px for hero), color Ink/Primary
- [ ] All titles use Body/Large Bold (or Display/H3 for hero)
- [ ] All descriptions use Body/Base, color Ink/Secondary
- [ ] VIDEO tiles have prominent "VIDEO" label with playback behavior notes
- [ ] Mobile frame created (375×2800)
- [ ] Mobile tiles stack vertically in single column
- [ ] Mobile tiles have darker overlay for text readability

### Technology Cards
- [ ] Desktop frame created (1920×800)
- [ ] Section header with eyebrow and title
- [ ] 3 cards created in horizontal layout
- [ ] Card 1: Brain icon, "PhD-level statistics" badge, Bradley-Terry description
- [ ] Card 2: Zap icon, "Zero lag" badge, Real-Time Integration description
- [ ] Card 3: ClipboardCheck icon, "Audit-ready" badge, NCAA Compliance description
- [ ] All cards: Ink/Raised background, Ink/Border 1px border, 12px radius
- [ ] All cards: 32px padding, 48px icons
- [ ] All badges: bg-white/[0.05], pill shape (16px radius), uppercase
- [ ] All titles: Body/Large Bold
- [ ] All descriptions: Body/Base, Ink/Secondary color
- [ ] Spotlight effect documented (--mouse-x, --mouse-y)
- [ ] Mobile frame created (375×1200)
- [ ] Mobile cards stack vertically with 24px padding

### Integration Badges
- [ ] Desktop frame created (1920×400)
- [ ] Section header: "INTEGRATIONS" eyebrow
- [ ] 4 badges in horizontal row with 16px gap
- [ ] Badge 1: Concept2 with logo placeholder
- [ ] Badge 2: Strava with logo placeholder
- [ ] Badge 3: RegattaCentral with logo placeholder
- [ ] Badge 4: USRowing with logo placeholder
- [ ] All badges: transparent background, Ink/Border 1px border, 8px radius
- [ ] All badges: 12px 16px padding, flex layout with 12px gap
- [ ] All badge text: Label/Default (Inter Medium 13px), Ink/Primary color
- [ ] All icon placeholders: 24×24px, Ink/Raised background
- [ ] Mobile frame created (375×600)
- [ ] Mobile badges in 2×2 grid layout

### Cross-Frame Consistency
- [ ] All colors match Asset Library (no custom colors)
- [ ] All typography styles match Asset Library (no custom sizes)
- [ ] All spacing uses 4px increments (8, 12, 16, 24, 32, etc.)
- [ ] All border-radius values consistent (8px, 12px, 16px)
- [ ] All frames use correct background colors (Deep, Base, Raised)
- [ ] All icons are Lucide icons at documented sizes
- [ ] All glassmorphism effects use bg-white/[0.03] + backdrop-blur
- [ ] All image overlays use documented gradient patterns

---

## Manual Implementation Estimate

**Time required:** 60-90 minutes

**Breakdown:**
- Features Bento Grid desktop: 30 minutes (7 tiles with previews)
- Features Bento Grid mobile: 15 minutes (simplified tiles)
- Technology Cards desktop: 15 minutes (3 cards)
- Technology Cards mobile: 10 minutes (stacked)
- Integration Badges desktop: 5 minutes (4 badges)
- Integration Badges mobile: 5 minutes (grid)
- Review and adjustments: 10 minutes

**Dependencies:**
- Plan 19-01: Asset Library with colors and typography
- Plan 19-02: Visual-Style frame with image placeholders

---

## Developer Handoff Notes

When implementing in React + Tailwind:

1. **Bento Grid:** Use CSS Grid with `grid-template-columns: repeat(3, 1fr)` and `grid-auto-rows: 300px`
2. **Tile sizing:** Use `grid-column: span 2` and `grid-row: span 2` for larger tiles
3. **Glassmorphism:** Class `bg-white/[0.03] backdrop-blur-sm`
4. **Spotlight effect:** JavaScript sets `--mouse-x` and `--mouse-y` CSS variables on mousemove
5. **Video tiles:** Use `<video autoPlay muted loop playsInline>` for inline videos
6. **Color references:** All colors exist in `tailwind.config.js` as custom theme colors
7. **Typography:** All styles exist in Tailwind config (font-display, font-sans, font-mono)
8. **Responsive:** Mobile breakpoint at 768px (Tailwind `md:`)
9. **Animation:** Framer Motion fade-in-up with stagger for tile reveals
10. **Icons:** Import from `lucide-react` package (already in dependencies)

**Reference implementation:** See `src/pages/LandingPage.tsx` for existing bento grid pattern and spotlight effect.

---

**End of Specification**

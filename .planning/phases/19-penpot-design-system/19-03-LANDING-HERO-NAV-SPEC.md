# Phase 19 Plan 03: Landing Page Hero & Navigation Specification

**Purpose:** Comprehensive design specification for landing page hero section and navigation bar with Dark Editorial aesthetic and 2026 SaaS best practices.

**Context:** Plans 19-01 (Design System Foundation) and 19-02 (Visual Assets) must be implemented in Penpot before creating these frames. Reference existing LandingPage.tsx for structure alignment.

**Deliverables:** 8 frames across 03-Landing-Page page in Penpot:
- Desktop Hero (image variant)
- Desktop Hero (video variant)
- Desktop Navigation (default)
- Desktop Navigation (scrolled)
- Mobile Navigation (collapsed)
- Mobile Navigation (expanded)
- Mobile Hero (image variant)
- Mobile Hero (video variant)

---

## Prerequisites

Before implementing this specification, verify:

1. **Asset Library populated** (from Plan 19-01):
   - 28 color assets (Ink, Data, Chart, Rowing)
   - 16 typography styles (Display, Body, Metric, Label)
2. **Visual-Style frame created** (from Plan 19-02):
   - 24 image/video placeholders available for reference
3. **Rowing imagery imported** (optional for high-fidelity):
   - crew-on-water.jpg, boathouse-sunset.jpg, rowing-3.jpg available
   - hero-video.mp4 video file available

---

## Page Structure

Create page: **03-Landing-Page** (if doesn't exist)

Page organization:
```
03-Landing-Page/
├── Desktop-Hero-Image (1920×1080)
├── Desktop-Hero-Video (1920×1080)
├── Desktop-Nav-Default (1920×80)
├── Desktop-Nav-Scrolled (1920×80)
├── Mobile-Nav-Collapsed (375×80)
├── Mobile-Nav-Expanded (375×812)
├── Mobile-Hero-Image (375×812)
└── Mobile-Hero-Video (375×812)
```

---

## 1. Desktop Hero Section (Image Variant)

**Frame name:** `Desktop-Hero-Image`
**Dimensions:** 1920×1080 (Full HD viewport, full-height hero)
**Background:** Ink/Deep (#0A0A0A)

### Background Layer

**Rectangle:** 1920×1080, position (0, 0)
- Fill: Import rowing-3.jpg (or crew-on-water.jpg) from Visual-Style placeholders
- Overlay gradient: Linear gradient 180deg
  - Stop 1 (0%): rgba(10, 10, 10, 0.7) — Ink/Deep at 70% opacity
  - Stop 2 (100%): rgba(10, 10, 10, 0.4) — Ink/Deep at 40% opacity
- Note: Gradient creates dark overlay for text legibility

**Alternative:** If actual image not imported, use placeholder:
- Rectangle with fill: Ink/Base (#141414)
- Text label: "crew-on-water.jpg" (Body/Base, Ink/Secondary)

### Content Container

**Frame:** Centered content area
- Width: 1200px
- Height: Auto (flex vertical)
- Position: Centered horizontally, centered vertically (slight bias toward top 40% of viewport)
- Padding: 80px vertical, 0 horizontal
- Align: Center (all content centered)

### Status Badge

**Frame:** Inline flex horizontal
- Width: Auto (fit content)
- Height: 40px
- Position: Above headline, margin-bottom 32px
- Background: Ink/Deep (#0A0A0A) at 3% opacity
- Border: 1px solid Ink/Border (#262626) at 6% opacity
- Border-radius: 20px (fully rounded pill)
- Padding: 12px 16px
- Backdrop-blur: 8px (glassmorphism — note: may require effects panel)

**Pulse indicator:**
- Circle: 8×8px, fill Data/Good (#0070F3)
- Animation: Ping effect (scale 1→2, opacity 0.6→0, duration 1.5s, infinite)
- Inner circle: 8×8px, fill Data/Good (#0070F3), no animation

**Status text:**
- Text: "THE COACHING PLATFORM FOR ROWING"
- Typography: Label/Small from Asset Library (Inter 11px, medium, tracking 0.15em)
- Color: Ink/Secondary (#737373)
- Transform: Uppercase

### Headline

**Text element:**
- Content: "Your team's data,\nprinted on obsidian."
- Typography: Display/Hero from Asset Library (Fraunces 72px, 700 weight)
- Color: Ink/Bright (#FAFAFA)
- Line-height: 1.1 (tight for editorial impact)
- Max-width: 900px
- Align: Center
- Text-shadow: 0 2px 40px rgba(0, 0, 0, 0.4) (subtle depth)
- Margin-bottom: 24px

**Alternative headline (per LandingPage.tsx):**
- Content: "Stop Guessing.\nStart Winning."
- Same styling as above
- "Start Winning." in chromatic color Data/Good (#0070F3)

### Subheadline

**Text element:**
- Content: "The rowing analytics platform designed for coaches who demand precision."
- Typography: Body/Large from Asset Library (Inter 18px, 400 weight)
- Color: Ink/Body (#A3A3A3)
- Line-height: 1.6
- Max-width: 600px
- Align: Center
- Margin-bottom: 40px

**Alternative subheadline (per LandingPage.tsx):**
- Content: "RowLab combines erg data, seat racing analytics, and visual lineup building into one precision instrument—so you can make selection decisions backed by data, not hunches."

### Dual CTAs

**Frame:** Horizontal flex container
- Width: Auto (fit content)
- Gap: 16px
- Margin-bottom: 24px

**Primary CTA Button:**
- Text: "Start Free Trial"
- Typography: Body/Base from Asset Library (Inter 15px, 500 weight)
- Padding: 16px 32px
- Background: Ink/Bright (#FAFAFA) — solid
- Text color: Ink/Deep (#0A0A0A)
- Border-radius: 8px
- Shadow: 0 4px 24px rgba(250, 250, 250, 0.12) (chromatic glow)
- Hover state: Background Ink/Primary (#D4D4D4), shadow intensity increase

**Arrow icon:** Right arrow (lucide ArrowRight), 20×20px, same text color

**Secondary CTA Button:**
- Text: "Watch Demo"
- Typography: Body/Base from Asset Library (Inter 15px, 500 weight)
- Padding: 16px 32px
- Background: Transparent
- Text color: Ink/Primary (#D4D4D4)
- Border: 1px solid Ink/Border (#262626)
- Border-radius: 8px
- Hover state: Border color Ink/Primary (#D4D4D4), text color Ink/Bright (#FAFAFA)

### Social Proof Strip

**Frame:** Horizontal layout
- Width: Auto (fit content)
- Gap: 24px
- Margin-bottom: 64px

**University logos (placeholder):**
- 4 rectangles: 80×40px each
- Fill: Ink/Raised (#1C1C1C)
- Border: 1px solid Ink/Border (#262626)
- Border-radius: 6px
- Opacity: 0.6
- Note: Replace with actual university logo SVGs when available

**Text below logos:**
- Content: "Trusted by 50+ collegiate programs"
- Typography: Label/Base from Asset Library (Inter 12px, medium)
- Color: Ink/Secondary (#737373)
- Transform: Uppercase
- Tracking: 0.1em

### Live Metrics Preview

**Frame:** Hero visual card (inspired by LandingPage.tsx)
- Width: 800px
- Height: Auto (flex vertical)
- Background: Ink/Deep (#0A0A0A) at 3% opacity
- Border: 1px solid Ink/Border (#262626)
- Border-radius: 16px
- Padding: 32px
- Backdrop-blur: 16px (glassmorphism)
- Shadow: 0 8px 64px rgba(0, 0, 0, 0.6)
- Position: Below social proof, still within content container

**Card header:**
- Frame: Flex horizontal, justify space-between
- Left side:
  - Eyebrow: "VARSITY 8+" (Label/Small, Data/Good #0070F3, uppercase, tracking 0.15em)
  - Title: "Spring Lineup" (Display/H3, Ink/Bright #FAFAFA)
- Right side:
  - Eyebrow: "PREDICTED SPEED" (Label/Small, Ink/Secondary #737373, uppercase)
  - Metric: "1:42.5" (Metric/XL, Data/Good #0070F3, tabular-nums)

**Divider:** 1px height, Ink/Border (#262626) at 10% opacity

**Metrics row:**
- Frame: Flex horizontal, 4 columns, gap 32px
- Each metric:
  - Value: Metric/Large from Asset Library (Geist Mono 28px, tabular-nums)
  - Label: Label/XS (Inter 10px, uppercase, tracking 0.1em, Ink/Subtle #525252)
  - Colors: Mix of Ink/Bright, Data/Good, Data/Excellent, Rowing/Port
  - Text-shadow on value: 0 0 40px [color]40 (chromatic glow)

**Example metrics:**
1. "8" (Ink/Bright) — "ROWERS"
2. "97%" (Data/Excellent #10B981) — "CONFIDENCE"
3. "6:04" (Data/Good #0070F3) — "AVG 2K"
4. "12" (Rowing/Port #7C3AED) — "RACES"

---

## 2. Desktop Hero Section (Video Variant)

**Frame name:** `Desktop-Hero-Video`
**Dimensions:** 1920×1080 (Full HD viewport, full-height hero)

**Everything identical to Desktop-Hero-Image EXCEPT background:**

### Background Layer (Video Placeholder)

**Rectangle:** 1920×1080, position (0, 0)
- Fill: Ink/Base (#141414) — dark placeholder background
- Overlay gradient: Same as image variant (linear 180deg, Ink/Deep 70%→40%)

**VIDEO label:**
- Text: "VIDEO"
- Typography: Display/H1 from Asset Library (Fraunces 64px, 700 weight)
- Color: Ink/Border (#262626) — very subtle
- Position: Centered on background rectangle
- Opacity: 0.3

**Filename label:**
- Text: "hero-video.mp4"
- Typography: Label/Base (Inter 12px, medium)
- Color: Ink/Secondary (#737373)
- Position: Below "VIDEO" label, 16px gap

**Usage note:**
- Text: "Autoplay, muted, loop"
- Typography: Label/Small (Inter 11px, medium)
- Color: Ink/Subtle (#525252)
- Position: Below filename, 8px gap

**Developer note (in frame comments):**
Add note to frame: "Video will play automatically in background with dark overlay applied in CSS. See LandingPage.tsx line 349 for implementation reference."

---

## 3. Desktop Navigation (Default State)

**Frame name:** `Desktop-Nav-Default`
**Dimensions:** 1920×80
**Background:** Transparent (no fill)

**Note:** This nav is designed to overlay the hero section with transparency. When used outside hero context, apply Ink/Deep background.

### Nav Container

**Frame:** Full width
- Width: 1920px
- Height: 80px
- Background: Transparent (or Ink/Deep #0A0A0A at 0% opacity for clarity)
- Padding: 0 64px

### Content Layout

**Frame:** Horizontal flex, justify space-between, align center
- Width: 1792px (1920 - 128px padding)
- Height: 80px

### Logo (Left)

**Text element:**
- Content: "RowLab"
- Typography: Display/H3 from Asset Library (Fraunces 24px, 700 weight)
- Color: Ink/Bright (#FAFAFA)
- Hover state: Opacity 0.8

**Alternative:** If logo SVG available, use that instead (height 32px)

### Nav Links (Center)

**Frame:** Horizontal flex, gap 40px

**Link style (4 links):**
- Text: "Features", "Pricing", "About", "Blog"
- Typography: Body/Base from Asset Library (Inter 14px, 500 weight)
- Color: Ink/Primary (#D4D4D4)
- Hover state:
  - Color: Ink/Bright (#FAFAFA)
  - Underline indicator: 2px height, Ink/Bright, 24px width, centered below text

### CTA Buttons (Right)

**Frame:** Horizontal flex, gap 16px

**Sign In Button (Ghost):**
- Text: "Sign In"
- Typography: Body/Base (Inter 14px, 500 weight)
- Padding: 10px 20px
- Background: Transparent
- Text color: Ink/Primary (#D4D4D4)
- Border: 1px solid Ink/Border (#262626)
- Border-radius: 6px
- Hover state: Border color Ink/Primary, text color Ink/Bright

**Start Free Button (Solid):**
- Text: "Start Free"
- Typography: Body/Base (Inter 14px, 500 weight)
- Padding: 10px 24px
- Background: Ink/Bright (#FAFAFA)
- Text color: Ink/Deep (#0A0A0A)
- Border-radius: 6px
- Shadow: 0 2px 16px rgba(250, 250, 250, 0.08)
- Hover state: Background Ink/Primary, shadow intensity increase

---

## 4. Desktop Navigation (Scrolled State)

**Frame name:** `Desktop-Nav-Scrolled`
**Dimensions:** 1920×80

**Everything identical to Desktop-Nav-Default EXCEPT background:**

### Background Treatment

**Rectangle:** 1920×80, position (0, 0)
- Fill: Ink/Deep (#0A0A0A) at 80% opacity
- Border-bottom: 1px solid Ink/Border (#262626)
- Backdrop-blur: 16px (glassmorphism — requires effects panel)
- Shadow: 0 2px 24px rgba(0, 0, 0, 0.5) (floating effect)

**Note in frame comments:**
"This state activates when user scrolls past hero section. CSS applies background and blur dynamically. See LandingPage.tsx navigation for scroll detection logic."

---

## 5. Mobile Navigation (Collapsed State)

**Frame name:** `Mobile-Nav-Collapsed`
**Dimensions:** 375×80
**Background:** Transparent (will overlay hero on mobile)

### Nav Container

**Frame:** Full width
- Width: 375px
- Height: 80px
- Background: Transparent (or Ink/Deep at 0% opacity)
- Padding: 0 20px

### Content Layout

**Frame:** Horizontal flex, justify space-between, align center
- Width: 335px (375 - 40px padding)
- Height: 80px

### Logo (Left)

**Text element:**
- Content: "RowLab"
- Typography: Display/H3 (Fraunces 20px, 700 weight) — slightly smaller for mobile
- Color: Ink/Bright (#FAFAFA)

### Hamburger Menu (Right)

**Frame:** Hamburger icon (3 horizontal lines)
- Width: 24px
- Height: 24px
- Tap target: 44×44px (invisible rectangle for touch area)

**3 rectangles (lines):**
- Width: 24px
- Height: 2px
- Fill: Ink/Bright (#FAFAFA)
- Spacing: 6px vertical gap
- Border-radius: 1px (slightly rounded ends)

**Touch target (invisible):**
- Rectangle: 44×44px, no fill, no stroke
- Centered on hamburger icon
- Note: 44px minimum for iOS/Android touch guidelines

---

## 6. Mobile Navigation (Expanded State)

**Frame name:** `Mobile-Nav-Expanded`
**Dimensions:** 375×812 (iPhone viewport)
**Background:** Ink/Deep (#0A0A0A)

### Nav Header (Same as collapsed)

**Frame:** 375×80, positioned at top
- Same logo and hamburger (now "X" icon) as collapsed state

**Close icon (X):**
- Width: 24px
- Height: 24px
- Two diagonal lines crossing (2px thick, Ink/Bright)
- Tap target: 44×44px

### Menu Content

**Frame:** Full-screen overlay
- Width: 375px
- Height: 732px (812 - 80px header)
- Background: Ink/Deep (#0A0A0A)
- Padding: 32px 20px

### Nav Links (Vertical stack)

**Frame:** Vertical flex, gap 24px

**Link style (4 links):**
- Text: "Features", "Pricing", "About", "Blog"
- Typography: Display/H2 from Asset Library (Fraunces 32px, 700 weight) — large for mobile
- Color: Ink/Bright (#FAFAFA)
- Align: Left
- Tap target: Full width, 60px height (generous touch area)

**Divider between links:**
- 1px height, Ink/Border (#262626), margin 0 (links have built-in gap)

### CTA Buttons (Bottom)

**Frame:** Vertical stack, gap 16px, margin-top 48px

**Start Free Button (Primary):**
- Text: "Start Free Trial"
- Typography: Body/Base (Inter 16px, 500 weight) — larger for mobile
- Padding: 16px 0 (full-width button)
- Width: 335px (full width minus padding)
- Height: 56px (generous touch target)
- Background: Ink/Bright (#FAFAFA)
- Text color: Ink/Deep (#0A0A0A)
- Border-radius: 8px
- Align: Center

**Sign In Button (Secondary):**
- Text: "Sign In"
- Typography: Body/Base (Inter 16px, 500 weight)
- Padding: 16px 0
- Width: 335px
- Height: 56px
- Background: Transparent
- Text color: Ink/Primary (#D4D4D4)
- Border: 1px solid Ink/Border (#262626)
- Border-radius: 8px
- Align: Center

---

## 7. Mobile Hero Section (Image Variant)

**Frame name:** `Mobile-Hero-Image`
**Dimensions:** 375×812 (iPhone viewport, full-height hero)
**Background:** Ink/Deep (#0A0A0A)

### Background Layer

**Rectangle:** 375×812, position (0, 0)
- Fill: Import rowing-3.jpg (cropped for portrait, focal point on rowers)
- Overlay gradient: Linear gradient 180deg
  - Stop 1 (0%): rgba(10, 10, 10, 0.75) — darker overlay for mobile
  - Stop 2 (100%): rgba(10, 10, 10, 0.5)
- Note: Darker overlay ensures text legibility on small screen

### Content Container

**Frame:** Centered content area
- Width: 335px (375 - 40px horizontal padding)
- Height: Auto (flex vertical)
- Position: Centered horizontally, top ~200px (below nav, leaving room for status badge)
- Padding: 20px
- Align: Center

### Status Badge

**Frame:** Inline flex horizontal (same as desktop but smaller)
- Width: Auto (fit content)
- Height: 36px
- Padding: 10px 14px
- Border-radius: 18px
- Background: Ink/Deep at 3% opacity
- Border: 1px solid Ink/Border at 6% opacity
- Backdrop-blur: 8px
- Margin-bottom: 24px

**Pulse indicator:** Same as desktop (8×8px circle, Data/Good)

**Status text:**
- Text: "THE COACHING PLATFORM" (shorter for mobile)
- Typography: Label/XS (Inter 10px, medium, tracking 0.15em)
- Color: Ink/Secondary (#737373)
- Transform: Uppercase

### Headline

**Text element:**
- Content: "Stop Guessing.\nStart Winning."
- Typography: Display/H1 from Asset Library (Fraunces 48px, 700 weight) — reduced from 72px desktop
- Color: Ink/Bright (#FAFAFA)
- Line-height: 1.1
- Max-width: 335px (full width)
- Align: Center
- Text-shadow: 0 2px 40px rgba(0, 0, 0, 0.5)
- Margin-bottom: 20px

**"Start Winning." line:**
- Color: Data/Good (#0070F3) — chromatic accent

**Alternative headline for mobile:**
- Content: "Data-Driven\nLineup Decisions"
- Same styling

### Subheadline

**Text element:**
- Content: "The rowing analytics platform for coaches who demand precision."
- Typography: Body/Base from Asset Library (Inter 15px, 400 weight) — reduced from 18px desktop
- Color: Ink/Body (#A3A3A3)
- Line-height: 1.6
- Max-width: 335px (full width)
- Align: Center
- Margin-bottom: 32px

### Dual CTAs (Stacked)

**Frame:** Vertical flex container
- Width: 335px (full width)
- Gap: 12px
- Margin-bottom: 32px

**Primary CTA Button:**
- Text: "Start Free Trial"
- Typography: Body/Base (Inter 16px, 500 weight)
- Padding: 16px 0 (full-width)
- Width: 335px
- Height: 56px (minimum 44px touch target, extra for comfort)
- Background: Ink/Bright (#FAFAFA)
- Text color: Ink/Deep (#0A0A0A)
- Border-radius: 8px
- Shadow: 0 4px 24px rgba(250, 250, 250, 0.12)
- Align: Center

**Arrow icon:** Right arrow, 20×20px, same text color

**Secondary CTA Button:**
- Text: "Watch Demo"
- Typography: Body/Base (Inter 16px, 500 weight)
- Padding: 16px 0
- Width: 335px
- Height: 56px
- Background: Transparent
- Text color: Ink/Primary (#D4D4D4)
- Border: 1px solid Ink/Border (#262626)
- Border-radius: 8px
- Align: Center

### Social Proof Strip (Simplified)

**Frame:** Vertical layout (text only, no logos for space)
- Width: 335px
- Align: Center
- Margin-bottom: 32px (reduced)

**Text:**
- Content: "Trusted by 50+ collegiate programs"
- Typography: Label/Small (Inter 11px, medium)
- Color: Ink/Secondary (#737373)
- Transform: Uppercase
- Tracking: 0.1em
- Align: Center

**Alternative:** 3 small logo rectangles (60×30px each, horizontal, 16px gap)

### Live Metrics Preview (Simplified)

**Frame:** Compact card (optional, can omit for space)
- Width: 335px
- Height: Auto
- Background: Ink/Deep at 3% opacity
- Border: 1px solid Ink/Border
- Border-radius: 12px
- Padding: 20px
- Backdrop-blur: 12px

**Metrics row (2-up instead of 4):**
- Frame: Flex horizontal, 2 columns, gap 16px
- Each metric:
  - Value: Metric/Base (Geist Mono 20px, tabular-nums)
  - Label: Label/XS (Inter 10px, uppercase)
  - Colors: Data/Good (#0070F3), Data/Excellent (#10B981)

**Example metrics:**
1. "1:42.3" (Data/Good) — "SPLIT"
2. "2,847" (Data/Excellent) — "METERS"

**Alternative:** Omit metrics card entirely for cleaner mobile hero

---

## 8. Mobile Hero Section (Video Variant)

**Frame name:** `Mobile-Hero-Video`
**Dimensions:** 375×812 (iPhone viewport)

**Everything identical to Mobile-Hero-Image EXCEPT background:**

### Background Layer (Video Placeholder)

**Rectangle:** 375×812, position (0, 0)
- Fill: Ink/Base (#141414)
- Overlay gradient: Same as mobile image variant (Ink/Deep 75%→50%)

**VIDEO label:**
- Text: "VIDEO"
- Typography: Display/H1 (Fraunces 48px, 700 weight) — scaled for mobile
- Color: Ink/Border (#262626)
- Position: Centered on background
- Opacity: 0.3

**Filename label:**
- Text: "hero-video.mp4"
- Typography: Label/Small (Inter 11px, medium)
- Color: Ink/Secondary (#737373)
- Position: Below "VIDEO", 12px gap

**Usage note:**
- Text: "Autoplay, muted, loop"
- Typography: Label/XS (Inter 10px, medium)
- Color: Ink/Subtle (#525252)
- Position: Below filename, 6px gap

---

## Design Principles Applied

### Dark Editorial Aesthetic
- Monochrome UI (Inkwell palette) with chromatic data only
- Deep blacks (#0A0A0A) with subtle layering (3% white overlays)
- Glassmorphism: backdrop-blur + semi-transparent backgrounds
- Sparse, intentional use of color (Data/Good blue, Data/Excellent green)

### 2026 SaaS Best Practices
- **Product-led storytelling:** Hero shows actual app interface (metrics card)
- **Outcome-focused headline:** "Stop Guessing. Start Winning." (not feature-focused)
- **Dual CTAs:** Primary action (Start Free Trial) + Secondary (Watch Demo)
- **Social proof:** University logos + "Trusted by 50+ programs"
- **Live metrics:** Real-time data preview (1:42.3 split) creates urgency
- **Status badge:** Animated pulse + "THE COACHING PLATFORM" establishes category

### Mobile-First Considerations
- **Touch targets:** All buttons ≥44px (iOS guideline), mobile uses 56px for comfort
- **Stacked CTAs:** Full-width buttons easier to tap than narrow horizontal layout
- **Larger mobile typography:** Headlines 48px vs 72px desktop (still impactful)
- **Simplified layouts:** Fewer elements, reduced metrics card complexity
- **Thumb-friendly placement:** CTAs in middle-lower screen (easy thumb reach)

### Typography Hierarchy
- **Display/Hero (72px):** Primary headline — maximum impact
- **Display/H1 (48px):** Mobile headline — scaled appropriately
- **Body/Large (18px):** Subheadline — readable at distance
- **Body/Base (15-16px):** CTAs and body text — comfortable reading size
- **Label/Small (11px):** Eyebrows and captions — subtle hierarchy
- **Metric/Large (28px):** Data displays — tabular numbers with chromatic glow

### Color Application
- **Ink/Bright (#FAFAFA):** Headlines, primary text
- **Ink/Primary (#D4D4D4):** Secondary text, nav links
- **Ink/Body (#A3A3A3):** Subheadlines, longer text
- **Ink/Secondary (#737373):** Labels, captions
- **Data/Good (#0070F3):** Primary chromatic accent (CTAs, metrics)
- **Data/Excellent (#10B981):** Secondary chromatic accent (success metrics)

### Glassmorphism Effects
- **Background:** Semi-transparent white/black (3-5% opacity)
- **Backdrop-blur:** 8-16px (adjust for performance)
- **Border:** Subtle Ink/Border at 6-10% opacity
- **Shadow:** Soft, large radius for depth

---

## Implementation Checklist

Use this checklist when manually creating frames in Penpot:

### Asset Library Verification
- [ ] All 28 color assets available in Asset Library
- [ ] All 16 typography styles available in Asset Library
- [ ] Visual-Style placeholders available for image reference

### Frame Creation
- [ ] 03-Landing-Page page created in Penpot project
- [ ] Desktop-Hero-Image frame created (1920×1080)
- [ ] Desktop-Hero-Video frame created (1920×1080)
- [ ] Desktop-Nav-Default frame created (1920×80)
- [ ] Desktop-Nav-Scrolled frame created (1920×80)
- [ ] Mobile-Nav-Collapsed frame created (375×80)
- [ ] Mobile-Nav-Expanded frame created (375×812)
- [ ] Mobile-Hero-Image frame created (375×812)
- [ ] Mobile-Hero-Video frame created (375×812)

### Desktop Hero (Image)
- [ ] Background image imported with dark overlay gradient
- [ ] Status badge with pulse animation indicator
- [ ] Headline using Display/Hero (Fraunces 72px)
- [ ] Subheadline using Body/Large (Inter 18px)
- [ ] Dual CTAs with proper styling (solid + ghost)
- [ ] Social proof strip with placeholder logos
- [ ] Live metrics card with glassmorphism effects
- [ ] All colors referenced from Asset Library

### Desktop Hero (Video)
- [ ] VIDEO placeholder with prominent label
- [ ] Filename and usage notes included
- [ ] Same content overlay as image variant
- [ ] Frame comment with developer implementation note

### Desktop Navigation (Default)
- [ ] Transparent background (overlays hero)
- [ ] Logo (RowLab) using Display/H3
- [ ] 4 nav links with hover underline spec
- [ ] Sign In button (ghost style)
- [ ] Start Free button (solid style)
- [ ] All colors from Asset Library

### Desktop Navigation (Scrolled)
- [ ] Ink/Deep background at 80% opacity
- [ ] Border-bottom using Ink/Border
- [ ] Backdrop-blur 16px effect applied
- [ ] Box-shadow for floating effect
- [ ] Frame comment with scroll activation note

### Mobile Navigation (Collapsed)
- [ ] Logo sized appropriately (20px)
- [ ] Hamburger icon (3 lines, 24px wide)
- [ ] Invisible tap target (44×44px) on hamburger

### Mobile Navigation (Expanded)
- [ ] Full-screen overlay (Ink/Deep background)
- [ ] Close icon (X) with 44px tap target
- [ ] 4 nav links using Display/H2 (32px, large for mobile)
- [ ] Stacked CTAs at bottom (56px height each)
- [ ] All touch targets ≥44px

### Mobile Hero (Image)
- [ ] Portrait-cropped background image with darker overlay
- [ ] Smaller status badge (36px height)
- [ ] Headline using Display/H1 (48px)
- [ ] Chromatic accent on "Start Winning."
- [ ] Subheadline using Body/Base (15px)
- [ ] Stacked full-width CTAs (56px height)
- [ ] Simplified social proof (text only or small logos)
- [ ] Optional: 2-up metrics card OR omit for space

### Mobile Hero (Video)
- [ ] VIDEO placeholder with scaled label (48px)
- [ ] Filename and usage notes
- [ ] Same content overlay as mobile image variant

### Quality Checks
- [ ] All typography styles pulled from Asset Library (not local)
- [ ] All colors pulled from Asset Library (not local)
- [ ] No hardcoded hex values (all referenced from assets)
- [ ] Glassmorphism effects applied where specified (backdrop-blur)
- [ ] Touch targets on mobile ≥44px
- [ ] Text-shadow applied to headlines for depth
- [ ] Chromatic glows applied to metric values (text-shadow)
- [ ] Border-radius consistent (6-8px buttons, 12-20px cards)

### Alignment Verification
- [ ] Desktop hero content centered (1200px max-width)
- [ ] Desktop nav content centered with 64px padding
- [ ] Mobile hero content centered with 20px padding
- [ ] All buttons aligned properly (flex center)
- [ ] Metrics cards aligned with proper gaps

### Variant Completeness
- [ ] Both image AND video hero variants exist for desktop
- [ ] Both image AND video hero variants exist for mobile
- [ ] Both default AND scrolled nav states exist for desktop
- [ ] Both collapsed AND expanded nav states exist for mobile

### Documentation
- [ ] Frame comments added to video variants (implementation notes)
- [ ] Frame comments added to scrolled nav (scroll activation note)
- [ ] Frame names match specification exactly
- [ ] Frames organized in logical order on 03-Landing-Page

---

## Developer Handoff Notes

When implementing these designs in code:

### Desktop Hero
- Background: Use actual rowing-3.jpg or hero-video.mp4 with CSS overlay gradient
- Video: Autoplay, muted, loop attributes required
- Animations: Framer Motion stagger on hero items (see LandingPage.tsx line 34-51)
- Metrics card: Glassmorphism requires `backdrop-filter: blur(16px)` CSS

### Desktop Navigation
- Scrolled state: Activate via scroll listener (threshold ~100px)
- Glassmorphism: `backdrop-filter: blur(16px)` + `background: rgba(10,10,10,0.8)`
- Hover effects: Smooth transitions (0.2s ease) on all interactive elements

### Mobile Navigation
- Expanded state: Slide-in animation from right (or fade in full-screen overlay)
- Close mechanism: X icon click + outside click + ESC key
- Touch targets: CSS `min-height: 44px` on all buttons/links
- Prevent scroll: Disable body scroll when menu expanded

### Mobile Hero
- Video: Same video as desktop, CSS ensures focal point stays centered
- Touch optimization: `touch-action: manipulation` to prevent double-tap zoom
- Performance: Consider lazy-loading video on mobile (data savings)

### Glassmorphism Fallback
- Older browsers: Check `@supports (backdrop-filter: blur())` in CSS
- Fallback: Solid Ink/Deep background at higher opacity (no blur)

### Accessibility
- Nav links: ARIA labels, keyboard navigation support
- Hamburger menu: `aria-expanded` state, focus trap when open
- Touch targets: Minimum 44×44px (WCAG 2.1 Level AAA)
- Color contrast: All text meets WCAG AA (3:1 for large text, 4.5:1 for body)

---

## Related Files

### Phase 19 Dependencies
- **19-01-PENPOT-SPEC.md**: Color palette and typography Asset Library
- **19-02-VISUAL-ASSETS-SPEC.md**: Rowing imagery and video placeholders

### Codebase References
- **src/pages/LandingPage.tsx**: Current implementation (lines 218-324 hero, lines 224-237 nav)
- **src/v2/styles/landing.css**: CSS classes referenced in specification
- **tailwind.config.js**: Color and typography tokens (source of truth)

### Visual Assets
- **public/images/rowing/rowing-3.jpg**: Current hero background (sunset skyline)
- **public/images/rowing/hero-video.mp4**: Hero video background option
- **public/images/rowing/crew-on-water.jpg**: Alternative hero image

---

## Estimated Manual Implementation Time

- **Asset Library setup** (if not done): 30-45 minutes (Plan 19-01)
- **Visual-Style placeholders** (if not done): 30-45 minutes (Plan 19-02)
- **Desktop Hero frames** (both variants): 45-60 minutes
- **Desktop Nav frames** (both states): 20-30 minutes
- **Mobile Nav frames** (both states): 30-40 minutes
- **Mobile Hero frames** (both variants): 40-50 minutes

**Total implementation time:** ~2.5-3.5 hours for all 8 frames

**Recommendation:** Implement in order:
1. Desktop Hero (image) — most complex, establishes patterns
2. Desktop Hero (video) — quick variant
3. Desktop Nav (default) — simpler layout
4. Desktop Nav (scrolled) — quick variant
5. Mobile Hero (image) — adapt desktop patterns
6. Mobile Hero (video) — quick variant
7. Mobile Nav (collapsed) — simple
8. Mobile Nav (expanded) — moderate complexity

---

## Success Criteria

### Visual Quality
- [ ] Dark Editorial aesthetic maintained (monochrome UI, chromatic data only)
- [ ] Glassmorphism effects properly applied (blur + transparency)
- [ ] Typography hierarchy clear (Display 72px → Label 10px scale)
- [ ] Color application intentional (Ink for UI, Data for metrics)

### Layout Precision
- [ ] Desktop hero centered (1200px max-width)
- [ ] Mobile hero full-width (335px content + 20px padding)
- [ ] Navigation aligned properly (64px desktop, 20px mobile padding)
- [ ] Consistent spacing (16-24px gaps, 32-48px margins)

### Responsive Design
- [ ] Mobile headlines scaled appropriately (48px vs 72px)
- [ ] Mobile CTAs stacked (full-width, 56px height)
- [ ] Touch targets ≥44px on all mobile interactive elements
- [ ] Simplified mobile layouts (fewer elements, readable text)

### Design-Code Alignment
- [ ] Matches LandingPage.tsx structure (hero, nav, CTAs)
- [ ] Uses same copy (headlines, subheadlines, button text)
- [ ] References actual rowing imagery (rowing-3.jpg, hero-video.mp4)
- [ ] Reflects 2026 SaaS best practices (product-led, outcome-focused)

### Specification Completeness
- [ ] 8 frames specified (4 desktop, 4 mobile)
- [ ] Both image AND video variants for hero sections
- [ ] Both default AND scrolled states for desktop nav
- [ ] Both collapsed AND expanded states for mobile nav
- [ ] Developer handoff notes included
- [ ] Implementation checklist provided

---

**End of Specification**

**Next Steps:**
1. Verify Plans 19-01 and 19-02 implemented in Penpot
2. Import rowing imagery and videos (optional for high-fidelity)
3. Create 8 frames following this specification
4. Use verification checklist to ensure quality
5. Export PNG previews for developer handoff
6. Proceed to Plan 19-04 (Feature Components)

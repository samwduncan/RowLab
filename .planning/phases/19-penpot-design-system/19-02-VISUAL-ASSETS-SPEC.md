# Phase 19-02: Visual Style Assets - Placeholder Specification

**Created:** 2026-01-28
**Status:** Ready for Manual Implementation
**Reason:** Placeholder frames to be created in Penpot (images will be uploaded manually later)

## Overview

This document specifies placeholder frames for all visual assets (rowing images and videos) to be created in the **Visual-Style** frame on the **01-Brand-Identity** page. These placeholders will serve as references for later manual image upload and provide layout guidance for future design work.

## Location

**Penpot Project:** RowLab Design System
**Page:** 01-Brand-Identity
**Frame:** Visual-Style (position: x=4000, y=0, size: 1920x1080)

## Asset Reference

All assets are located in the RowLab repository at:
`/home/swd/RowLab/public/images/rowing/`

### Available Images
- **Action Images:** rowing-1.jpg through rowing-16.jpg (16 images)
- **Hero Candidates:** boathouse-sunset.jpg, crew-on-water.jpg, eight-skyline.jpg (3 images)

### Available Videos
- hero-video.mp4 (primary hero background candidate)
- video-2.mp4, video-3.mp4, video-5.mp4, video-6.mp4 (feature/gallery videos)

## Section 1: Action Images Placeholders

### Header
Create text element:
- **Content:** "Action Images"
- **Position:** x=0, y=-80 (relative to Visual-Style frame)
- **Font:** Display/H1 (Fraunces 48px, weight 600)
- **Color:** Ink/Primary (#E5E5E5)

### Note
Create text element:
- **Content:** "Images to be uploaded from public/images/rowing/"
- **Position:** x=0, y=-40
- **Font:** Body/Small (Inter 13px, weight 400)
- **Color:** Ink/Body (#A3A3A3)

### Grid Configuration
- **Layout:** 4 columns × 4 rows = 16 frames
- **Frame size:** 300×200px each
- **Gap:** 24px between frames
- **Start position:** x=0, y=0

### Frame Specifications (16 frames)

For each of the 16 action images, create a frame with:

| Frame Name | Position | Size | Background | Border | Label |
|------------|----------|------|------------|--------|-------|
| rowing-1.jpg | (0, 0) | 300×200 | #2A2A2A | 2px #404040 | "rowing-1.jpg" |
| rowing-2.jpg | (324, 0) | 300×200 | #2A2A2A | 2px #404040 | "rowing-2.jpg" |
| rowing-3.jpg | (648, 0) | 300×200 | #2A2A2A | 2px #404040 | "rowing-3.jpg" |
| rowing-4.jpg | (972, 0) | 300×200 | #2A2A2A | 2px #404040 | "rowing-4.jpg" |
| rowing-5.jpg | (0, 224) | 300×200 | #2A2A2A | 2px #404040 | "rowing-5.jpg" |
| rowing-6.jpg | (324, 224) | 300×200 | #2A2A2A | 2px #404040 | "rowing-6.jpg" |
| rowing-7.jpg | (648, 224) | 300×200 | #2A2A2A | 2px #404040 | "rowing-7.jpg" |
| rowing-8.jpg | (972, 224) | 300×200 | #2A2A2A | 2px #404040 | "rowing-8.jpg" |
| rowing-9.jpg | (0, 448) | 300×200 | #2A2A2A | 2px #404040 | "rowing-9.jpg" |
| rowing-10.jpg | (324, 448) | 300×200 | #2A2A2A | 2px #404040 | "rowing-10.jpg" |
| rowing-11.jpg | (648, 448) | 300×200 | #2A2A2A | 2px #404040 | "rowing-11.jpg" |
| rowing-12.jpg | (972, 448) | 300×200 | #2A2A2A | 2px #404040 | "rowing-12.jpg" |
| rowing-13.jpg | (0, 672) | 300×200 | #2A2A2A | 2px #404040 | "rowing-13.jpg" |
| rowing-14.jpg | (324, 672) | 300×200 | #2A2A2A | 2px #404040 | "rowing-14.jpg" |
| rowing-15.jpg | (648, 672) | 300×200 | #2A2A2A | 2px #404040 | "rowing-15.jpg" |
| rowing-16.jpg | (972, 672) | 300×200 | #2A2A2A | 2px #404040 | "rowing-16.jpg" |

### Label Specifications
Each frame should contain a text label:
- **Content:** Filename (e.g., "rowing-1.jpg")
- **Position:** Centered horizontally, vertically centered in frame
- **Font:** Label/Large (Inter 14px, weight 600)
- **Color:** Ink/Body (#A3A3A3)

## Section 2: Hero Candidates Placeholders

### Header
Create text element:
- **Content:** "Hero Candidates"
- **Position:** x=0, y=976 (below action grid + 80px margin)
- **Font:** Display/H1 (Fraunces 48px, weight 600)
- **Color:** Ink/Primary (#E5E5E5)

### Frame Specifications (3 frames)

| Frame Name | Position | Size | Background | Border | Filename Label | Note Label |
|------------|----------|------|------------|--------|----------------|------------|
| Hero Candidate: boathouse-sunset.jpg | (0, 1016) | 600×400 | #2A2A2A | 2px #404040 | "boathouse-sunset.jpg" @ (20, 1036) | "Golden hour - warm, inviting" @ (20, 1066) |
| Hero Candidate: crew-on-water.jpg | (624, 1016) | 600×400 | #2A2A2A | 2px #404040 | "crew-on-water.jpg" @ (644, 1036) | "Action shot - dynamic, energy" @ (644, 1066) |
| Hero Candidate: eight-skyline.jpg | (1248, 1016) | 600×400 | #2A2A2A | 2px #404040 | "eight-skyline.jpg" @ (1268, 1036) | "Scale shot - impressive, context" @ (1268, 1066) |

### Label Specifications
Each frame should contain two text labels:

**Filename Label:**
- **Font:** Label/Large (Inter 14px, weight 600)
- **Color:** Ink/Primary (#E5E5E5)
- **Position:** 20px from left edge, 20px from top edge

**Note Label:**
- **Font:** Body/Small (Inter 13px, weight 400)
- **Color:** Ink/Body (#A3A3A3)
- **Position:** 20px from left edge, 50px from top edge

## Section 3: Video Asset Placeholders

### Header
Create text element:
- **Content:** "Video Assets"
- **Position:** x=0, y=1496 (below hero section + 80px margin)
- **Font:** Display/H1 (Fraunces 48px, weight 600)
- **Color:** Ink/Primary (#E5E5E5)

### Frame Specifications (5 frames)

Each video placeholder should have:
1. **Frame** with border
2. **Large "VIDEO" label** prominently displayed
3. **Filename** below frame
4. **Usage note** below filename

| Frame Name | Position | Size | Background | Border | VIDEO Label | Filename | Usage Note |
|------------|----------|------|------------|--------|-------------|----------|------------|
| VIDEO: hero-video.mp4 | (0, 1536) | 640×360 | #1A1A1A | 2px #404040 | "VIDEO" @ center | "hero-video.mp4" @ (10, 1906) | "Hero background - autoplay, muted, loop" @ (10, 1926) |
| VIDEO: video-2.mp4 | (0, 1986) | 200×133 | #1A1A1A | 2px #404040 | "VIDEO" @ center | "video-2.mp4" @ (10, 2129) | "Feature tile - inline playback" @ (10, 2149) |
| VIDEO: video-3.mp4 | (0, 2229) | 200×133 | #1A1A1A | 2px #404040 | "VIDEO" @ center | "video-3.mp4" @ (10, 2372) | "Gallery tile - click to play" @ (10, 2392) |
| VIDEO: video-5.mp4 | (0, 2472) | 200×133 | #1A1A1A | 2px #404040 | "VIDEO" @ center | "video-5.mp4" @ (10, 2615) | "Gallery tile - click to play" @ (10, 2635) |
| VIDEO: video-6.mp4 | (0, 2715) | 200×133 | #1A1A1A | 2px #404040 | "VIDEO" @ center | "video-6.mp4" @ (10, 2858) | "Gallery tile - click to play" @ (10, 2878) |

### Label Specifications

**VIDEO Label:**
- **Content:** "VIDEO"
- **Font:** Metric/Medium (Geist Mono 24px, weight 500)
- **Color:** Ink/Bright (#FAFAFA)
- **Position:** Centered both horizontally and vertically in frame

**Filename Label:**
- **Font:** Label/Large (Inter 14px, weight 600)
- **Color:** Ink/Primary (#E5E5E5)
- **Position:** 10px from left edge, 10px below frame

**Usage Note Label:**
- **Font:** Body/XS (Inter 12px, weight 400)
- **Color:** Ink/Body (#A3A3A3)
- **Position:** 10px from left edge, 30px below frame

## Implementation Guidelines

### Creating Placeholder Frames
1. **Select Visual-Style frame** on 01-Brand-Identity page
2. **For each placeholder:**
   - Create a frame with specified name
   - Set position and size as specified
   - Add rectangle for background fill
   - Add rectangle for border stroke
   - Add text label(s) with specified content, font, and color

### Color Reference
Use these colors from the Asset Library:
- **Background:** #2A2A2A (dark gray, not in Inkwell palette - create as local color)
- **Border:** Ink/Muted (#404040)
- **Video Background:** Ink/Raised (#1A1A1A)
- **Primary Text:** Ink/Primary (#E5E5E5)
- **Secondary Text:** Ink/Body (#A3A3A3)
- **Bright Text:** Ink/Bright (#FAFAFA)

### Typography Reference
Use these styles from the Asset Library:
- **Display/H1:** Section headers (Fraunces 48px, weight 600)
- **Label/Large:** Frame filenames (Inter 14px, weight 600)
- **Body/Small:** Notes and metadata (Inter 13px, weight 400)
- **Body/XS:** Usage descriptions (Inter 12px, weight 400)
- **Metric/Medium:** "VIDEO" label (Geist Mono 24px, weight 500)

## Usage Context

These placeholder frames serve multiple purposes:

1. **Design Reference:** Show what real images will replace placeholders
2. **Layout Planning:** Provide dimensions for bento grid and gallery layouts
3. **Asset Inventory:** Document all available rowing visuals in one location
4. **Video Specifications:** Document video playback behaviors for developers

## Manual Image Upload (Future Step)

When ready to add real images:
1. **Upload images** to Penpot from `/home/swd/RowLab/public/images/rowing/`
2. **Replace placeholder backgrounds** with actual image fills
3. **Keep filenames as labels** for reference
4. **Maintain frame dimensions** (may resize for specific layouts later)

For videos (cannot be embedded in Penpot):
- Keep placeholder frames as-is
- Reference these specifications in code implementation
- Use frames for layout sizing guidance only

## Verification Checklist

After manual implementation in Penpot, verify:

- [ ] Visual-Style frame exists on 01-Brand-Identity page
- [ ] "Action Images" section header visible
- [ ] 16 action image placeholders in 4×4 grid (300×200px, 24px gap)
- [ ] Each action image has filename label
- [ ] "Hero Candidates" section header visible
- [ ] 3 hero candidate placeholders (600×400px)
- [ ] Each hero candidate has filename and descriptive note
- [ ] "Video Assets" section header visible
- [ ] 5 video placeholders with correct dimensions
- [ ] Each video has prominent "VIDEO" label
- [ ] Each video has filename and usage note
- [ ] All colors match Inkwell palette (where applicable)
- [ ] All typography uses Asset Library styles
- [ ] Total: 24 placeholder frames created

## Next Steps

1. **Manual Penpot Implementation:** Create all placeholder frames as specified (estimated 30-45 minutes)
2. **Phase 19-03:** Use these placeholders as reference for landing page image layouts
3. **Phase 19-04+:** Incorporate images into component designs and mockups
4. **Future:** Replace placeholders with actual images when ready for high-fidelity mockups

## Developer Notes

- **Image files exist:** All 16 rowing images and 3 hero images are already in repository
- **Videos exist:** All 5 video files are already in repository
- **File paths:** `/home/swd/RowLab/public/images/rowing/[filename]`
- **Implementation:** Landing page already uses some of these images (see `src/pages/LandingPage.tsx`)
- **Video handling:** Current implementation uses `<video>` elements with autoplay/loop for hero

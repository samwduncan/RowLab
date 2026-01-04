/**
 * NOIR SPECTRUM Design System - Spacing Tokens
 * 8px base grid system (Apple HIG, Material Design compliant)
 */

// ========================================
// SPACING SCALE
// Base unit: 8px
// ========================================
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  1.5: '0.375rem',   // 6px
  2: '0.5rem',       // 8px   (1 unit)
  2.5: '0.625rem',   // 10px
  3: '0.75rem',      // 12px  (1.5 units)
  3.5: '0.875rem',   // 14px
  4: '1rem',         // 16px  (2 units)
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px  (3 units)
  7: '1.75rem',      // 28px
  8: '2rem',         // 32px  (4 units)
  9: '2.25rem',      // 36px
  10: '2.5rem',      // 40px  (5 units)
  11: '2.75rem',     // 44px
  12: '3rem',        // 48px  (6 units)
  14: '3.5rem',      // 56px  (7 units)
  16: '4rem',        // 64px  (8 units) - Collapsed sidebar width
  18: '4.5rem',      // 72px  (9 units)
  20: '5rem',        // 80px  (10 units)
  24: '6rem',        // 96px  (12 units)
  28: '7rem',        // 112px
  32: '8rem',        // 128px (16 units)
  36: '9rem',        // 144px
  40: '10rem',       // 160px
  44: '11rem',       // 176px
  48: '12rem',       // 192px
  56: '14rem',       // 224px
  60: '15rem',       // 240px - Expanded sidebar width
  64: '16rem',       // 256px
  72: '18rem',       // 288px
  80: '20rem',       // 320px
  96: '24rem',       // 384px
} as const;

// ========================================
// COMPONENT-SPECIFIC SPACING
// ========================================
export const componentSpacing = {
  // Sidebar dimensions
  sidebar: {
    collapsed: '4rem',     // 64px
    expanded: '15rem',     // 240px
    itemPadding: '0.75rem', // 12px
    itemGap: '0.25rem',    // 4px
  },

  // Command palette
  commandPalette: {
    width: '40rem',        // 640px
    maxHeight: '70vh',
    itemPadding: '0.75rem 1rem',
    groupPadding: '0.5rem 1rem',
  },

  // Kanban board
  kanban: {
    columnWidth: '18rem',   // 288px
    columnGap: '1rem',      // 16px
    cardPadding: '0.75rem', // 12px
    cardGap: '0.5rem',      // 8px
    headerHeight: '3rem',   // 48px
  },

  // Cards
  card: {
    paddingSm: '0.75rem',  // 12px
    paddingMd: '1rem',     // 16px
    paddingLg: '1.5rem',   // 24px
    gap: '1rem',           // 16px
  },

  // Buttons
  button: {
    paddingXs: '0.25rem 0.5rem',
    paddingSm: '0.375rem 0.75rem',
    paddingMd: '0.5rem 1rem',
    paddingLg: '0.75rem 1.5rem',
    iconSize: '2.5rem',    // 40px for icon buttons
  },

  // Inputs
  input: {
    paddingSm: '0.5rem 0.75rem',
    paddingMd: '0.625rem 1rem',
    paddingLg: '0.75rem 1.25rem',
  },

  // Modal/Dialog
  modal: {
    paddingSm: '1rem',
    paddingMd: '1.5rem',
    paddingLg: '2rem',
    gap: '1.5rem',
  },

  // Page layout
  page: {
    paddingX: '1.5rem',    // 24px
    paddingY: '1.5rem',    // 24px
    maxWidth: '90rem',     // 1440px
    gap: '1.5rem',         // 24px
  },

  // Header/Top bar
  header: {
    height: '3.5rem',      // 56px
    paddingX: '1.25rem',   // 20px
  },
} as const;

// ========================================
// GAP PRESETS
// ========================================
export const gaps = {
  none: '0',
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  '2xl': '2rem',    // 32px
  '3xl': '3rem',    // 48px
} as const;

// ========================================
// BORDER RADIUS
// Apple rounded aesthetic
// ========================================
export const borderRadius = {
  none: '0',
  sm: '0.375rem',   // 6px
  DEFAULT: '0.5rem', // 8px
  md: '0.625rem',   // 10px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.25rem', // 20px
  '3xl': '1.5rem',  // 24px
  '4xl': '2rem',    // 32px
  full: '9999px',
} as const;

// ========================================
// Z-INDEX SCALE
// ========================================
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 20,
  sticky: 30,
  banner: 40,
  overlay: 50,
  modal: 60,
  popover: 70,
  skipLink: 80,
  toast: 90,
  tooltip: 100,
  commandPalette: 110,
} as const;

export default {
  spacing,
  componentSpacing,
  gaps,
  borderRadius,
  zIndex,
};

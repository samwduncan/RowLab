/**
 * NOIR SPECTRUM Design System - Typography Tokens
 * Apple SF Pro inspired with harmonious scale
 */

// ========================================
// FONT FAMILIES
// Apple SF Pro stack with fallbacks
// ========================================
export const fontFamily = {
  sans: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"SF Pro Display"',
    '"SF Pro Text"',
    'system-ui',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ],
  mono: [
    '"SF Mono"',
    'SFMono-Regular',
    'ui-monospace',
    'Menlo',
    'Monaco',
    'Consolas',
    '"Liberation Mono"',
    '"Courier New"',
    'monospace',
  ],
  display: [
    '"SF Pro Display"',
    '-apple-system',
    'BlinkMacSystemFont',
    'system-ui',
    '"Segoe UI"',
    'sans-serif',
  ],
} as const;

// ========================================
// TYPE SCALE (1.25 Major Third ratio)
// Includes line-height and letter-spacing
// ========================================
export const fontSize = {
  'xs': {
    size: '0.75rem',      // 12px
    lineHeight: '1rem',
    letterSpacing: '0.01em',
  },
  'sm': {
    size: '0.875rem',     // 14px
    lineHeight: '1.25rem',
    letterSpacing: '0.005em',
  },
  'base': {
    size: '1rem',         // 16px
    lineHeight: '1.5rem',
    letterSpacing: '0',
  },
  'lg': {
    size: '1.125rem',     // 18px
    lineHeight: '1.75rem',
    letterSpacing: '-0.01em',
  },
  'xl': {
    size: '1.25rem',      // 20px
    lineHeight: '1.75rem',
    letterSpacing: '-0.01em',
  },
  '2xl': {
    size: '1.5rem',       // 24px
    lineHeight: '2rem',
    letterSpacing: '-0.02em',
  },
  '3xl': {
    size: '1.875rem',     // 30px
    lineHeight: '2.25rem',
    letterSpacing: '-0.02em',
  },
  '4xl': {
    size: '2.25rem',      // 36px
    lineHeight: '2.5rem',
    letterSpacing: '-0.03em',
  },
  '5xl': {
    size: '3rem',         // 48px
    lineHeight: '1.15',
    letterSpacing: '-0.03em',
  },
  '6xl': {
    size: '3.75rem',      // 60px
    lineHeight: '1.1',
    letterSpacing: '-0.04em',
  },
  '7xl': {
    size: '4.5rem',       // 72px
    lineHeight: '1.05',
    letterSpacing: '-0.04em',
  },
  '8xl': {
    size: '6rem',         // 96px
    lineHeight: '1',
    letterSpacing: '-0.04em',
  },
} as const;

// ========================================
// FONT WEIGHTS
// ========================================
export const fontWeight = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

// ========================================
// LINE HEIGHTS
// ========================================
export const lineHeight = {
  none: '1',
  tight: '1.15',
  snug: '1.25',
  normal: '1.5',
  relaxed: '1.625',
  loose: '1.75',
} as const;

// ========================================
// LETTER SPACING
// ========================================
export const letterSpacing = {
  tighter: '-0.04em',
  tight: '-0.02em',
  normal: '0',
  wide: '0.01em',
  wider: '0.02em',
  widest: '0.08em',
} as const;

// ========================================
// TYPOGRAPHY PRESETS
// Ready-to-use text style combinations
// ========================================
export const textStyles = {
  // Display headings (hero, titles)
  displayLarge: {
    fontFamily: fontFamily.display.join(', '),
    fontSize: fontSize['7xl'].size,
    lineHeight: fontSize['7xl'].lineHeight,
    letterSpacing: fontSize['7xl'].letterSpacing,
    fontWeight: fontWeight.bold,
  },
  displayMedium: {
    fontFamily: fontFamily.display.join(', '),
    fontSize: fontSize['5xl'].size,
    lineHeight: fontSize['5xl'].lineHeight,
    letterSpacing: fontSize['5xl'].letterSpacing,
    fontWeight: fontWeight.bold,
  },
  displaySmall: {
    fontFamily: fontFamily.display.join(', '),
    fontSize: fontSize['4xl'].size,
    lineHeight: fontSize['4xl'].lineHeight,
    letterSpacing: fontSize['4xl'].letterSpacing,
    fontWeight: fontWeight.semibold,
  },

  // Page headings
  headingLarge: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: fontSize['3xl'].size,
    lineHeight: fontSize['3xl'].lineHeight,
    letterSpacing: fontSize['3xl'].letterSpacing,
    fontWeight: fontWeight.semibold,
  },
  headingMedium: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: fontSize['2xl'].size,
    lineHeight: fontSize['2xl'].lineHeight,
    letterSpacing: fontSize['2xl'].letterSpacing,
    fontWeight: fontWeight.semibold,
  },
  headingSmall: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: fontSize['xl'].size,
    lineHeight: fontSize['xl'].lineHeight,
    letterSpacing: fontSize['xl'].letterSpacing,
    fontWeight: fontWeight.semibold,
  },

  // Section headings
  titleLarge: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: fontSize['lg'].size,
    lineHeight: fontSize['lg'].lineHeight,
    letterSpacing: fontSize['lg'].letterSpacing,
    fontWeight: fontWeight.medium,
  },
  titleMedium: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: fontSize['base'].size,
    lineHeight: fontSize['base'].lineHeight,
    letterSpacing: letterSpacing.normal,
    fontWeight: fontWeight.medium,
  },
  titleSmall: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: fontSize['sm'].size,
    lineHeight: fontSize['sm'].lineHeight,
    letterSpacing: letterSpacing.wide,
    fontWeight: fontWeight.medium,
  },

  // Body text
  bodyLarge: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: fontSize['lg'].size,
    lineHeight: lineHeight.relaxed,
    letterSpacing: letterSpacing.normal,
    fontWeight: fontWeight.normal,
  },
  bodyMedium: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: fontSize['base'].size,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
    fontWeight: fontWeight.normal,
  },
  bodySmall: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: fontSize['sm'].size,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
    fontWeight: fontWeight.normal,
  },

  // Labels and captions
  labelLarge: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: fontSize['sm'].size,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.wide,
    fontWeight: fontWeight.medium,
  },
  labelMedium: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: fontSize['xs'].size,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.wide,
    fontWeight: fontWeight.medium,
  },
  labelSmall: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: '0.6875rem', // 11px
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.wider,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase' as const,
  },

  // Code and mono
  codeLarge: {
    fontFamily: fontFamily.mono.join(', '),
    fontSize: fontSize['sm'].size,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
    fontWeight: fontWeight.normal,
  },
  codeSmall: {
    fontFamily: fontFamily.mono.join(', '),
    fontSize: fontSize['xs'].size,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
    fontWeight: fontWeight.normal,
  },
} as const;

export default {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textStyles,
};

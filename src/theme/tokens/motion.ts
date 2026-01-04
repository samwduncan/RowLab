/**
 * NOIR SPECTRUM Design System - Motion Tokens
 * Framer Motion variants, easings, and durations
 * Apple-level polish with spring physics
 */

// ========================================
// DURATION SCALE (in seconds)
// ========================================
export const duration = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.2,
  moderate: 0.3,
  slow: 0.4,
  slower: 0.5,
  slowest: 0.8,
} as const;

// ========================================
// EASING CURVES
// Apple-inspired bezier curves
// ========================================
export const easing = {
  // Standard easing
  ease: [0.25, 0.1, 0.25, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],

  // Apple-style curves
  appleDefault: [0.25, 0.1, 0.25, 1],
  appleExpand: [0.16, 1, 0.3, 1],
  appleCollapse: [0.4, 0, 0.2, 1],

  // Snappy interactions
  snappy: [0.32, 0.72, 0, 1],
  snappyOut: [0.22, 0.68, 0, 1],

  // Smooth deceleration
  decel: [0, 0, 0.2, 1],
  accel: [0.4, 0, 1, 1],

  // Bounce
  bounce: [0.68, -0.55, 0.265, 1.55],
  bounceOut: [0.34, 1.56, 0.64, 1],
} as const;

// ========================================
// SPRING CONFIGURATIONS
// For natural, physics-based motion
// ========================================
export const spring = {
  // Default spring (balanced)
  default: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
    mass: 1,
  },

  // Snappy (fast, minimal overshoot)
  snappy: {
    type: 'spring' as const,
    stiffness: 600,
    damping: 35,
    mass: 0.8,
  },

  // Bouncy (playful)
  bouncy: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 15,
    mass: 1,
  },

  // Gentle (slow, smooth)
  gentle: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 25,
    mass: 1,
  },

  // Stiff (minimal bounce)
  stiff: {
    type: 'spring' as const,
    stiffness: 700,
    damping: 40,
    mass: 1,
  },

  // Sidebar expand/collapse
  sidebar: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 35,
    mass: 0.8,
  },

  // Modal entrance
  modal: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 28,
    mass: 1,
  },

  // Card hover lift
  cardHover: {
    type: 'spring' as const,
    stiffness: 600,
    damping: 30,
    mass: 0.5,
  },

  // Drag and drop
  drag: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 25,
    mass: 0.8,
  },
} as const;

// ========================================
// PAGE TRANSITION VARIANTS
// ========================================
export const pageTransition = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
} as const;

// ========================================
// SIDEBAR VARIANTS
// ========================================
export const sidebarVariants = {
  expanded: {
    width: '15rem', // 240px
    transition: spring.sidebar,
  },
  collapsed: {
    width: '4rem', // 64px
    transition: spring.sidebar,
  },
} as const;

export const sidebarItemVariants = {
  expanded: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  collapsed: {
    opacity: 0,
    x: -10,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 1, 1],
    },
  },
} as const;

// ========================================
// MODAL/DIALOG VARIANTS
// ========================================
export const modalVariants = {
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  },
  content: {
    initial: { opacity: 0, scale: 0.96, y: 8 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: spring.modal,
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      y: 4,
      transition: { duration: 0.15, ease: [0.4, 0, 1, 1] },
    },
  },
} as const;

// ========================================
// COMMAND PALETTE VARIANTS
// ========================================
export const commandPaletteVariants = {
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.15 } },
    exit: { opacity: 0, transition: { duration: 0.1 } },
  },
  content: {
    initial: { opacity: 0, scale: 0.98, y: -16 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: spring.snappy,
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      y: -8,
      transition: { duration: 0.1, ease: [0.4, 0, 1, 1] },
    },
  },
  item: {
    initial: { opacity: 0, x: -8 },
    animate: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.02,
        duration: 0.15,
        ease: [0.25, 0.1, 0.25, 1],
      },
    }),
  },
} as const;

// ========================================
// CARD VARIANTS
// ========================================
export const cardVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: spring.cardHover,
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
} as const;

// ========================================
// KANBAN/DRAG-DROP VARIANTS
// ========================================
export const kanbanVariants = {
  column: {
    initial: { opacity: 0, x: 24 },
    animate: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        ...spring.default,
      },
    }),
  },
  seat: {
    initial: { opacity: 0, scale: 0.9 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: spring.default,
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.15 },
    },
  },
  dragging: {
    scale: 1.05,
    rotate: 2,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 0 2px rgba(99, 102, 241, 0.4)',
    transition: spring.drag,
  },
  dropTarget: {
    scale: 1.02,
    borderColor: 'rgba(99, 102, 241, 0.6)',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    transition: { duration: 0.15 },
  },
} as const;

// ========================================
// BUTTON VARIANTS
// ========================================
export const buttonVariants = {
  idle: {
    scale: 1,
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.15 },
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
} as const;

// ========================================
// STAGGER CONTAINER VARIANTS
// ========================================
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
} as const;

export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  },
} as const;

// ========================================
// FADE VARIANTS
// ========================================
export const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
} as const;

// ========================================
// SLIDE VARIANTS
// ========================================
export const slideVariants = {
  fromRight: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1, transition: spring.default },
    exit: { x: '100%', opacity: 0, transition: { duration: 0.2 } },
  },
  fromLeft: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1, transition: spring.default },
    exit: { x: '-100%', opacity: 0, transition: { duration: 0.2 } },
  },
  fromBottom: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1, transition: spring.default },
    exit: { y: '100%', opacity: 0, transition: { duration: 0.2 } },
  },
  fromTop: {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1, transition: spring.default },
    exit: { y: '-100%', opacity: 0, transition: { duration: 0.2 } },
  },
} as const;

// ========================================
// SHIMMER ANIMATION (CSS Keyframes)
// To be used with CSS animation property
// ========================================
export const shimmerAnimation = {
  keyframes: `
    @keyframes shimmer {
      0% { background-position: 200% 50%; }
      100% { background-position: -200% 50%; }
    }
  `,
  animation: 'shimmer 8s linear infinite',
  backgroundSize: '400% 100%',
} as const;

export const pulseGlowAnimation = {
  keyframes: `
    @keyframes pulse-glow {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
  `,
  animation: 'pulse-glow 2s ease-in-out infinite',
} as const;

// ========================================
// SCROLL-DRIVEN ANIMATION CONFIGS
// For landing page parallax
// ========================================
export const scrollAnimations = {
  parallax: {
    slow: { y: ['0%', '30%'] },
    medium: { y: ['0%', '50%'] },
    fast: { y: ['0%', '80%'] },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 60 },
    whileInView: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    },
    viewport: { once: true, margin: '-100px' },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    whileInView: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
    },
    viewport: { once: true, margin: '-50px' },
  },
} as const;

// ========================================
// TOOLTIP VARIANTS
// ========================================
export const tooltipVariants = {
  initial: { opacity: 0, scale: 0.96, y: 4 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 4,
    transition: { duration: 0.1 },
  },
} as const;

// ========================================
// DROPDOWN/POPOVER VARIANTS
// ========================================
export const dropdownVariants = {
  initial: { opacity: 0, scale: 0.95, y: -8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: spring.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -4,
    transition: { duration: 0.1 },
  },
} as const;

// ========================================
// LOADING SKELETON ANIMATION
// ========================================
export const skeletonAnimation = {
  keyframes: `
    @keyframes skeleton-pulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.7; }
    }
  `,
  animation: 'skeleton-pulse 1.5s ease-in-out infinite',
} as const;

export default {
  duration,
  easing,
  spring,
  pageTransition,
  sidebarVariants,
  sidebarItemVariants,
  modalVariants,
  commandPaletteVariants,
  cardVariants,
  kanbanVariants,
  buttonVariants,
  staggerContainer,
  staggerItem,
  fadeVariants,
  slideVariants,
  shimmerAnimation,
  pulseGlowAnimation,
  scrollAnimations,
  tooltipVariants,
  dropdownVariants,
  skeletonAnimation,
};

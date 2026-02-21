/**
 * Card component — oarbit design system.
 *
 * Opaque void-raised background with border. NO panel/blur/transparency.
 *
 * Variants:
 *   default     — bg-void-raised, border-edge-default, optional shadow-sm
 *   interactive — hover lift + shadow-md on hover
 *   elevated    — bg-void-overlay, shadow-md (for modals/popovers)
 *   inset       — bg-void-deep, border-edge-default (recessed wells)
 *
 * Padding: none | sm (12px) | md (16px) | lg (24px)
 * Radius: radius-lg (8px)
 *
 * Backward-compatible: also exported as GlassCard for migration.
 */

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: 'div' | 'section' | 'article';
  variant?: 'default' | 'interactive' | 'elevated' | 'inset';
  /** @deprecated No-op in new design system. Kept for backward compat. */
  hover?: boolean;
  /** @deprecated No-op in new design system. Kept for backward compat. */
  glow?: boolean;
  /** @deprecated Use variant="interactive" instead. Kept for backward compat. */
  interactive?: boolean;
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
} as const;

const variantClasses = {
  default: 'bg-void-raised border border-edge-default rounded-[var(--radius-lg)]',
  interactive: [
    'bg-void-raised border border-edge-default rounded-[var(--radius-lg)]',
    'card-interactive hover-lift',
  ].join(' '),
  elevated: 'bg-void-overlay border border-edge-default rounded-[var(--radius-lg)] shadow-md',
  inset: 'bg-void-deep border border-edge-default rounded-[var(--radius-md)]',
} as const;

export function Card({
  children,
  className = '',
  style,
  padding = 'md',
  as: Component = 'div',
  variant = 'default',
  interactive = false,
}: CardProps) {
  // Support legacy interactive prop
  const resolvedVariant = interactive && variant === 'default' ? 'interactive' : variant;
  const base = variantClasses[resolvedVariant];

  return (
    <Component className={`${base} ${paddingMap[padding]} ${className}`.trim()} style={style}>
      {children}
    </Component>
  );
}

/** @deprecated Use Card instead. This alias exists for backward compatibility. */
export const GlassCard = Card;

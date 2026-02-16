/**
 * Glass morphism card component — full Canvas design system implementation.
 *
 * Variants:
 *   default  — standard glass with blur, noise, gradient hover line
 *   elevated — stronger blur, deeper shadow, brighter border
 *   sunken   — inset shadow for input wells / recessed areas
 *   hero     — gradient border on all sides (copper → blue → copper)
 *
 * Props:
 *   glow        — copper glow shadow on hover
 *   interactive — subtle lift on hover
 */

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: 'div' | 'section' | 'article';
  variant?: 'default' | 'elevated' | 'sunken' | 'hero';
  /** Adds copper glow shadow on hover */
  glow?: boolean;
  /** Adds subtle lift on hover with transition */
  interactive?: boolean;
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
} as const;

const variantClasses = {
  default: 'glass rounded-xl shadow-card',
  elevated: 'glass-elevated rounded-xl',
  sunken: 'glass-sunken rounded-lg',
  hero: 'glass-hero rounded-xl shadow-card',
} as const;

export function GlassCard({
  children,
  className = '',
  style,
  hover = false,
  padding = 'md',
  as: Component = 'div',
  variant = 'default',
  glow = false,
  interactive = false,
}: GlassCardProps) {
  const base = variantClasses[variant];

  return (
    <Component
      className={`
        group relative overflow-hidden ${base}
        ${hover ? 'glass-hover transition-shadow duration-200 hover:shadow-card-hover' : ''}
        ${glow ? 'hover:shadow-glow-copper' : ''}
        ${interactive ? 'hover:-translate-y-0.5 transition-transform duration-150' : ''}
        ${className}
      `.trim()}
      style={style}
    >
      {/* Noise texture overlay (skip for sunken — it has its own depth) */}
      {variant !== 'sunken' && (
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
      )}

      {/* Gradient hover border line (default + elevated only) */}
      {(variant === 'default' || variant === 'elevated') && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-copper/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}

      {/* Content sits above overlays */}
      <div className={`relative z-10 ${paddingMap[padding]}`}>{children}</div>
    </Component>
  );
}

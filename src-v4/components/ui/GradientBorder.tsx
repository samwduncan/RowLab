/**
 * @deprecated Gradient borders are banned in the new design system.
 * Use a standard 1px solid border or left-accent border instead.
 * This file exists for backward compatibility during migration.
 */

interface GradientBorderProps {
  children: React.ReactNode;
  className?: string;
  /** Background class for the inner container */
  innerBg?: string;
  /** Border radius class */
  radius?: string;
  /** Gradient class for the outer border */
  gradient?: string;
  /** Inline styles for the outer container */
  style?: React.CSSProperties;
}

export function GradientBorder({
  children,
  className = '',
  innerBg = 'bg-void-surface',
  radius = 'rounded-[var(--radius-lg)]',
  gradient = 'bg-gradient-to-b from-text-bright/15 to-text-bright/0',
  style,
}: GradientBorderProps) {
  return (
    <div className={`relative p-px ${radius} ${gradient} ${className}`} style={style}>
      <div className={`${innerBg} ${radius} h-full`}>{children}</div>
    </div>
  );
}

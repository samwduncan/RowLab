/**
 * Gradient border wrapper using the padding-trick pattern.
 * Renders a 1px gradient border around children by using
 * an outer gradient div with p-px and an inner solid-bg div.
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
  /** Inline styles for the outer container (e.g. dynamic glow shadow) */
  style?: React.CSSProperties;
}

export function GradientBorder({
  children,
  className = '',
  innerBg = 'bg-ink-base',
  radius = 'rounded-2xl',
  gradient = 'bg-gradient-to-b from-ink-bright/15 to-ink-bright/0',
  style,
}: GradientBorderProps) {
  return (
    <div className={`relative p-px ${radius} ${gradient} ${className}`} style={style}>
      <div className={`${innerBg} ${radius} h-full`}>{children}</div>
    </div>
  );
}

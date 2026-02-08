/**
 * ConfidenceRing - Animated radial progress confidence indicator
 *
 * Displays confidence as a circular progress ring with color-coded levels.
 * Replaces ConfidenceBadge for enhanced visual feedback.
 */

export interface ConfidenceRingProps {
  confidence: number; // 0-100
  size?: number;
}

export function ConfidenceRing({ confidence, size = 40 }: ConfidenceRingProps) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (confidence / 100) * circumference;

  // Color based on confidence level (V3 design tokens)
  const color =
    confidence >= 80
      ? 'var(--data-excellent)'
      : confidence >= 60
        ? 'var(--data-good)'
        : confidence >= 40
          ? 'var(--data-warning)'
          : 'var(--data-poor)';

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--ink-border)"
        strokeWidth={strokeWidth}
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transition: 'stroke-dashoffset 0.5s ease-out',
        }}
      />
      {/* Center text */}
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-xs font-mono fill-txt-primary transform rotate-90"
        style={{ transformOrigin: 'center' }}
      >
        {confidence}
      </text>
    </svg>
  );
}

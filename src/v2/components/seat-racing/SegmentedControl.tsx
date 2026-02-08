import { motion } from 'framer-motion';
import { SPRING_FAST } from '@v2/utils/animations';

export interface SegmentedControlOption {
  value: string;
  label: string;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * SegmentedControl - iOS-style animated segmented control
 *
 * Displays radio button group with sliding pill indicator (layoutId animation).
 * Used for side filter (All/Port/Starboard) and other toggle UIs.
 */
export function SegmentedControl({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps) {
  return (
    <div className={`relative inline-flex bg-bg-raised rounded-lg p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className="relative px-4 py-2 text-sm font-medium transition-colors z-10"
          style={{
            color:
              value === option.value
                ? 'var(--ink-deep)' // Dark text on light pill
                : 'var(--ink-secondary)', // Faded when unselected
          }}
        >
          {value === option.value && (
            <motion.div
              layoutId="active-segment"
              className="absolute inset-0 bg-ink-bright rounded-md"
              transition={SPRING_FAST}
              style={{ zIndex: -1 }}
            />
          )}
          {option.label}
        </button>
      ))}
    </div>
  );
}

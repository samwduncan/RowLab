import React, { useCallback, useId } from 'react';
import { motion } from 'framer-motion';
import { SPRING_CONFIG, usePrefersReducedMotion } from '../../utils/animations';

/**
 * Toggle - Animated toggle switch component
 *
 * Features:
 * - Spring animation for thumb movement
 * - Glow effect when enabled
 * - Two sizes: sm, md
 * - Keyboard accessible (Enter, Space)
 * - ARIA attributes for screen readers
 * - Optional label and description
 * - Disabled state
 * - Reduced motion support
 */

// Class merging utility
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export type ToggleSize = 'sm' | 'md';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: ToggleSize;
  disabled?: boolean;
  label?: string;
  description?: string;
  id?: string;
  className?: string;
  'aria-label'?: string;
}

interface SizeConfig {
  track: string;
  thumb: string;
  thumbTranslate: number;
}

const sizeConfig: Record<ToggleSize, SizeConfig> = {
  sm: {
    track: 'w-8 h-5',
    thumb: 'w-3.5 h-3.5',
    thumbTranslate: 14, // 32px - 18px (thumb + padding)
  },
  md: {
    track: 'w-11 h-6',
    thumb: 'w-4 h-4',
    thumbTranslate: 20, // 44px - 24px
  },
};

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  size = 'md',
  disabled = false,
  label,
  description,
  id: providedId,
  className,
  'aria-label': ariaLabel,
}) => {
  const generatedId = useId();
  const id = providedId || generatedId;
  const descriptionId = description ? `${id}-description` : undefined;
  const prefersReducedMotion = usePrefersReducedMotion();

  const handleClick = useCallback(() => {
    if (!disabled) {
      onChange(!checked);
    }
  }, [disabled, checked, onChange]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onChange(!checked);
      }
    },
    [disabled, checked, onChange]
  );

  const config = sizeConfig[size];

  const trackClasses = cn(
    config.track,
    'relative inline-flex items-center rounded-full',
    'transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-interactive-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]',
    checked
      ? 'bg-[var(--color-interactive-primary)]'
      : 'bg-[var(--color-bg-active)]',
    disabled && 'opacity-50 cursor-not-allowed',
    !disabled && 'cursor-pointer'
  );

  const thumbMotionProps = prefersReducedMotion
    ? {
        initial: false,
        animate: {
          x: checked ? config.thumbTranslate : 0,
        },
        transition: { duration: 0 },
      }
    : {
        initial: false,
        animate: {
          x: checked ? config.thumbTranslate : 0,
          scale: checked ? 1 : 1,
        },
        transition: SPRING_CONFIG,
      };

  // Glow effect for enabled state
  const glowClasses = checked && !disabled
    ? 'shadow-[0_0_8px_var(--color-interactive-primary)]'
    : '';

  const toggleElement = (
    <div
      role="switch"
      aria-checked={checked}
      aria-label={!label ? ariaLabel : undefined}
      aria-labelledby={label ? id : undefined}
      aria-describedby={descriptionId}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(trackClasses, glowClasses)}
    >
      <motion.span
        className={cn(
          config.thumb,
          'absolute left-1 rounded-full bg-white shadow-sm'
        )}
        {...thumbMotionProps}
      />
    </div>
  );

  // If no label, just return the toggle
  if (!label) {
    return <div className={className}>{toggleElement}</div>;
  }

  // With label layout
  return (
    <div className={cn('flex items-start gap-3', className)}>
      {toggleElement}
      <div className="flex flex-col">
        <label
          id={id}
          htmlFor={id}
          className={cn(
            'text-sm font-medium text-[var(--color-text-primary)]',
            disabled && 'opacity-50',
            !disabled && 'cursor-pointer'
          )}
          onClick={handleClick}
        >
          {label}
        </label>
        {description && (
          <span
            id={descriptionId}
            className={cn(
              'text-sm text-[var(--color-text-secondary)]',
              disabled && 'opacity-50'
            )}
          >
            {description}
          </span>
        )}
      </div>
    </div>
  );
};

Toggle.displayName = 'Toggle';

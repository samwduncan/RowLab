import React from 'react';
import { motion } from 'framer-motion';
import { SPRING_CONFIG } from '../../../utils/animations';
import type { FeatureConfig } from '../../../types/feature-toggles';

/**
 * Animated toggle switch component for features
 */
interface ToggleProps {
  enabled: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ enabled, onChange, disabled = false }) => (
  <button
    onClick={() => !disabled && onChange(!enabled)}
    disabled={disabled}
    className={`
      relative w-12 h-7 rounded-full transition-all duration-200
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      ${enabled
        ? 'bg-interactive-primary shadow-[0_0_12px_rgba(var(--color-interactive-primary-rgb),0.4)]'
        : 'bg-surface-elevated border border-bdr-subtle'
      }
    `}
  >
    <motion.span
      layout
      transition={SPRING_CONFIG}
      className={`
        absolute top-1 left-1 w-5 h-5 rounded-full shadow
        ${enabled ? 'bg-surface' : 'bg-txt-tertiary'}
      `}
      style={{ x: enabled ? 20 : 0 }}
    />
  </button>
);

interface FeatureToggleRowProps {
  feature: FeatureConfig;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

/**
 * FeatureToggleRow - Display a single feature with toggle control
 *
 * Features:
 * - Shows feature name and description
 * - Toggle switch for advanced features
 * - "Always on" badge for core features
 * - Disabled state for non-admin users
 */
export const FeatureToggleRow: React.FC<FeatureToggleRowProps> = ({
  feature,
  enabled,
  onToggle,
  disabled = false,
}) => {
  const isCore = feature.group === 'core';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-bdr-subtle last:border-0"
    >
      <div className="flex-1">
        <div className="font-medium text-txt-primary">{feature.name}</div>
        <div className="text-sm text-txt-secondary mt-0.5">{feature.description}</div>
      </div>
      <div className="sm:flex-shrink-0">
        {isCore ? (
          <div className="px-3 py-1.5 rounded-lg bg-interactive-primary/10 border border-interactive-primary/20 text-sm font-medium text-interactive-primary">
            Always on
          </div>
        ) : (
          <Toggle enabled={enabled} onChange={onToggle} disabled={disabled} />
        )}
      </div>
    </motion.div>
  );
};

export default FeatureToggleRow;

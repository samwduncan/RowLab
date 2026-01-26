import React from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { SPRING_CONFIG } from '../../../utils/animations';
import { FeatureToggleRow } from './FeatureToggleRow';
import type { FeatureGroup, FeatureConfig, FeatureId } from '../../../types/feature-toggles';

interface FeatureWithState extends FeatureConfig {
  enabled: boolean;
}

interface FeatureGroupCardProps {
  group: FeatureGroup;
  features: FeatureWithState[];
  onToggle: (featureId: FeatureId) => void;
  canEdit: boolean;
}

/**
 * FeatureGroupCard - Display a group of features with shared category
 *
 * Features:
 * - Card layout with group name and description
 * - Info banners for core and advanced groups
 * - List of FeatureToggleRow components
 * - Disabled state when user can't edit (non-owner/admin)
 */
export const FeatureGroupCard: React.FC<FeatureGroupCardProps> = ({
  group,
  features,
  onToggle,
  canEdit,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING_CONFIG}
      className="rounded-xl bg-surface-elevated border border-bdr-subtle overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 border-b border-bdr-subtle">
        <h3 className="text-lg font-display font-semibold text-txt-primary tracking-[-0.02em]">
          {group.name}
        </h3>
        <p className="text-sm text-txt-secondary mt-1">
          {group.description}
        </p>
      </div>

      {/* Info Banner */}
      {group.id === 'core' && (
        <div className="mx-5 mt-5 p-3 rounded-lg bg-interactive-primary/5 border border-interactive-primary/20 flex items-start gap-2">
          <Info className="w-4 h-4 text-interactive-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-txt-secondary">
            Core features are always enabled and cannot be turned off.
          </p>
        </div>
      )}

      {group.id === 'advanced' && (
        <div className="mx-5 mt-5 p-3 rounded-lg bg-status-info/5 border border-status-info/20 flex items-start gap-2">
          <Info className="w-4 h-4 text-status-info flex-shrink-0 mt-0.5" />
          <p className="text-sm text-txt-secondary">
            Enable only the features your team needs to keep your interface clean and focused.
          </p>
        </div>
      )}

      {/* Feature List */}
      <div className="p-5 space-y-1">
        {features.map((feature) => (
          <FeatureToggleRow
            key={feature.id}
            feature={feature}
            enabled={feature.enabled}
            onToggle={() => onToggle(feature.id)}
            disabled={!canEdit}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default FeatureGroupCard;

/**
 * RiggingPanel - Phase 18 BOAT-02
 *
 * Displays and edits rigging settings for a shell.
 * Shows defaults with option to customize.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, RotateCcw, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { useRiggingProfile, useSaveRiggingProfile, useDeleteRiggingProfile } from '@v2/hooks/useRiggingProfiles';
import { isScullBoat, DEFAULT_RIGGING } from '@v2/types/rigging';
import type { RiggingDefaults } from '@v2/types/rigging';

interface RiggingPanelProps {
  shellId: string;
  shellName: string;
  boatClass: string;
  className?: string;
  onClose?: () => void;
}

interface RiggingFieldProps {
  label: string;
  value: number | undefined;
  defaultValue: number | undefined;
  unit: string;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

function RiggingField({
  label,
  value,
  defaultValue,
  unit,
  min,
  max,
  step = 1,
  onChange,
}: RiggingFieldProps) {
  const displayValue = value ?? defaultValue ?? 0;
  const isModified = value !== undefined && value !== defaultValue;

  return (
    <div className="flex items-center justify-between py-2">
      <label className="text-sm text-txt-secondary">
        {label}
        {isModified && <span className="ml-1 text-amber-500">*</span>}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={displayValue}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-20 px-2 py-1 text-right text-sm rounded border border-bdr-default
                     bg-bg-elevated focus:outline-none focus:ring-2 focus:ring-interactive-primary"
        />
        <span className="text-xs text-txt-tertiary w-8">{unit}</span>
      </div>
    </div>
  );
}

export function RiggingPanel({
  shellId,
  boatClass,
  className = '',
}: RiggingPanelProps) {
  const { data: profile, isLoading } = useRiggingProfile(shellId);
  const saveMutation = useSaveRiggingProfile();
  const deleteMutation = useDeleteRiggingProfile();

  const [expanded, setExpanded] = useState(false);
  const [localDefaults, setLocalDefaults] = useState<RiggingDefaults | null>(null);

  // Get default values for this boat class
  const defaultRigging = useMemo(() => {
    return DEFAULT_RIGGING[boatClass] || DEFAULT_RIGGING['8+'];
  }, [boatClass]);

  // Use local state if editing, otherwise use profile data
  const currentDefaults = localDefaults ?? profile?.defaults ?? defaultRigging;
  const isCustom = profile?.isCustom ?? false;
  const isScull = isScullBoat(boatClass);

  const handleFieldChange = (field: keyof RiggingDefaults, value: number) => {
    setLocalDefaults((prev) => ({
      ...defaultRigging,
      ...prev,
      ...profile?.defaults,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!localDefaults) return;

    try {
      await saveMutation.mutateAsync({
        shellId,
        data: { shellId, defaults: localDefaults },
      });
      setLocalDefaults(null);
    } catch (error) {
      console.error('Failed to save rigging:', error);
    }
  };

  const handleResetToDefaults = async () => {
    if (!isCustom) return;

    try {
      await deleteMutation.mutateAsync(shellId);
      setLocalDefaults(null);
    } catch (error) {
      console.error('Failed to reset rigging:', error);
    }
  };

  const hasChanges = localDefaults !== null;

  if (isLoading) {
    return (
      <div className={`p-4 bg-bg-elevated rounded-lg border border-bdr-default ${className}`}>
        <div className="animate-pulse flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-bg-hover" />
          <div className="h-4 w-32 rounded bg-bg-hover" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-bg-elevated rounded-lg border border-bdr-default overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-bg-hover transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-txt-secondary" />
          <span className="font-medium text-txt-primary">Rigging</span>
          {isCustom && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500">
              Custom
            </span>
          )}
          {hasChanges && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500">
              Unsaved
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-txt-tertiary" />
        ) : (
          <ChevronDown className="h-4 w-4 text-txt-tertiary" />
        )}
      </button>

      {/* Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t border-bdr-default">
              <div className="pt-3 space-y-1">
                {/* Primary measurement (spread or span) */}
                {isScull ? (
                  <RiggingField
                    label="Span"
                    value={currentDefaults?.span}
                    defaultValue={defaultRigging?.span}
                    unit="cm"
                    min={150}
                    max={170}
                    onChange={(v) => handleFieldChange('span', v)}
                  />
                ) : (
                  <RiggingField
                    label="Spread"
                    value={currentDefaults?.spread}
                    defaultValue={defaultRigging?.spread}
                    unit="cm"
                    min={80}
                    max={92}
                    onChange={(v) => handleFieldChange('spread', v)}
                  />
                )}

                <RiggingField
                  label="Catch Angle"
                  value={currentDefaults?.catchAngle}
                  defaultValue={defaultRigging?.catchAngle}
                  unit="deg"
                  min={-70}
                  max={-50}
                  onChange={(v) => handleFieldChange('catchAngle', v)}
                />

                <RiggingField
                  label="Finish Angle"
                  value={currentDefaults?.finishAngle}
                  defaultValue={defaultRigging?.finishAngle}
                  unit="deg"
                  min={25}
                  max={45}
                  onChange={(v) => handleFieldChange('finishAngle', v)}
                />

                <RiggingField
                  label="Oar Length"
                  value={currentDefaults?.oarLength}
                  defaultValue={defaultRigging?.oarLength}
                  unit="cm"
                  min={isScull ? 270 : 360}
                  max={isScull ? 300 : 380}
                  onChange={(v) => handleFieldChange('oarLength', v)}
                />

                <RiggingField
                  label="Inboard"
                  value={currentDefaults?.inboard}
                  defaultValue={defaultRigging?.inboard}
                  unit="cm"
                  min={isScull ? 85 : 110}
                  max={isScull ? 92 : 120}
                  onChange={(v) => handleFieldChange('inboard', v)}
                />

                <RiggingField
                  label="Gate Height"
                  value={currentDefaults?.gateHeight}
                  defaultValue={defaultRigging?.gateHeight}
                  unit="mm"
                  min={isScull ? 145 : 155}
                  max={isScull ? 175 : 185}
                  onChange={(v) => handleFieldChange('gateHeight', v)}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-bdr-default">
                {isCustom && (
                  <button
                    onClick={handleResetToDefaults}
                    disabled={deleteMutation.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-txt-secondary
                               hover:text-txt-primary hover:bg-bg-hover rounded transition-colors
                               disabled:opacity-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset to Defaults
                  </button>
                )}
                {hasChanges && (
                  <button
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-white
                               bg-interactive-primary hover:bg-interactive-primary-hover
                               rounded transition-colors disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {saveMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default RiggingPanel;

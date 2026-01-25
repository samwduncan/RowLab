import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Palette } from 'lucide-react';
import { SPRING_CONFIG } from '../../../utils/animations';
import type { UserPreferences } from '../../../types/settings';

/**
 * Animated toggle switch component
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

/**
 * Setting row component with label, description, and action
 */
interface SettingRowProps {
  label: string;
  description: string;
  children: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({ label, description, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-bdr-subtle last:border-0">
    <div className="flex-1">
      <div className="font-medium text-txt-primary">{label}</div>
      <div className="text-sm text-txt-secondary mt-0.5">{description}</div>
    </div>
    <div className="sm:flex-shrink-0">
      {children}
    </div>
  </div>
);

interface SectionCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: 'primary' | 'warning';
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  icon: Icon,
  accentColor = 'primary',
  children,
}) => {
  const colorClasses = {
    primary: {
      iconBg: 'bg-interactive-primary/10',
      iconBorder: 'border-interactive-primary/20',
      iconText: 'text-interactive-primary',
      glow: 'shadow-[0_0_15px_rgba(var(--color-interactive-primary-rgb),0.15)]',
    },
    warning: {
      iconBg: 'bg-status-warning/10',
      iconBorder: 'border-status-warning/20',
      iconText: 'text-status-warning',
      glow: 'shadow-[0_0_15px_rgba(var(--color-status-warning-rgb),0.15)]',
    },
  };

  const colors = colorClasses[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING_CONFIG}
      className="rounded-xl bg-surface-elevated border border-bdr-subtle overflow-hidden"
    >
      <div className="flex items-center gap-3 p-5 border-b border-bdr-subtle">
        <div className={`w-10 h-10 rounded-xl ${colors.iconBg} border ${colors.iconBorder} flex items-center justify-center ${colors.glow}`}>
          <Icon className={`w-5 h-5 ${colors.iconText}`} />
        </div>
        <h3 className="text-lg font-display font-semibold text-txt-primary tracking-[-0.02em]">
          {title}
        </h3>
      </div>
      <div className="p-5 space-y-1">
        {children}
      </div>
    </motion.div>
  );
};

interface PreferencesSectionProps {
  preferences: UserPreferences;
  onChange: (field: keyof UserPreferences, value: boolean) => void;
}

export const PreferencesSection: React.FC<PreferencesSectionProps> = ({
  preferences,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Notifications Section */}
      <SectionCard title="Notifications" icon={Bell} accentColor="warning">
        <SettingRow
          label="Email Notifications"
          description="Receive updates about your team via email"
        >
          <Toggle
            enabled={preferences.emailNotifications}
            onChange={(v) => onChange('emailNotifications', v)}
          />
        </SettingRow>

        <SettingRow
          label="Push Notifications"
          description="Get instant alerts on your device"
        >
          <Toggle
            enabled={preferences.pushNotifications}
            onChange={(v) => onChange('pushNotifications', v)}
          />
        </SettingRow>
      </SectionCard>

      {/* Appearance Section */}
      <SectionCard title="Appearance" icon={Palette} accentColor="primary">
        <SettingRow
          label="Dark Mode"
          description="Use dark theme across the app"
        >
          <Toggle
            enabled={preferences.darkMode}
            onChange={(v) => onChange('darkMode', v)}
          />
        </SettingRow>

        <SettingRow
          label="Compact View"
          description="Show more content with reduced spacing"
        >
          <Toggle
            enabled={preferences.compactView}
            onChange={(v) => onChange('compactView', v)}
          />
        </SettingRow>

        <SettingRow
          label="Auto-Save"
          description="Automatically save changes as you work"
        >
          <Toggle
            enabled={preferences.autoSave}
            onChange={(v) => onChange('autoSave', v)}
          />
        </SettingRow>
      </SectionCard>
    </div>
  );
};

export default PreferencesSection;

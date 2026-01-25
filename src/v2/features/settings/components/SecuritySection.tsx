import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Shield, ChevronRight, LogOut, Trash2 } from 'lucide-react';
import { SPRING_CONFIG } from '../../../utils/animations';

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

/**
 * Reusable input field component following V2 design patterns
 */
interface InputFieldProps {
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
}) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`
      px-4 py-3 rounded-xl
      bg-surface-elevated/50 border border-bdr-subtle
      text-txt-primary placeholder:text-txt-tertiary
      focus:outline-none focus:border-interactive-primary/40 focus:ring-2 focus:ring-interactive-primary/20
      transition-colors
      ${className}
    `}
  />
);

interface SecuritySectionProps {
  email: string;
  onEmailChange: (email: string) => void;
  onSignOut?: () => void;
  onDeleteAccount?: () => void;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({
  email,
  onEmailChange,
  onSignOut,
  onDeleteAccount,
}) => {
  return (
    <div className="space-y-6">
      {/* Email & Security Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING_CONFIG}
        className="rounded-xl bg-surface-elevated border border-bdr-subtle overflow-hidden"
      >
        <div className="flex items-center gap-3 p-5 border-b border-bdr-subtle">
          <div className="w-10 h-10 rounded-xl bg-interactive-secondary/10 border border-interactive-secondary/20 flex items-center justify-center shadow-[0_0_15px_rgba(var(--color-interactive-secondary-rgb),0.15)]">
            <Mail className="w-5 h-5 text-interactive-secondary" />
          </div>
          <h3 className="text-lg font-display font-semibold text-txt-primary tracking-[-0.02em]">
            Email & Security
          </h3>
        </div>
        <div className="p-5 space-y-1">
          <SettingRow
            label="Email Address"
            description="Used for account recovery and notifications"
          >
            <InputField
              type="email"
              value={email}
              onChange={onEmailChange}
              className="w-full sm:w-64"
            />
          </SettingRow>

          <SettingRow
            label="Change Password"
            description="Update your account password"
          >
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-elevated/50 border border-bdr-subtle text-txt-secondary hover:bg-hover hover:border-bdr-default transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary">
              <Lock className="w-4 h-4" />
              Change
              <ChevronRight className="w-4 h-4" />
            </button>
          </SettingRow>

          <SettingRow
            label="Two-Factor Authentication"
            description="Add an extra layer of security"
          >
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-elevated/50 border border-bdr-subtle text-txt-secondary hover:bg-hover hover:border-bdr-default transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary">
              <Shield className="w-4 h-4" />
              Setup
              <ChevronRight className="w-4 h-4" />
            </button>
          </SettingRow>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_CONFIG, delay: 0.1 }}
        className="rounded-xl bg-surface-elevated border border-status-error/20 overflow-hidden"
      >
        <div className="flex items-center gap-3 p-5 border-b border-status-error/10 bg-status-error/5">
          <div className="w-10 h-10 rounded-xl bg-status-error/10 border border-status-error/20 flex items-center justify-center shadow-[0_0_15px_rgba(var(--color-status-error-rgb),0.15)]">
            <LogOut className="w-5 h-5 text-status-error" />
          </div>
          <h3 className="text-lg font-display font-semibold text-txt-primary tracking-[-0.02em]">
            Danger Zone
          </h3>
        </div>
        <div className="p-5 space-y-1">
          <SettingRow
            label="Sign Out"
            description="Sign out of your account on this device"
          >
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-status-error/10 border border-status-error/20 text-status-error hover:bg-status-error/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-error"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </SettingRow>

          <SettingRow
            label="Delete Account"
            description="Permanently delete your account and all data"
          >
            <button
              onClick={onDeleteAccount}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-status-error/30 text-status-error hover:bg-status-error/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-error"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          </SettingRow>
        </div>
      </motion.div>
    </div>
  );
};

export default SecuritySection;

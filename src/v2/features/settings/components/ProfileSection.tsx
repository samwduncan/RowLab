import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Camera, Upload, Trash2 } from 'lucide-react';
import { SPRING_CONFIG } from '../../../utils/animations';
import type { UserProfile } from '../../../types/settings';

/**
 * Reusable input field component following V2 design patterns
 */
interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
}) => (
  <div className={className}>
    <label className="block text-xs font-mono font-medium text-txt-tertiary uppercase tracking-wider mb-2">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="
        w-full px-4 py-3 rounded-xl
        bg-surface-elevated/50 border border-bdr-subtle
        text-txt-primary placeholder:text-txt-tertiary
        focus:outline-none focus:border-interactive-primary/40 focus:ring-2 focus:ring-interactive-primary/20
        transition-colors
      "
    />
  </div>
);

interface ProfileSectionProps {
  profile: UserProfile;
  onChange: (field: keyof UserProfile, value: string | null) => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  profile,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Get initials for avatar fallback
   */
  const getInitials = () => {
    const first = profile.firstName?.[0] || '';
    const last = profile.lastName?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  /**
   * Handle avatar file upload
   */
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Read file as data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange('avatar', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Trigger file input click
   */
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING_CONFIG}
      className="rounded-xl bg-surface-elevated border border-bdr-subtle overflow-hidden"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 p-5 border-b border-bdr-subtle">
        <div className="w-10 h-10 rounded-xl bg-interactive-primary/10 border border-interactive-primary/20 flex items-center justify-center shadow-[0_0_15px_rgba(var(--color-interactive-primary-rgb),0.15)]">
          <User className="w-5 h-5 text-interactive-primary" />
        </div>
        <h3 className="text-lg font-display font-semibold text-txt-primary tracking-[-0.02em]">
          Profile
        </h3>
      </div>

      {/* Section Content */}
      <div className="p-5 space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-6 pb-6 border-b border-bdr-subtle">
          {/* Avatar Display */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-interactive-primary/20 border border-interactive-primary/30 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(var(--color-interactive-primary-rgb),0.15)]">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-display font-bold text-interactive-primary">
                  {getInitials()}
                </span>
              )}
            </div>
            {/* Camera overlay on hover */}
            <button
              onClick={triggerFileUpload}
              className="absolute inset-0 flex items-center justify-center bg-surface/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer"
            >
              <Camera className="w-6 h-6 text-interactive-primary" />
            </button>
          </div>

          {/* Avatar Info and Actions */}
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-txt-primary">
              {profile.firstName} {profile.lastName}
            </h4>
            <p className="text-txt-secondary">{profile.role || 'No role set'}</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={triggerFileUpload}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-elevated/50 border border-bdr-subtle text-sm text-txt-secondary hover:bg-hover hover:border-bdr-default transition-all"
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
              {profile.avatar && (
                <button
                  onClick={() => onChange('avatar', null)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-status-error/10 border border-status-error/20 text-sm text-status-error hover:bg-status-error/20 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>

        {/* Name Fields - 2 column grid on sm+ */}
        <div className="grid sm:grid-cols-2 gap-4">
          <InputField
            label="First Name"
            value={profile.firstName}
            onChange={(value) => onChange('firstName', value)}
          />
          <InputField
            label="Last Name"
            value={profile.lastName}
            onChange={(value) => onChange('lastName', value)}
          />
        </div>

        {/* Role Field */}
        <InputField
          label="Role / Title"
          value={profile.role}
          onChange={(value) => onChange('role', value)}
          placeholder="e.g., Head Coach, Assistant Coach"
        />
      </div>
    </motion.div>
  );
};

export default ProfileSection;

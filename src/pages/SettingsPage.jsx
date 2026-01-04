import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Camera,
  Mail,
  Lock,
  Bell,
  Palette,
  Shield,
  LogOut,
  Save,
  ChevronRight,
  Check,
  Upload,
  Trash2
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

// Settings section component
const SettingsSection = ({ title, icon: Icon, children }) => (
  <motion.div
    variants={fadeInUp}
    className="glass-card rounded-2xl border border-white/10 overflow-hidden"
  >
    <div className="flex items-center gap-3 p-5 border-b border-white/10">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-accent-blue" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
    <div className="p-5 space-y-4">
      {children}
    </div>
  </motion.div>
);

// Setting row component
const SettingRow = ({ label, description, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-white/5 last:border-0">
    <div className="flex-1">
      <div className="font-medium text-white">{label}</div>
      {description && (
        <div className="text-sm text-gray-400 mt-0.5">{description}</div>
      )}
    </div>
    <div className="sm:flex-shrink-0">
      {children}
    </div>
  </div>
);

// Toggle switch component
const Toggle = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative w-12 h-7 rounded-full transition-colors ${
      enabled ? 'bg-accent-blue' : 'bg-white/20'
    }`}
  >
    <span
      className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
        enabled ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

function SettingsPage() {
  // User profile state
  const [profile, setProfile] = useState({
    firstName: 'Coach',
    lastName: 'Smith',
    email: 'coach@university.edu',
    role: 'Head Coach',
    avatar: null
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: true,
    compactView: false,
    autoSave: true
  });

  // Form change tracker
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSaved(false);
  };

  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setHasChanges(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleProfileChange('avatar', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Account Settings
          </h1>
          <p className="text-gray-400">
            Manage your profile and preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
            hasChanges
              ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white hover:shadow-glow-blue'
              : saved
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-white/10 text-gray-500 cursor-not-allowed'
          }`}
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </motion.div>

      {/* Settings Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Profile Section */}
        <SettingsSection title="Profile" icon={User}>
          {/* Avatar */}
          <div className="flex items-center gap-6 pb-4 border-b border-white/5">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center overflow-hidden">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </span>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white">
                {profile.firstName} {profile.lastName}
              </h4>
              <p className="text-gray-400">{profile.role}</p>
              <div className="flex gap-2 mt-3">
                <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-sm text-gray-300 hover:bg-white/20 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
                {profile.avatar && (
                  <button
                    onClick={() => handleProfileChange('avatar', null)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 text-sm text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Name fields */}
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) => handleProfileChange('firstName', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-accent-blue outline-none text-white placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) => handleProfileChange('lastName', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-accent-blue outline-none text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role / Title
            </label>
            <input
              type="text"
              value={profile.role}
              onChange={(e) => handleProfileChange('role', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-accent-blue outline-none text-white placeholder-gray-500"
              placeholder="e.g., Head Coach, Assistant Coach"
            />
          </div>
        </SettingsSection>

        {/* Email Section */}
        <SettingsSection title="Email & Security" icon={Mail}>
          <SettingRow
            label="Email Address"
            description="Used for account recovery and notifications"
          >
            <input
              type="email"
              value={profile.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              className="w-full sm:w-64 px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 focus:border-accent-blue outline-none text-white placeholder-gray-500"
            />
          </SettingRow>

          <SettingRow
            label="Change Password"
            description="Update your account password"
          >
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-colors">
              <Lock className="w-4 h-4" />
              Change
              <ChevronRight className="w-4 h-4" />
            </button>
          </SettingRow>

          <SettingRow
            label="Two-Factor Authentication"
            description="Add an extra layer of security"
          >
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-colors">
              <Shield className="w-4 h-4" />
              Setup
              <ChevronRight className="w-4 h-4" />
            </button>
          </SettingRow>
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection title="Notifications" icon={Bell}>
          <SettingRow
            label="Email Notifications"
            description="Receive updates about your team via email"
          >
            <Toggle
              enabled={preferences.emailNotifications}
              onChange={(v) => handlePreferenceChange('emailNotifications', v)}
            />
          </SettingRow>

          <SettingRow
            label="Push Notifications"
            description="Get instant alerts on your device"
          >
            <Toggle
              enabled={preferences.pushNotifications}
              onChange={(v) => handlePreferenceChange('pushNotifications', v)}
            />
          </SettingRow>
        </SettingsSection>

        {/* Appearance Section */}
        <SettingsSection title="Appearance" icon={Palette}>
          <SettingRow
            label="Dark Mode"
            description="Use dark theme across the app"
          >
            <Toggle
              enabled={preferences.darkMode}
              onChange={(v) => handlePreferenceChange('darkMode', v)}
            />
          </SettingRow>

          <SettingRow
            label="Compact View"
            description="Show more content with reduced spacing"
          >
            <Toggle
              enabled={preferences.compactView}
              onChange={(v) => handlePreferenceChange('compactView', v)}
            />
          </SettingRow>

          <SettingRow
            label="Auto-Save"
            description="Automatically save changes as you work"
          >
            <Toggle
              enabled={preferences.autoSave}
              onChange={(v) => handlePreferenceChange('autoSave', v)}
            />
          </SettingRow>
        </SettingsSection>

        {/* Danger Zone */}
        <motion.div
          variants={fadeInUp}
          className="glass-card rounded-2xl border border-red-500/30 overflow-hidden"
        >
          <div className="flex items-center gap-3 p-5 border-b border-red-500/20 bg-red-500/5">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Danger Zone</h3>
          </div>
          <div className="p-5">
            <SettingRow
              label="Sign Out"
              description="Sign out of your account on this device"
            >
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </SettingRow>

            <SettingRow
              label="Delete Account"
              description="Permanently delete your account and all data"
            >
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors">
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </SettingRow>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SettingsPage;

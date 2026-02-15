/**
 * Account settings section -- placeholder for Task 2.
 * Will be replaced with full email/password/danger-zone implementation.
 */
import { Settings } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';

export function AccountSection() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Account"
        description="Manage your account credentials and data"
        icon={<Settings className="w-4 h-4" />}
      />
      <p className="text-sm text-ink-secondary">Loading account settings...</p>
    </div>
  );
}

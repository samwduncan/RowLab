/**
 * Notifications settings section -- placeholder for Task 2.
 * Will be replaced with full toggle switch implementation.
 */
import { Bell } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';

export function NotificationsSection() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Notifications"
        description="Control how and when RowLab contacts you"
        icon={<Bell className="w-4 h-4" />}
      />
      <p className="text-sm text-ink-secondary">Loading notification preferences...</p>
    </div>
  );
}

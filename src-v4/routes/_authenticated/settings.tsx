/**
 * /settings route -- user settings page with integrations management.
 */
import { createFileRoute } from '@tanstack/react-router';
import { IntegrationsSection } from '@/features/integrations';

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsPage,
  staticData: {
    breadcrumb: 'Settings',
  },
});

function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-ink-primary mb-8">Settings</h1>
      <IntegrationsSection />
    </div>
  );
}

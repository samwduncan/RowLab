import { DashboardGrid } from '../components/dashboard/DashboardGrid';

/**
 * MeDashboard - Personal dashboard page at /beta/me
 *
 * Displays adaptive headline, activity feed, and
 * integration widgets in a bento grid layout.
 */
export function MeDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <DashboardGrid />
    </div>
  );
}

export default MeDashboard;

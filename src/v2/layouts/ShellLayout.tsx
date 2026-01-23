import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { ContextRail } from '@v2/components/shell/ContextRail';
import { WorkspaceSidebar } from '@v2/components/shell/WorkspaceSidebar';
import { useContextStore } from '@v2/stores/contextStore';

/**
 * ShellLayout Component
 *
 * Main application shell that composes:
 * - ContextRail (64px vertical rail for Me/Coach/Admin switching)
 * - WorkspaceSidebar (256px context-aware navigation)
 * - Content area (main page content via Outlet)
 *
 * Features:
 * - CSS Grid layout for responsive shell structure
 * - Keyboard shortcuts: Ctrl+1 (Me), Ctrl+2 (Coach), Ctrl+3 (Admin)
 * - Focus management: moves focus to first sidebar item on context switch
 * - Accessibility: screen reader announcements for context changes
 *
 * Layout structure:
 * ┌────────┬──────────────────────────────────────┐
 * │        │                                      │
 * │  Rail  │           Content                    │
 * │  64px  │           (flex-1)                   │
 * │        │                                      │
 * │        ├──────────────┬───────────────────────┤
 * │        │   Sidebar    │       Main            │
 * │        │   256px      │       (flex-1)        │
 * │        │              │                       │
 * └────────┴──────────────┴───────────────────────┘
 */
export function ShellLayout() {
  const { activeContext, setActiveContext } = useContextStore();

  // Keyboard shortcuts for context switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl (Windows/Linux) or Cmd (Mac)
      if (!(e.ctrlKey || e.metaKey)) return;

      // Map number keys to contexts
      const keyMap: Record<string, 'me' | 'coach' | 'admin'> = {
        '1': 'me',
        '2': 'coach',
        '3': 'admin',
      };

      const context = keyMap[e.key];
      if (context) {
        e.preventDefault();
        setActiveContext(context);

        // Move focus to first sidebar nav item after React renders
        // Use 0ms timeout to wait for React to update the DOM
        setTimeout(() => {
          const firstNavItem = document.querySelector('.workspace-sidebar a') as HTMLElement;
          firstNavItem?.focus();
        }, 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveContext]);

  // Context change announcements for screen readers
  const contextLabels: Record<typeof activeContext, string> = {
    me: 'Me',
    coach: 'Coach',
    admin: 'Admin',
  };

  return (
    <div className="v2 h-screen grid grid-cols-[auto_1fr]">
      {/* Screen reader live region for context announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        Switched to {contextLabels[activeContext]} workspace
      </div>

      {/* Left rail - always 64px */}
      <aside className="w-16 h-full">
        <ContextRail />
      </aside>

      {/* Sidebar + Content nested grid */}
      <div className="grid grid-cols-[auto_1fr] h-full">
        {/* Sidebar - 256px with overflow */}
        <aside className="w-64 h-full overflow-y-auto">
          <WorkspaceSidebar />
        </aside>

        {/* Main content area */}
        <main className="h-full overflow-y-auto p-6 bg-bg-surface">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ShellLayout;

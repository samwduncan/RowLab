import { Menu } from 'lucide-react';
import { SearchTriggerButton } from '../../features/search/components/CommandPalette';
import { useContextStore } from '@v2/stores/contextStore';

interface HeaderProps {
  onMenuClick: () => void;
}

/**
 * Header Component
 *
 * Global header for mobile layout with:
 * - Menu toggle button
 * - Active context indicator
 * - Global search button with keyboard shortcut display
 */
export function Header({ onMenuClick }: HeaderProps) {
  const { activeContext } = useContextStore();

  return (
    <header className="flex-shrink-0 h-14 flex items-center justify-between px-4 bg-bg-surface border-b border-bdr-default">
      <button
        onClick={onMenuClick}
        className="p-2 -ml-2 rounded-lg hover:bg-bg-hover transition-colors"
        aria-label="Open menu"
      >
        <Menu size={24} className="text-txt-primary" />
      </button>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-txt-secondary capitalize">
          {activeContext}
        </span>

        <SearchTriggerButton />
      </div>
    </header>
  );
}

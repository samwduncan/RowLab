/**
 * Top bar: team switcher + breadcrumbs on left, action buttons on right.
 * Height: h-14 (--spacing-topbar).
 * On mobile: hides breadcrumbs (bottom tabs handle navigation), shows only actions.
 *
 * Renders the CommandPalette (Cmd+K search) and NotificationBell with dropdown panel.
 */
import { Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { Breadcrumbs } from './Breadcrumbs';
import { TeamSwitcher } from './TeamSwitcher';
import { UserMenu } from './UserMenu';
import { NotificationBell } from './NotificationBell';
import { CommandPalette } from '@/components/search/CommandPalette';
import { useCallback, useEffect } from 'react';

export function TopBar() {
  const isMobile = useIsMobile();

  const openSearch = useCallback(() => {
    window.dispatchEvent(new CustomEvent('rowlab:open-search'));
  }, []);

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openSearch]);

  return (
    <>
      <header className="flex h-14 shrink-0 items-center border-b border-ink-border/50 px-4">
        {/* Left: team switcher + breadcrumbs */}
        <div className="flex flex-1 items-center gap-3 min-w-0">
          <TeamSwitcher />
          {!isMobile && (
            <>
              <div className="h-4 w-px bg-ink-border/50" />
              <Breadcrumbs />
            </>
          )}
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-1">
          {/* Search trigger */}
          <button
            type="button"
            onClick={openSearch}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-ink-muted transition-colors hover:bg-ink-hover hover:text-ink-primary"
            aria-label="Search"
          >
            <Search size={16} />
            {!isMobile && (
              <>
                <span className="text-ink-tertiary">Search...</span>
                <kbd className="hidden rounded bg-ink-raised px-1.5 py-0.5 text-[10px] font-medium text-ink-muted lg:inline-block">
                  {typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent)
                    ? '\u2318'
                    : 'Ctrl'}
                  K
                </kbd>
              </>
            )}
          </button>

          {/* Notification bell with dropdown panel */}
          <NotificationBell />

          {/* User menu */}
          <UserMenu />
        </div>
      </header>

      {/* Command palette (rendered as portal-like overlay, z-50) */}
      <CommandPalette />
    </>
  );
}

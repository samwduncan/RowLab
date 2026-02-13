/**
 * SearchResults: categorized result sections for the command palette.
 * Renders Pages, Commands, and Athletes sections with section headers.
 * Uses cmdk's Command.Group for grouping and Command.Item for items.
 */
import { Command } from 'cmdk';
import type { SearchEntry } from './searchRegistry';
import { Skeleton } from '@/components/ui/Skeleton';
import { User } from 'lucide-react';

interface Athlete {
  id: string;
  name: string;
  email?: string;
}

interface SearchResultsProps {
  pages: SearchEntry[];
  commands: SearchEntry[];
  athletes: Athlete[];
  athletesLoading: boolean;
  athleteQuery: string;
  onSelectPage: (path: string) => void;
  onSelectCommand: (entry: SearchEntry) => void;
  onSelectAthlete: (athlete: Athlete) => void;
}

export function SearchResults({
  pages,
  commands,
  athletes,
  athletesLoading,
  athleteQuery,
  onSelectPage,
  onSelectCommand,
  onSelectAthlete,
}: SearchResultsProps) {
  const showAthletes = athleteQuery.length >= 2;

  return (
    <>
      {/* Pages */}
      {pages.length > 0 && (
        <Command.Group heading="Pages" className="search-group">
          {pages.map((entry) => (
            <Command.Item
              key={entry.id}
              value={`page-${entry.id} ${entry.label} ${entry.keywords.join(' ')}`}
              onSelect={() => entry.path && onSelectPage(entry.path)}
              className="search-item"
            >
              <entry.icon size={16} className="shrink-0 text-ink-muted" />
              <div className="min-w-0 flex-1">
                <span className="text-ink-primary">{entry.label}</span>
                {entry.description && (
                  <span className="ml-2 text-xs text-ink-tertiary">{entry.description}</span>
                )}
              </div>
            </Command.Item>
          ))}
        </Command.Group>
      )}

      {/* Commands */}
      {commands.length > 0 && (
        <Command.Group heading="Commands" className="search-group">
          {commands.map((entry) => (
            <Command.Item
              key={entry.id}
              value={`cmd-${entry.id} ${entry.label} ${entry.keywords.join(' ')}`}
              onSelect={() => onSelectCommand(entry)}
              className="search-item"
            >
              <entry.icon size={16} className="shrink-0 text-accent-copper" />
              <div className="min-w-0 flex-1">
                <span className="text-ink-primary">{entry.label}</span>
                {entry.description && (
                  <span className="ml-2 text-xs text-ink-tertiary">{entry.description}</span>
                )}
              </div>
            </Command.Item>
          ))}
        </Command.Group>
      )}

      {/* Athletes (only when query >= 2 chars) */}
      {showAthletes && (
        <Command.Group heading="Athletes" className="search-group">
          {athletesLoading ? (
            <div className="px-3 py-2 space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton width="24px" height="24px" rounded="full" />
                <Skeleton width="60%" height="14px" rounded="sm" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton width="24px" height="24px" rounded="full" />
                <Skeleton width="45%" height="14px" rounded="sm" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton width="24px" height="24px" rounded="full" />
                <Skeleton width="55%" height="14px" rounded="sm" />
              </div>
            </div>
          ) : athletes.length > 0 ? (
            athletes.map((athlete) => (
              <Command.Item
                key={athlete.id}
                value={`athlete-${athlete.id} ${athlete.name} ${athlete.email ?? ''}`}
                onSelect={() => onSelectAthlete(athlete)}
                className="search-item"
              >
                <User size={16} className="shrink-0 text-ink-muted" />
                <div className="min-w-0 flex-1">
                  <span className="text-ink-primary">{athlete.name}</span>
                  {athlete.email && (
                    <span className="ml-2 text-xs text-ink-tertiary">{athlete.email}</span>
                  )}
                </div>
              </Command.Item>
            ))
          ) : (
            <div className="px-3 py-4 text-center text-sm text-ink-muted">No athletes found</div>
          )}
        </Command.Group>
      )}
    </>
  );
}

/* === EMPTY STATE: Recents + Suggestions === */

interface EmptyStateProps {
  recents: { label: string; path: string }[];
  onSelectRecent: (path: string) => void;
  onSelectSuggestion: (path: string) => void;
}

export function SearchEmptyState({ recents, onSelectRecent, onSelectSuggestion }: EmptyStateProps) {
  return (
    <>
      {recents.length > 0 && (
        <Command.Group heading="Recent" className="search-group">
          {recents.map((item) => (
            <Command.Item
              key={item.path}
              value={`recent-${item.path} ${item.label}`}
              onSelect={() => onSelectRecent(item.path)}
              className="search-item"
            >
              <span className="text-ink-primary">{item.label}</span>
            </Command.Item>
          ))}
        </Command.Group>
      )}

      <Command.Group heading="Suggestions" className="search-group">
        <Command.Item
          value="suggestion-log-workout"
          onSelect={() => onSelectSuggestion('/workouts/new')}
          className="search-item"
        >
          <span className="text-ink-primary">Log workout</span>
        </Command.Item>
        <Command.Item
          value="suggestion-view-stats"
          onSelect={() => onSelectSuggestion('/stats')}
          className="search-item"
        >
          <span className="text-ink-primary">View stats</span>
        </Command.Item>
        <Command.Item
          value="suggestion-settings"
          onSelect={() => onSelectSuggestion('/settings')}
          className="search-item"
        >
          <span className="text-ink-primary">Go to settings</span>
        </Command.Item>
      </Command.Group>
    </>
  );
}

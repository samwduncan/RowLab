import { Command } from 'cmdk';
import { Clock, Calendar, Barbell, Users } from '@phosphor-icons/react';
import { useCommandActions } from '../hooks/useCommandActions';
import { useRecentCommands } from '../hooks/useRecentCommands';

interface SuggestionsGroupProps {
  onClose: () => void;
}

/**
 * Get context-aware suggestions based on time of day
 */
function getContextSuggestions(): string[] {
  const hour = new Date().getHours();

  // Morning (5am-11am): Practice session, attendance
  if (hour >= 5 && hour < 11) {
    return ['start_practice', 'log_attendance', 'view_roster'];
  }

  // Afternoon (11am-5pm): Erg tests, performance tracking
  if (hour >= 11 && hour < 17) {
    return ['log_erg_test', 'create_workout', 'view_achievements'];
  }

  // Evening (5pm-10pm): Review, planning
  if (hour >= 17 && hour < 22) {
    return ['go_lineup_builder', 'create_challenge', 'view_roster'];
  }

  // Default: General actions
  return ['go_dashboard', 'view_roster', 'start_practice'];
}

/**
 * Suggestions group for command palette
 * Shows context-aware suggestions and recent commands when query is empty
 */
export function SuggestionsGroup({ onClose }: SuggestionsGroupProps) {
  const actions = useCommandActions();
  const { recentCommands, addCommand, clearCommands } = useRecentCommands();

  const suggestionIds = getContextSuggestions();
  const suggestions = actions.filter((a) => suggestionIds.includes(a.id));

  return (
    <>
      {/* Recent Commands */}
      {recentCommands.length > 0 && (
        <Command.Group
          heading={
            <div className="flex items-center justify-between">
              <span>Recent</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearCommands();
                }}
                className="text-xs text-txt-tertiary hover:text-txt-secondary transition-colors"
              >
                Clear
              </button>
            </div>
          }
        >
          {recentCommands.map((recent) => {
            const action = actions.find((a) => a.id === recent.id);
            if (!action) return null;

            const Icon = action.icon;

            return (
              <Command.Item
                key={`recent-${recent.id}`}
                value={action.label}
                keywords={action.keywords}
                onSelect={() => {
                  action.onSelect();
                  onClose();
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
                           data-[selected=true]:bg-surface-hover
                           hover:bg-surface-hover transition-colors"
              >
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-lg bg-surface-primary
                                flex items-center justify-center"
                >
                  <Clock size={16} weight="duotone" className="text-txt-tertiary" />
                </div>
                <p className="flex-1 text-sm font-medium text-txt-primary">{action.label}</p>
                {action.shortcut && (
                  <kbd className="px-2 py-1 rounded bg-surface-primary text-txt-tertiary text-xs font-mono">
                    {action.shortcut}
                  </kbd>
                )}
              </Command.Item>
            );
          })}
        </Command.Group>
      )}

      {/* Context-Aware Suggestions */}
      <Command.Group heading="Suggested">
        {suggestions.map((action) => {
          const Icon = action.icon;

          return (
            <Command.Item
              key={`suggestion-${action.id}`}
              value={action.label}
              keywords={action.keywords}
              onSelect={() => {
                addCommand({ id: action.id, label: action.label });
                action.onSelect();
                onClose();
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
                         data-[selected=true]:bg-surface-hover
                         hover:bg-surface-hover transition-colors"
            >
              <div
                className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent-primary/10
                              flex items-center justify-center"
              >
                <Icon size={18} weight="duotone" className="text-accent-primary" />
              </div>
              <p className="flex-1 text-sm font-medium text-txt-primary">{action.label}</p>
              {action.shortcut && (
                <kbd className="px-2 py-1 rounded bg-surface-primary text-txt-tertiary text-xs font-mono">
                  {action.shortcut}
                </kbd>
              )}
            </Command.Item>
          );
        })}
      </Command.Group>
    </>
  );
}

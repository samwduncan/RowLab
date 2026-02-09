import { Command } from 'cmdk';
import { useCommandActions } from '../hooks/useCommandActions';
import { useRecentCommands } from '../hooks/useRecentCommands';

interface ActionsGroupProps {
  onClose: () => void;
}

/**
 * Command palette actions group
 * Shows all available actions with keyboard shortcuts
 */
export function ActionsGroup({ onClose }: ActionsGroupProps) {
  const actions = useCommandActions();
  const { addCommand } = useRecentCommands();

  return (
    <Command.Group heading="Actions">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <Command.Item
            key={action.id}
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
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent-secondary/10
                            flex items-center justify-center"
            >
              <Icon size={18} weight="duotone" className="text-accent-secondary" />
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
  );
}

import { Tab } from '@headlessui/react';

// ---- Types ----

export interface TeamTabsProps {
  teams: Array<{ id: string; name: string }>;
  activeTeamId: string;
  onTeamChange: (teamId: string) => void;
}

// ---- Component ----

/**
 * Tab interface for athletes who belong to multiple teams.
 * Single-team athletes: returns null (no tabs rendered).
 * Uses Headless UI Tab.Group for accessible keyboard navigation.
 */
export function TeamTabs({ teams, activeTeamId, onTeamChange }: TeamTabsProps) {
  // Single-team athletes don't need tabs
  if (teams.length <= 1) return null;

  const selectedIndex = teams.findIndex((t) => t.id === activeTeamId);
  const safeIndex = selectedIndex >= 0 ? selectedIndex : 0;

  return (
    <Tab.Group
      selectedIndex={safeIndex}
      onChange={(index) => {
        const team = teams[index];
        if (team) {
          onTeamChange(team.id);
        }
      }}
    >
      <Tab.List className="flex gap-1 bg-bg-surface/60 backdrop-blur-sm border border-bdr-subtle p-1 rounded-lg">
        {teams.map((team) => (
          <Tab
            key={team.id}
            className={({ selected }) => `
              flex-1 px-3 py-1.5 text-sm font-medium rounded-md
              transition-colors outline-none
              ${
                selected
                  ? 'bg-bg-elevated text-txt-primary shadow-sm'
                  : 'text-txt-secondary hover:text-txt-primary hover:bg-bg-hover'
              }
            `}
          >
            {team.name}
          </Tab>
        ))}
      </Tab.List>
    </Tab.Group>
  );
}

export default TeamTabs;

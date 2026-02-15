/**
 * Pill-style tab toggle with animated sliding indicator.
 * Uses motion layoutId for smooth transitions between tabs.
 */

import type { ReactNode } from 'react';
import { motion } from 'motion/react';

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabToggleProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  layoutId?: string;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'text-xs h-8 px-3',
  md: 'text-sm h-9 px-4',
} as const;

export function TabToggle({
  tabs,
  activeTab,
  onTabChange,
  layoutId = 'tab-indicator',
  size = 'md',
  fullWidth = false,
  className = '',
}: TabToggleProps) {
  return (
    <div
      className={`${fullWidth ? 'flex' : 'inline-flex'} items-center gap-1 p-1 rounded-xl bg-ink-well/60 ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex items-center justify-center gap-1.5
              ${sizeStyles[size]}
              ${fullWidth ? 'flex-1' : ''}
              rounded-lg font-medium cursor-pointer
              transition-colors duration-150
              ${isActive ? 'text-ink-primary' : 'text-ink-muted hover:text-ink-secondary'}
            `.trim()}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 glass shadow-card rounded-lg"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

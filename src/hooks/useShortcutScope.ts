import { useEffect, useCallback, useRef, useState } from 'react';

// ============================================
// Shortcut Scope Hook
// Manages page-specific keyboard shortcuts with focus awareness
// ============================================

type ShortcutScope = 'global' | 'lineup' | 'athletes' | 'erg' | 'analytics' | 'boat-view';

interface ScopedShortcut {
  key: string;
  modifiers?: ('ctrl' | 'meta' | 'shift' | 'alt')[];
  action: () => void;
  description: string;
  when?: () => boolean; // Conditional activation
}

interface UseShortcutScopeOptions {
  scope: ShortcutScope;
  shortcuts: ScopedShortcut[];
  enabled?: boolean;
}

// Store active scopes globally for debugging
const activeScopes = new Set<ShortcutScope>();

export function useShortcutScope({ scope, shortcuts, enabled = true }: UseShortcutScopeOptions) {
  const [isActive, setIsActive] = useState(false);
  const shortcutsRef = useRef(shortcuts);

  // Update shortcuts ref when they change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  // Register/unregister scope
  useEffect(() => {
    if (enabled) {
      activeScopes.add(scope);
      setIsActive(true);
    }

    return () => {
      activeScopes.delete(scope);
      setIsActive(false);
    };
  }, [scope, enabled]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const target = event.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' ||
                   target.tagName === 'TEXTAREA' ||
                   target.isContentEditable;

    // Allow escape always
    if (isInput && event.key !== 'Escape') return;

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    for (const shortcut of shortcutsRef.current) {
      // Check conditional
      if (shortcut.when && !shortcut.when()) continue;

      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      if (!keyMatches) continue;

      const modifiers = shortcut.modifiers || [];
      const needsCtrl = modifiers.includes('ctrl');
      const needsMeta = modifiers.includes('meta');
      const needsShift = modifiers.includes('shift');
      const needsAlt = modifiers.includes('alt');

      // Handle cmd/ctrl cross-platform
      const cmdKey = isMac ? event.metaKey : event.ctrlKey;
      const hasCorrectCmd = (needsCtrl || needsMeta) ? cmdKey : (!event.ctrlKey && !event.metaKey);

      const hasCorrectShift = needsShift ? event.shiftKey : !event.shiftKey;
      const hasCorrectAlt = needsAlt ? event.altKey : !event.altKey;

      if (hasCorrectCmd && hasCorrectShift && hasCorrectAlt) {
        event.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  return {
    isActive,
    scope,
    activeScopes: Array.from(activeScopes),
  };
}

// Hook for lineup builder specific shortcuts
export function useLineupShortcuts(callbacks: {
  onAddBoat?: () => void;
  onDelete?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  onSearch?: () => void;
  onEscape?: () => void;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
  onNavigateLeft?: () => void;
  onNavigateRight?: () => void;
  onSelect?: () => void;
}) {
  const shortcuts: ScopedShortcut[] = [];

  if (callbacks.onAddBoat) {
    shortcuts.push({
      key: 'n',
      action: callbacks.onAddBoat,
      description: 'Add new boat',
    });
  }

  if (callbacks.onDelete) {
    shortcuts.push({
      key: 'Delete',
      action: callbacks.onDelete,
      description: 'Remove selected',
    });
    shortcuts.push({
      key: 'Backspace',
      action: callbacks.onDelete,
      description: 'Remove selected',
    });
  }

  if (callbacks.onUndo) {
    shortcuts.push({
      key: 'z',
      modifiers: ['ctrl'],
      action: callbacks.onUndo,
      description: 'Undo',
    });
  }

  if (callbacks.onRedo) {
    shortcuts.push({
      key: 'z',
      modifiers: ['ctrl', 'shift'],
      action: callbacks.onRedo,
      description: 'Redo',
    });
    shortcuts.push({
      key: 'y',
      modifiers: ['ctrl'],
      action: callbacks.onRedo,
      description: 'Redo',
    });
  }

  if (callbacks.onSave) {
    shortcuts.push({
      key: 's',
      modifiers: ['ctrl'],
      action: callbacks.onSave,
      description: 'Save lineup',
    });
  }

  if (callbacks.onExport) {
    shortcuts.push({
      key: 'p',
      modifiers: ['ctrl'],
      action: callbacks.onExport,
      description: 'Export to PDF',
    });
  }

  if (callbacks.onSearch) {
    shortcuts.push({
      key: '/',
      action: callbacks.onSearch,
      description: 'Search athletes',
    });
  }

  if (callbacks.onEscape) {
    shortcuts.push({
      key: 'Escape',
      action: callbacks.onEscape,
      description: 'Clear selection',
    });
  }

  // Arrow navigation
  if (callbacks.onNavigateUp) {
    shortcuts.push({
      key: 'ArrowUp',
      action: callbacks.onNavigateUp,
      description: 'Navigate up',
    });
    shortcuts.push({
      key: 'k',
      action: callbacks.onNavigateUp,
      description: 'Navigate up (vim)',
    });
  }

  if (callbacks.onNavigateDown) {
    shortcuts.push({
      key: 'ArrowDown',
      action: callbacks.onNavigateDown,
      description: 'Navigate down',
    });
    shortcuts.push({
      key: 'j',
      action: callbacks.onNavigateDown,
      description: 'Navigate down (vim)',
    });
  }

  if (callbacks.onNavigateLeft) {
    shortcuts.push({
      key: 'ArrowLeft',
      action: callbacks.onNavigateLeft,
      description: 'Navigate left',
    });
    shortcuts.push({
      key: 'h',
      action: callbacks.onNavigateLeft,
      description: 'Navigate left (vim)',
    });
  }

  if (callbacks.onNavigateRight) {
    shortcuts.push({
      key: 'ArrowRight',
      action: callbacks.onNavigateRight,
      description: 'Navigate right',
    });
    shortcuts.push({
      key: 'l',
      action: callbacks.onNavigateRight,
      description: 'Navigate right (vim)',
    });
  }

  if (callbacks.onSelect) {
    shortcuts.push({
      key: 'Enter',
      action: callbacks.onSelect,
      description: 'Select/assign',
    });
    shortcuts.push({
      key: ' ',
      action: callbacks.onSelect,
      description: 'Select/assign',
    });
  }

  return useShortcutScope({
    scope: 'lineup',
    shortcuts,
  });
}

// Hook for athletes page shortcuts
export function useAthletesShortcuts(callbacks: {
  onEdit?: () => void;
  onFilter?: () => void;
  onSearch?: () => void;
  onEscape?: () => void;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
  onSelect?: () => void;
}) {
  const shortcuts: ScopedShortcut[] = [];

  if (callbacks.onEdit) {
    shortcuts.push({
      key: 'e',
      action: callbacks.onEdit,
      description: 'Edit athlete',
    });
  }

  if (callbacks.onFilter) {
    shortcuts.push({
      key: 'f',
      action: callbacks.onFilter,
      description: 'Toggle filters',
    });
  }

  if (callbacks.onSearch) {
    shortcuts.push({
      key: '/',
      action: callbacks.onSearch,
      description: 'Search athletes',
    });
  }

  if (callbacks.onEscape) {
    shortcuts.push({
      key: 'Escape',
      action: callbacks.onEscape,
      description: 'Clear selection',
    });
  }

  if (callbacks.onNavigateUp) {
    shortcuts.push({
      key: 'ArrowUp',
      action: callbacks.onNavigateUp,
      description: 'Navigate up',
    });
    shortcuts.push({
      key: 'k',
      action: callbacks.onNavigateUp,
      description: 'Navigate up (vim)',
    });
  }

  if (callbacks.onNavigateDown) {
    shortcuts.push({
      key: 'ArrowDown',
      action: callbacks.onNavigateDown,
      description: 'Navigate down',
    });
    shortcuts.push({
      key: 'j',
      action: callbacks.onNavigateDown,
      description: 'Navigate down (vim)',
    });
  }

  if (callbacks.onSelect) {
    shortcuts.push({
      key: 'Enter',
      action: callbacks.onSelect,
      description: 'Open athlete details',
    });
  }

  return useShortcutScope({
    scope: 'athletes',
    shortcuts,
  });
}

export default useShortcutScope;

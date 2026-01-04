import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useSettingsStore from '../store/settingsStore';

// ============================================
// Global Keyboard Shortcuts Hook
// Handles vim-like navigation (G+key) and global shortcuts
// ============================================

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description?: string;
  scope?: 'global' | 'lineup' | 'athletes' | 'erg' | 'analytics';
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  scope?: string;
}

// Sequence timeout for multi-key shortcuts (like G+D)
const SEQUENCE_TIMEOUT = 2000;

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { enabled = true, scope = 'global' } = options;
  const navigate = useNavigate();
  const {
    setCommandPaletteOpen,
    toggleSidebar,
    commandPaletteOpen
  } = useSettingsStore();

  // Track key sequence for vim-like shortcuts
  const keySequence = useRef<string[]>([]);
  const sequenceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Clear sequence after timeout
  const clearSequence = useCallback(() => {
    keySequence.current = [];
    if (sequenceTimeout.current) {
      clearTimeout(sequenceTimeout.current);
      sequenceTimeout.current = null;
    }
  }, []);

  // Add key to sequence
  const addToSequence = useCallback((key: string) => {
    keySequence.current.push(key.toLowerCase());

    // Clear any existing timeout
    if (sequenceTimeout.current) {
      clearTimeout(sequenceTimeout.current);
    }

    // Set new timeout to clear sequence
    sequenceTimeout.current = setTimeout(clearSequence, SEQUENCE_TIMEOUT);

    return keySequence.current.join('');
  }, [clearSequence]);

  // Check if sequence matches
  const matchesSequence = useCallback((targetSequence: string): boolean => {
    const currentSequence = keySequence.current.join('');
    return currentSequence === targetSequence.toLowerCase();
  }, []);

  // Define all shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't handle shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' ||
                   target.tagName === 'TEXTAREA' ||
                   target.isContentEditable;

    // Allow Escape always
    if (event.key === 'Escape') {
      if (commandPaletteOpen) {
        setCommandPaletteOpen(false);
        event.preventDefault();
        return;
      }
    }

    // Don't process other shortcuts when in input
    if (isInput && event.key !== 'Escape') {
      clearSequence();
      return;
    }

    // Global shortcuts with modifiers
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdKey = isMac ? event.metaKey : event.ctrlKey;

    // Cmd/Ctrl + K: Open command palette
    if (cmdKey && event.key === 'k') {
      event.preventDefault();
      setCommandPaletteOpen(!commandPaletteOpen);
      clearSequence();
      return;
    }

    // Cmd/Ctrl + B: Toggle sidebar
    if (cmdKey && event.key === 'b') {
      event.preventDefault();
      toggleSidebar();
      clearSequence();
      return;
    }

    // Don't process vim-style shortcuts when command palette is open
    if (commandPaletteOpen) {
      return;
    }

    // Vim-style navigation shortcuts (G + key)
    // Only process single letter keys for sequences
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const sequence = addToSequence(event.key);

      // G + D: Go to Dashboard
      if (matchesSequence('gd')) {
        event.preventDefault();
        navigate('/app');
        clearSequence();
        return;
      }

      // G + L: Go to Lineup Builder
      if (matchesSequence('gl')) {
        event.preventDefault();
        navigate('/app/lineup');
        clearSequence();
        return;
      }

      // G + A: Go to Athletes
      if (matchesSequence('ga')) {
        event.preventDefault();
        navigate('/app/athletes');
        clearSequence();
        return;
      }

      // G + E: Go to Erg Data
      if (matchesSequence('ge')) {
        event.preventDefault();
        navigate('/app/erg');
        clearSequence();
        return;
      }

      // G + N: Go to Analytics
      if (matchesSequence('gn')) {
        event.preventDefault();
        navigate('/app/analytics');
        clearSequence();
        return;
      }

      // G + B: Go to Boat View
      if (matchesSequence('gb')) {
        event.preventDefault();
        navigate('/app/boat-view');
        clearSequence();
        return;
      }

      // G + H: Go to Home (Landing)
      if (matchesSequence('gh')) {
        event.preventDefault();
        navigate('/');
        clearSequence();
        return;
      }
    }
  }, [
    navigate,
    setCommandPaletteOpen,
    toggleSidebar,
    commandPaletteOpen,
    addToSequence,
    matchesSequence,
    clearSequence
  ]);

  // Store handler in a ref to avoid re-registering on every render
  const handlerRef = useRef(handleKeyDown);
  handlerRef.current = handleKeyDown;

  useEffect(() => {
    if (!enabled) return;

    const stableHandler = (e: KeyboardEvent) => handlerRef.current(e);
    window.addEventListener('keydown', stableHandler);
    return () => {
      window.removeEventListener('keydown', stableHandler);
    };
  }, [enabled]); // Only re-register when enabled changes

  return {
    clearSequence,
  };
}

// Hook for registering custom shortcuts in specific pages
export function useShortcut(
  shortcut: string | string[],
  callback: () => void,
  deps: React.DependencyList = []
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...deps]);

  useEffect(() => {
    const shortcuts = Array.isArray(shortcut) ? shortcut : [shortcut];

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' ||
                     target.tagName === 'TEXTAREA' ||
                     target.isContentEditable;

      if (isInput) return;

      for (const sc of shortcuts) {
        const parts = sc.toLowerCase().split('+');
        const key = parts[parts.length - 1];
        const needsCtrl = parts.includes('ctrl');
        const needsMeta = parts.includes('meta') || parts.includes('cmd');
        const needsShift = parts.includes('shift');
        const needsAlt = parts.includes('alt');

        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const cmdPressed = isMac ? event.metaKey : event.ctrlKey;

        const keyMatches = event.key.toLowerCase() === key;
        const ctrlMatches = needsCtrl ? event.ctrlKey : !needsCtrl;
        const metaMatches = (needsMeta || needsCtrl) ? cmdPressed : true;
        const shiftMatches = needsShift ? event.shiftKey : !event.shiftKey;
        const altMatches = needsAlt ? event.altKey : !event.altKey;

        if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
          event.preventDefault();
          callbackRef.current();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcut]);
}

export default useKeyboardShortcuts;

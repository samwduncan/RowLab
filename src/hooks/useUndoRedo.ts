/**
 * useUndoRedo Hook
 *
 * Provides keyboard shortcut support for undo/redo operations.
 * Listens for Cmd/Ctrl+Z (undo) and Cmd/Ctrl+Shift+Z (redo).
 */

import { useEffect, useCallback } from 'react';
import useLineupStore from '@/store/lineupStore';

interface UndoRedoState {
  canUndo: boolean;
  canRedo: boolean;
  undoCount: number;
  redoCount: number;
  undo: () => boolean;
  redo: () => boolean;
}

export function useUndoRedo(): UndoRedoState {
  const undo = useLineupStore((state) => state.undo);
  const redo = useLineupStore((state) => state.redo);
  const history = useLineupStore((state) => state._history);

  // Keyboard shortcut handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check for Cmd (Mac) or Ctrl (Windows/Linux)
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? event.metaKey : event.ctrlKey;

      if (!modifier) return;

      // Don't intercept if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (event.key === 'z' || event.key === 'Z') {
        if (event.shiftKey) {
          // Redo: Cmd/Ctrl+Shift+Z
          event.preventDefault();
          redo();
        } else {
          // Undo: Cmd/Ctrl+Z
          event.preventDefault();
          undo();
        }
      }

      // Also support Cmd/Ctrl+Y for redo (Windows convention)
      if (event.key === 'y' || event.key === 'Y') {
        event.preventDefault();
        redo();
      }
    },
    [undo, redo]
  );

  // Set up keyboard listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    canUndo: history?.canUndo ?? false,
    canRedo: history?.canRedo ?? false,
    undoCount: history?.undoCount ?? 0,
    redoCount: history?.redoCount ?? 0,
    undo,
    redo,
  };
}

export default useUndoRedo;

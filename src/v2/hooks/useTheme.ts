import { useState, useEffect } from 'react';

/**
 * Theme options
 * - dark: Standard dark theme (default)
 * - light: Light theme
 * - field: High-contrast theme for outdoor visibility
 */
export type Theme = 'dark' | 'light' | 'field';

const THEME_STORAGE_KEY = 'v2-theme';

/**
 * Get system color scheme preference
 */
function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

/**
 * Get initial theme from localStorage or system preference
 */
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';

  // 1. Check localStorage first (user override)
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved && (saved === 'dark' || saved === 'light' || saved === 'field')) {
    return saved as Theme;
  }

  // 2. Fall back to system preference
  return getSystemTheme();
}

/**
 * Theme management hook
 *
 * Features:
 * - Respects system preference when no manual override exists
 * - Persists manual theme changes to localStorage
 * - Listens for system preference changes
 * - Only updates theme on system change if no manual override exists
 *
 * @returns {object} Theme state and controls
 * @returns {Theme} theme - Current active theme
 * @returns {function} setTheme - Set theme manually (persists to localStorage)
 * @returns {boolean} isSystemDefault - True if using system preference (no manual override)
 * @returns {function} clearThemePreference - Remove manual override and use system preference
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [isSystemDefault, setIsSystemDefault] = useState<boolean>(
    () => !localStorage.getItem(THEME_STORAGE_KEY)
  );

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (e: MediaQueryListEvent) => {
      // Only update theme on system change if user hasn't set manual preference
      if (isSystemDefault) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [isSystemDefault]);

  /**
   * Set theme manually
   * Persists to localStorage and marks as non-system-default
   */
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    setIsSystemDefault(false);
  };

  /**
   * Clear manual theme preference
   * Removes localStorage override and returns to system preference
   */
  const clearThemePreference = () => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    setIsSystemDefault(true);
    setThemeState(getSystemTheme());
  };

  return {
    theme,
    setTheme,
    isSystemDefault,
    clearThemePreference,
  };
}

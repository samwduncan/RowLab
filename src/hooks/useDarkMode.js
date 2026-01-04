import { useEffect, useState } from 'react';

/**
 * Dark mode hook with localStorage persistence
 * Defaults to dark mode for modern aesthetic
 */
export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('rowlab-dark-mode');
    // Default to dark mode (true) if no preference saved
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('rowlab-dark-mode', JSON.stringify(isDark));
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(!isDark);

  return [isDark, toggleDarkMode];
};

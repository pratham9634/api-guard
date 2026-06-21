import { useState, useEffect, useCallback } from 'react';

/**
 * Theme management hook for dark/light mode toggle.
 * Persists preference in localStorage, respects system preference.
 */
export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    const stored = localStorage.getItem('api-guard-theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('api-guard-theme', newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    const stored = localStorage.getItem('api-guard-theme');
    if (stored) return; // User has explicit preference

    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = (e) => setThemeState(e.matches ? 'light' : 'dark');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return { theme, setTheme, toggleTheme, isDark: theme === 'dark' };
}

/**
 * @file useTheme.js
 * @description Custom React hook to manage light and dark display modes.
 * Checks localStorage preferences, falls back to system preferences, and manages toggle interactions.
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Theme management hook for dark/light mode toggle.
 * Persists preference in localStorage, respects system preference.
 * 
 * @returns {Object} Theme properties: theme name, setters, togglers, and isDark helper.
 */
export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    const stored = localStorage.getItem('api-guard-theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  /**
   * Sets theme state and stores choice in localStorage.
   * @type {Function}
   * @param {'light'|'dark'} newTheme
   */
  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('api-guard-theme', newTheme);
  }, []);

  /**
   * Toggles theme state between 'light' and 'dark'.
   * @type {Function}
   */
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // Synchronize CSS class modifiers on document root element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

  // Listen for system preference changes (e.g. OS toggle)
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

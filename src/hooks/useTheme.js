import { useState, useEffect } from 'react';

/**
 * Theme Hook
 *
 * Manages dark/light theme switching with:
 * - LocalStorage persistence
 * - System preference detection
 * - CSS class application to <html> element
 */
export function useTheme() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Get saved theme or system preference
    const savedTheme = localStorage.getItem('secure_notes_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  /**
   * Toggle between dark and light themes
   */
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('secure_notes_theme', newTheme);
    applyTheme(newTheme);
  };

  /**
   * Apply theme to document
   */
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return { theme, toggleTheme };
}

'use client';

import { useThemeStore } from '@/store/themeStore';

/**
 * Custom hook to access and manage theme state
 * 
 * @returns {Object} Theme state and methods
 * @property {('light'|'dark'|'system')} theme - Current theme setting
 * @property {('light'|'dark')} effectiveTheme - Actual theme being applied
 * @property {Function} setTheme - Set theme to 'light', 'dark', or 'system'
 * @property {Function} toggleTheme - Toggle between light and dark
 * 
 * @example
 * const { theme, effectiveTheme, setTheme, toggleTheme } = useTheme();
 * 
 * // Set specific theme
 * setTheme('dark');
 * setTheme('light');
 * setTheme('system');
 * 
 * // Toggle between light and dark
 * toggleTheme();
 * 
 * // Check current theme
 * if (effectiveTheme === 'dark') {
 *   // Dark mode is active
 * }
 */
export function useTheme() {
  const { theme, effectiveTheme, setTheme, toggleTheme } = useThemeStore();

  return {
    theme,
    effectiveTheme,
    setTheme,
    toggleTheme,
    isDark: effectiveTheme === 'dark',
    isLight: effectiveTheme === 'light',
    isSystem: theme === 'system',
  };
}

// Made with Bob

'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Initialize theme on mount
    setTheme(theme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const store = useThemeStore.getState();
      if (store.theme === 'system') {
        // Re-apply system theme to update effectiveTheme
        store.setTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme, setTheme]);

  return <>{children}</>;
}

// Made with Bob

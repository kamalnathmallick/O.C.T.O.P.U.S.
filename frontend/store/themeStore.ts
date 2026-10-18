import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getEffectiveTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      effectiveTheme: getSystemTheme(),
      
      setTheme: (theme: Theme) => {
        const effectiveTheme = getEffectiveTheme(theme);
        set({ theme, effectiveTheme });
        
        // Update document class
        if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(effectiveTheme);
          document.documentElement.setAttribute('data-theme', effectiveTheme);
        }
      },
      
      toggleTheme: () => {
        const { effectiveTheme } = get();
        const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },
    }),
    {
      name: 'octopus-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply theme on hydration
          const effectiveTheme = getEffectiveTheme(state.theme);
          if (typeof document !== 'undefined') {
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(effectiveTheme);
            document.documentElement.setAttribute('data-theme', effectiveTheme);
          }
        }
      },
    }
  )
);

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const store = useThemeStore.getState();
    if (store.theme === 'system') {
      const effectiveTheme = e.matches ? 'dark' : 'light';
      store.setTheme('system');
    }
  });
}

// Made with Bob

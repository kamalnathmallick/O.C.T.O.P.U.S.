'use client';

import { useEffect, useState } from 'react';
import { useThemeStore } from '@/store/themeStore';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, effectiveTheme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  const themes: Array<{ value: 'light' | 'dark' | 'system'; icon: any; label: string }> = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <div className="relative group">
      <button
        onClick={() => {
          const currentIndex = themes.findIndex(t => t.value === theme);
          const nextIndex = (currentIndex + 1) % themes.length;
          setTheme(themes[nextIndex].value);
        }}
        className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
        title={`Current: ${theme} (${effectiveTheme})`}
      >
        {theme === 'light' && <Sun className="w-5 h-5 text-yellow-500" />}
        {theme === 'dark' && <Moon className="w-5 h-5 text-blue-400" />}
        {theme === 'system' && <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
      </button>

      {/* Dropdown menu */}
      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-2">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1 mb-1">
            Theme
          </div>
          {themes.map((t) => {
            const Icon = t.icon;
            const isActive = theme === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{t.label}</span>
                {isActive && (
                  <svg
                    className="w-4 h-4 ml-auto"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 p-2">
          <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
            Current: <span className="font-semibold capitalize">{effectiveTheme}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob

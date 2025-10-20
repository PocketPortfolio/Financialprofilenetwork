'use client';

import { useEffect, useState } from 'react';

type Theme = 'system' | 'light' | 'dark' | 'contrast';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('pocket-portfolio-theme') as Theme;
    if (savedTheme && ['system', 'light', 'dark', 'contrast'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    // Apply theme logic - this runs whenever theme changes
    const applyTheme = (newTheme: Theme) => {
      const root = document.documentElement;
      const body = document.body;
      
      if (newTheme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setResolvedTheme(prefersDark ? 'dark' : 'light');
        root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        body.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      } else if (newTheme === 'contrast') {
        setResolvedTheme('dark');
        root.setAttribute('data-theme', 'contrast');
        body.setAttribute('data-theme', 'contrast');
      } else {
        setResolvedTheme(newTheme);
        root.setAttribute('data-theme', newTheme);
        body.setAttribute('data-theme', newTheme);
      }
    };

    // Only apply theme after initialization to prevent flash
    if (isInitialized) {
      applyTheme(theme);
      localStorage.setItem('pocket-portfolio-theme', theme);
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (isInitialized && theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, isInitialized]);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return { theme, resolvedTheme, changeTheme };
}

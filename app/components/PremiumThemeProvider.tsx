'use client';

import { useEffect } from 'react';
import { usePremiumTheme } from '../hooks/usePremiumTheme';

/**
 * Premium Theme Provider
 * Automatically applies premium themes when user has unlocked access
 * Respects user preference to use premium theme or original themes
 * This component should be included in the root layout
 */
export default function PremiumThemeProvider() {
  const { unlockedTheme } = usePremiumTheme();

  useEffect(() => {
    if (!unlockedTheme) {
      // Remove any premium theme classes if no theme is unlocked
      document.body.classList.remove('theme-founder', 'theme-corporate');
      return;
    }

    // Check user preference - default to true (use premium theme) for backward compatibility
    const premiumThemePreference = localStorage.getItem('pocket-portfolio-use-premium-theme');
    const shouldUsePremiumTheme = premiumThemePreference === null || premiumThemePreference === 'true';

    if (shouldUsePremiumTheme) {
      // Apply premium theme class
      const body = document.body;
      body.classList.add(`theme-${unlockedTheme}`);
    } else {
      // Remove premium theme classes to use original themes
      document.body.classList.remove('theme-founder', 'theme-corporate');
    }

    // Cleanup on unmount or theme change
    return () => {
      document.body.classList.remove('theme-founder', 'theme-corporate');
    };
  }, [unlockedTheme]);

  // Listen for preference changes
  useEffect(() => {
    const handleStorageChange = () => {
      if (!unlockedTheme) return;
      
      const premiumThemePreference = localStorage.getItem('pocket-portfolio-use-premium-theme');
      const shouldUsePremiumTheme = premiumThemePreference === null || premiumThemePreference === 'true';

      if (shouldUsePremiumTheme) {
        document.body.classList.remove('theme-founder', 'theme-corporate');
        document.body.classList.add(`theme-${unlockedTheme}`);
      } else {
        document.body.classList.remove('theme-founder', 'theme-corporate');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom event for same-tab updates
    window.addEventListener('premium-theme-preference-changed', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('premium-theme-preference-changed', handleStorageChange);
    };
  }, [unlockedTheme]);

  // This component doesn't render anything
  return null;
}











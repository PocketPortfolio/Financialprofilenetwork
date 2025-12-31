'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

type Theme = 'system' | 'light' | 'dark' | 'contrast';

export function useTheme() {
  // Initialize from DOM to avoid state mismatch
  // Read current theme from DOM on first render (SSR-safe)
  const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'system';
    const savedTheme = localStorage.getItem('pocket-portfolio-theme') as Theme;
    if (savedTheme && ['system', 'light', 'dark', 'contrast'].includes(savedTheme)) {
      return savedTheme;
    }
    return 'system';
  };
  
  const getInitialResolvedTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'dark';
    const dataTheme = document.documentElement.getAttribute('data-theme');
    if (dataTheme === 'light' || dataTheme === 'dark') {
      return dataTheme;
    }
    // Fallback to system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  };
  
  const initialTheme = getInitialTheme();
  const initialResolvedTheme = getInitialResolvedTheme();
  
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(initialResolvedTheme);
  const [isInitialized, setIsInitialized] = useState(false);
  // Use ref to track current theme for immediate access (avoids React batching delay)
  const themeRef = useRef<Theme>(initialTheme);
  const resolvedThemeRef = useRef<'light' | 'dark'>(initialResolvedTheme);

  useEffect(() => {
    // Load theme from localStorage on mount and sync with DOM
    const savedTheme = localStorage.getItem('pocket-portfolio-theme') as Theme;
    if (savedTheme && ['system', 'light', 'dark', 'contrast'].includes(savedTheme)) {
      themeRef.current = savedTheme;
      setTheme(savedTheme);
    }
    
    // Sync resolvedTheme with DOM to avoid mismatch
    // CRITICAL: Read from DOM first, then update refs and state
    const dataTheme = document.documentElement.getAttribute('data-theme');
    let newResolvedTheme: 'light' | 'dark';
    if (dataTheme === 'light' || dataTheme === 'dark') {
      newResolvedTheme = dataTheme;
    } else {
      // If DOM doesn't have a theme, use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      newResolvedTheme = prefersDark ? 'dark' : 'light';
    }
    
    // Update refs FIRST (synchronously)
    resolvedThemeRef.current = newResolvedTheme;
    
    // Then update state (this will trigger a re-render)
    setResolvedTheme(newResolvedTheme);
    
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    // Apply theme logic - this runs whenever theme changes
    // Note: DOM is already updated synchronously in changeTheme, so this mainly handles
    // localStorage persistence and system theme changes
    const applyTheme = (newTheme: Theme) => {
      const root = document.documentElement;
      const body = document.body;
      
      // Check if DOM is already updated (to avoid redundant updates)
      const currentDataTheme = root.getAttribute('data-theme');
      let expectedDataTheme: string;
      
      if (newTheme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const newResolved = prefersDark ? 'dark' : 'light';
        expectedDataTheme = newResolved;
        // Update refs
        themeRef.current = newTheme;
        resolvedThemeRef.current = newResolved;
        // Only update if different
        if (currentDataTheme !== expectedDataTheme) {
          setResolvedTheme(newResolved);
          root.setAttribute('data-theme', expectedDataTheme);
          body.setAttribute('data-theme', expectedDataTheme);
        }
      } else if (newTheme === 'contrast') {
        expectedDataTheme = 'contrast';
        // Update refs
        themeRef.current = newTheme;
        resolvedThemeRef.current = 'dark';
        if (currentDataTheme !== expectedDataTheme) {
          setResolvedTheme('dark');
          root.setAttribute('data-theme', 'contrast');
          body.setAttribute('data-theme', 'contrast');
        }
      } else {
        expectedDataTheme = newTheme;
        // Update refs
        themeRef.current = newTheme;
        resolvedThemeRef.current = newTheme;
        // Only update if different (DOM was already updated in changeTheme)
        if (currentDataTheme !== expectedDataTheme) {
          setResolvedTheme(newTheme);
          root.setAttribute('data-theme', newTheme);
          body.setAttribute('data-theme', newTheme);
        }
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

  const changeTheme = useCallback((newTheme: Theme) => {
    // Update resolvedTheme and DOM synchronously for immediate visual feedback
    let newResolvedTheme: 'light' | 'dark' = 'dark';
    let domTheme: string = 'dark';
    
    if (newTheme === 'light' || newTheme === 'dark') {
      newResolvedTheme = newTheme;
      domTheme = newTheme;
    } else if (newTheme === 'system') {
      const prefersDark = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
      newResolvedTheme = prefersDark ? 'dark' : 'light';
      domTheme = newResolvedTheme;
    } else if (newTheme === 'contrast') {
      newResolvedTheme = 'dark';
      domTheme = 'contrast';
    }
    
    // Update refs FIRST (before any state updates) for immediate synchronous access
    themeRef.current = newTheme;
    resolvedThemeRef.current = newResolvedTheme;
    
    // Update state and DOM immediately
    // Force synchronous DOM update BEFORE state updates to ensure immediate visual feedback
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const body = document.body;
      
      // CRITICAL: Apply theme attributes FIRST, before any style changes
      root.setAttribute('data-theme', domTheme);
      body.setAttribute('data-theme', domTheme);
      
      // Force immediate repaint by reading layout properties BEFORE applying styles
      // This ensures the browser applies the theme change immediately
      void root.offsetHeight; // Force reflow on root
      void body.offsetHeight; // Force reflow on body
      
      // Add a brief flash animation to the body to make theme change unmistakable
      // This provides immediate visual confirmation that the theme is changing
      // Create flash overlay synchronously for immediate visual feedback
      const flashOverlay = document.createElement('div');
      const flashColor = newResolvedTheme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)';
      flashOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: ${flashColor};
        pointer-events: none;
        z-index: 999999;
        opacity: 1;
        transition: opacity 0.15s ease-out;
      `;
      document.body.appendChild(flashOverlay);
      
      // Remove the flash after a brief moment
      setTimeout(() => {
        if (flashOverlay && flashOverlay.parentNode) {
          flashOverlay.style.opacity = '0';
          setTimeout(() => {
            if (flashOverlay.parentNode) {
              flashOverlay.parentNode.removeChild(flashOverlay);
            }
          }, 150);
        }
      }, 50); // Show flash for 50ms, then fade out over 150ms
    }
    
    // Update state after DOM is updated
    setResolvedTheme(newResolvedTheme);
    setTheme(newTheme);
  }, []); // Empty deps - setTheme, setResolvedTheme, and themeRef are all stable

  return { theme, resolvedTheme, changeTheme, themeRef, resolvedThemeRef };
}

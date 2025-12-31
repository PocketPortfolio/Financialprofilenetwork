'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { flushSync } from 'react-dom';
import { useTheme } from '../hooks/useTheme';

// Track component renders
let renderCount = 0;

// Enterprise-grade theme switcher with comprehensive accessibility and state management
export default function ThemeSwitcher() {
  const { theme, resolvedTheme, changeTheme, themeRef, resolvedThemeRef } = useTheme();
  
  // Sync refs with DOM on every render to prevent stale ref issues
  // This ensures refs are always current, even if state is stale
  useEffect(() => {
    const dataTheme = document.documentElement.getAttribute('data-theme');
    if (dataTheme === 'light' || dataTheme === 'dark') {
      // Always keep refs in sync with DOM (refs are used by handlers)
      if (resolvedThemeRef.current !== dataTheme) {
        resolvedThemeRef.current = dataTheme;
      }
    }
  });
  
  
  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false); // Synchronous processing flag to prevent double-clicks
  const lastClickTime = useRef(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Constants for theme switching
  const MIN_CLICK_INTERVAL = 0; // Removed to allow instant clicking (no debouncing)

  // Cleanup function to prevent memory leaks
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    isProcessingRef.current = false; // Clear synchronous ref
    setIsProcessing(false); // Clear React state
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Theme cycle logic with proper state management
  const getNextTheme = useCallback((currentTheme: string): string => {
    // Read the ACTUAL resolved theme from DOM - this is the source of truth
    // This ensures we always use the real current theme, not a calculated one
    const dataTheme = typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : null;
    let currentResolved: 'light' | 'dark' = 'dark';
    
    if (dataTheme === 'light' || dataTheme === 'dark') {
      // Use the actual DOM theme - this is always correct
      currentResolved = dataTheme;
    } else if (currentTheme === 'light' || currentTheme === 'dark') {
      // Fallback to currentTheme if DOM doesn't have a theme yet
      currentResolved = currentTheme;
    } else if (currentTheme === 'system') {
      // Fallback: Check system preference if DOM and theme are both system
      const prefersDark = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
      currentResolved = prefersDark ? 'dark' : 'light';
    }
    
    // Ensure the next theme produces a visual change
    switch (currentTheme) {
      case 'system':
        // If system resolves to light, skip light and go to dark (visual change)
        // If system resolves to dark, go to light (visual change)
        return currentResolved === 'light' ? 'dark' : 'light';
      case 'light': 
        // From light, go to dark (visual change)
        return 'dark';
      case 'dark': 
        // From dark, check if system would resolve to dark
        // If so, go to light (visual change), otherwise go to system
        const prefersDark = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
        return prefersDark ? 'light' : 'system'; // If system is dark, go to light; otherwise go to system
      default: return 'system';
    }
  }, []);

  // Instant theme change handler - CSS transitions handle the smoothness
  const handleThemeChange = useCallback((newTheme: string) => {
    // Force synchronous update to avoid React batching delay
    flushSync(() => {
      changeTheme(newTheme as any);
    });
    
    // CRITICAL: Clear processing flag IMMEDIATELY after theme change completes (synchronously)
    // This allows rapid switching while still preventing race conditions
    // The visual feedback (CSS class, DOM styles) will persist briefly for user feedback
    // but the processing flag is cleared immediately so rapid clicks work
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Clear processing flag IMMEDIATELY (synchronously) to allow rapid switching
    // The button visual feedback will still be visible briefly, but the flag is cleared
    isProcessingRef.current = false;
    setIsProcessing(false);
    
    // Restore button visual state after a brief delay (for visual feedback)
    // But don't block rapid clicks - clear the flag immediately above
    timeoutRef.current = setTimeout(() => {
      // Restore button visual state
      if (buttonRef.current) {
        const button = buttonRef.current;
        button.style.removeProperty('opacity');
        button.style.removeProperty('pointer-events');
        button.style.removeProperty('cursor');
        button.style.removeProperty('transform');
        button.style.removeProperty('background-color');
      }
      // Remove CSS class when visual feedback completes
      if (buttonRef.current) {
        buttonRef.current.classList.remove('theme-switcher-processing');
      }
    }, 50); // Brief delay for visual feedback, but flag is cleared immediately above
  }, [changeTheme]); // Removed theme from deps - use themeRef.current instead to avoid stale closures

  // Instant theme toggle - no debouncing, just prevent accidental double-clicks
  const handleThemeToggle = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    try {
      // Prevent default behavior FIRST (before any async operations)
      if (typeof e.preventDefault === 'function') {
        e.preventDefault();
      }
      if (typeof e.stopPropagation === 'function') {
        e.stopPropagation();
      }
      
      // ATOMIC CHECK-AND-SET: Check if processing, and if not, set it immediately
      // This prevents race conditions where two clicks happen in the same event loop tick
      // We check the ref, and if it's false, we set it to true in one atomic operation
      const wasProcessing = isProcessingRef.current;
      if (wasProcessing) {
        return;
      }
      
      // ATOMIC SET: Set processing ref IMMEDIATELY (synchronously) to block any subsequent clicks
      // This must happen immediately after the check to prevent race conditions
      isProcessingRef.current = true;
      // Force immediate state update to trigger re-render for visual feedback
      // Use flushSync to ensure React applies the styles immediately
      flushSync(() => {
        setIsProcessing(true);
      });
      
      // Force immediate DOM update for visual feedback (button opacity/pointer-events)
      // This ensures the button is visually disabled even before React re-renders
      // Also add a visual "pulse" animation to confirm the click was registered
      // CRITICAL: Add CSS class immediately via DOM manipulation, not just React's className prop
      if (buttonRef.current) {
        const button = buttonRef.current;
        // Add CSS class immediately for instant visual feedback
        button.classList.add('theme-switcher-processing');
        // Also use !important via setProperty as backup
        // Make the button EXTREMELY obvious that it was clicked - maximum visual feedback
        // Add a brief flash animation to confirm click was registered
        button.style.setProperty('opacity', '0.3', 'important'); // Even more dramatic opacity change
        button.style.setProperty('pointer-events', 'none', 'important');
        button.style.setProperty('cursor', 'not-allowed', 'important');
        // Add a more dramatic scale animation to confirm click was registered
        button.style.setProperty('transform', 'scale(0.8)', 'important'); // Even more dramatic scale
        button.style.setProperty('transition', 'transform 0.1s ease-out, opacity 0.1s ease-out, background-color 0.1s ease-out', 'important');
        // Add a bright flash color to make it impossible to miss
        button.style.setProperty('background-color', 'rgba(249, 115, 22, 0.6)', 'important'); // Brighter orange tint
        button.style.setProperty('box-shadow', '0 0 20px rgba(249, 115, 22, 0.8)', 'important'); // Glow effect
        // CRITICAL: Force browser reflow to ensure styles are applied immediately
        // Reading offsetHeight forces the browser to recalculate layout and apply styles
        void button.offsetHeight;
        // Reset transform, background, and glow after animation
        setTimeout(() => {
          if (button) {
            button.style.removeProperty('transform');
            button.style.removeProperty('background-color');
            button.style.removeProperty('box-shadow');
          }
        }, 150); // Slightly longer to ensure the flash is visible
      }
      
      // Double-check: If somehow the ref was set between check and set (shouldn't happen in JS, but defensive)
      if (isProcessingRef.current !== true) {
        console.error('Race condition detected: isProcessingRef was modified during check-and-set');
        return;
      }
      
      // Update last click time for tracking (but don't block clicks)
      lastClickTime.current = Date.now();
      
      // CRITICAL: Use the theme from the ref, which is updated synchronously in changeTheme
      // The ref is updated BEFORE state in changeTheme, so it's always current
      // Don't sync from state to ref here - trust that changeTheme already updated the ref
      // This ensures rapid clicks always use the correct current theme
      const currentThemeFromRef = themeRef?.current ?? theme; // Fallback to state if ref is undefined
      
      // Calculate next theme using ref for immediate access (avoids React batching delay)
      // CRITICAL: Do NOT update themeRef.current here - let changeTheme update it
      // If we update it here, rapid clicks will read the "next" theme instead of the "current" theme
      // getNextTheme now reads the actual resolved theme from DOM, ensuring correct calculation
      const nextTheme = getNextTheme(currentThemeFromRef);
      
      // Execute theme change immediately
      handleThemeChange(nextTheme);
    } catch (error) {
      console.error('Theme toggle error:', error);
      // Graceful fallback - still try to change theme
      const nextTheme = getNextTheme(themeRef.current);
      handleThemeChange(nextTheme);
    }
  }, [getNextTheme, handleThemeChange]); // Removed theme, resolvedTheme, isProcessing - use refs instead to avoid stale closures

  // Memoized onClick handler to prevent recreation on every render
  // This ensures the button always has a stable handler that uses current refs
  const handleButtonClick = useCallback((e: React.MouseEvent) => {
    handleThemeToggle(e);
  }, [handleThemeToggle]); // Only depends on handleThemeToggle, which is stable

  // Enhanced keyboard navigation with comprehensive key support
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const validKeys = ['Enter', ' ', 'ArrowRight', 'ArrowDown'];
    
    if (validKeys.includes(e.key)) {
      try {
        if (typeof e.preventDefault === 'function') {
          e.preventDefault();
        }
        if (typeof e.stopPropagation === 'function') {
          e.stopPropagation();
        }
        
        // Only call stopImmediatePropagation if it exists
        if ('stopImmediatePropagation' in e && typeof (e as any).stopImmediatePropagation === 'function') {
          (e as any).stopImmediatePropagation();
        }
        
        handleThemeToggle(e);
      } catch (error) {
        console.error('Keyboard theme toggle error:', error);
        // Graceful fallback
        handleThemeToggle(e);
      }
    }
  }, [handleThemeToggle]);

  // Track if component has mounted to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Accessibility helpers with comprehensive screen reader support
  // Only calculate after mount to prevent hydration mismatch
  const accessibilityProps = useMemo(() => {
    // During SSR or before mount, use safe defaults
    if (!isMounted) {
      return {
        label: 'Theme switcher',
        title: 'Theme switcher',
        describedBy: 'theme-switcher-description',
      };
    }
    
    const currentThemeText = theme === 'system' 
      ? `System theme (currently ${resolvedTheme})` 
      : `${theme.charAt(0).toUpperCase() + theme.slice(1)} theme`;
    
    const nextThemeText = getNextTheme(theme);
    const actionText = `Switch to ${nextThemeText.charAt(0).toUpperCase() + nextThemeText.slice(1)} theme`;
    
    return {
      label: `${currentThemeText}. ${actionText}`,
      title: `${currentThemeText}. Click, press Enter, or use arrow keys to ${actionText.toLowerCase()}`,
      describedBy: `theme-switcher-description-${theme}`,
    };
  }, [theme, resolvedTheme, getNextTheme, isMounted]);

  // Enhanced visual feedback system
  // CRITICAL: Calculate styles directly during render (not memoized) to always read latest ref
  // This ensures we always get the current ref value, even if state hasn't updated yet
  const getButtonStyles = (): React.CSSProperties => {
    // CRITICAL: Check ref FIRST (synchronous) before state (async)
    // The ref is set immediately, but state might not be updated yet
    const processing = isProcessingRef.current || isProcessing;
    
    const baseStyles: React.CSSProperties = {
      padding: '8px',
      borderRadius: '8px',
      cursor: processing ? 'not-allowed' : 'pointer',
      opacity: processing ? 0.3 : 1, // Use 0.3 directly in baseStyles when processing
      pointerEvents: processing ? ('none' as const) : ('auto' as const),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: processing ? 'transform 0.1s ease-out, opacity 0.1s ease-out, background-color 0.1s ease-out' : 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      minWidth: '40px',
      height: '40px',
      outline: 'none',
      border: '2px solid var(--border-warm)',
      position: 'relative',
      overflow: 'hidden',
    };

    if (processing) {
      const processingStyles: React.CSSProperties = {
        ...baseStyles,
        transform: 'scale(0.8)', // More dramatic scale to match direct DOM manipulation
        backgroundColor: 'rgba(249, 115, 22, 0.6)', // Bright orange tint
        boxShadow: '0 0 20px rgba(249, 115, 22, 0.8)', // Glow effect
      };
      return processingStyles;
    }

    return {
      ...baseStyles,
      background: 'var(--card)',
      color: 'var(--text-warm)',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    };
  };

  // Enhanced hover effects with smooth transitions
  // CRITICAL: Disable hover effects when processing to prevent style conflicts
  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (isProcessing || isProcessingRef.current) return;
    
    const button = e.currentTarget;
    button.style.background = 'rgba(245, 158, 11, 0.1)';
    button.style.borderColor = 'var(--accent-warm)';
    button.style.transform = 'translateY(-1px)';
    button.style.boxShadow = '0 4px 8px rgba(245, 158, 11, 0.2)';
  }, [isProcessing]);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (isProcessing || isProcessingRef.current) return;
    
    const button = e.currentTarget;
    button.style.background = 'var(--card)';
    button.style.borderColor = 'var(--border-warm)';
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
  }, [isProcessing]);

  // Enhanced focus management
  const handleFocus = useCallback((e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.outline = '2px solid var(--accent-warm)';
    e.currentTarget.style.outlineOffset = '2px';
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.outline = 'none';
  }, []);

  // Render theme icon with enhanced accessibility
  const renderThemeIcon = () => {
    // Only render after mount to prevent hydration mismatch
    if (!isMounted) {
      // Return a placeholder during SSR
      return (
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none"
          aria-hidden="true"
          role="img"
          suppressHydrationWarning
        >
          <circle 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="2"
            fill="none"
          />
        </svg>
      );
    }
    
    // Read directly from DOM - this is the source of truth and always current
    const dataTheme = typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : null;
    const currentResolvedTheme = (dataTheme === 'light' || dataTheme === 'dark') ? dataTheme : (resolvedThemeRef?.current ?? resolvedTheme);
    
    if (isProcessing) {
      return (
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none"
          aria-hidden="true"
          role="img"
          aria-label="Changing theme"
          suppressHydrationWarning
        >
          <circle 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            fill="none"
            style={{ 
              animation: 'spin 0.8s linear infinite',
              strokeDasharray: '15.708 15.708'
            }}
          />
        </svg>
      );
    }

    if (currentResolvedTheme === 'light') {
      return (
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          aria-hidden="true"
          role="img"
          aria-label="Light theme"
          suppressHydrationWarning
        >
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
        </svg>
      );
    }

    return (
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        aria-hidden="true"
        role="img"
        aria-label="Dark theme"
        suppressHydrationWarning
      >
        <path d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"/>
      </svg>
    );
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {/* Hidden description for screen readers */}
      <div 
        id={accessibilityProps.describedBy}
        className="sr-only"
        suppressHydrationWarning
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0
        }}
      >
        {isMounted && (
          <>
            Theme switcher: Currently using {theme} theme. 
            {isProcessing ? 'Changing theme...' : `Press to switch to ${getNextTheme(theme)} theme.`}
          </>
        )}
      </div>

      <button
        id="theme-selector"
        ref={buttonRef}
        onClick={handleButtonClick}
        onKeyDown={handleKeyDown}
        disabled={isProcessing || isProcessingRef.current}
        className={isProcessing || isProcessingRef.current ? 'theme-switcher-processing' : ''}
        type="button"
        role="button"
        aria-label={accessibilityProps.label}
        aria-describedby={accessibilityProps.describedBy}
        aria-pressed={false}
        aria-live="polite"
        tabIndex={0}
        style={getButtonStyles()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        title={accessibilityProps.title}
      >
        {renderThemeIcon()}
      </button>
    </div>
  );
}

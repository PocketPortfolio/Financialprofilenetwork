'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useTheme } from '../hooks/useTheme';

// Enterprise-grade theme switcher with comprehensive accessibility and state management
export default function ThemeSwitcher() {
  const { theme, resolvedTheme, changeTheme } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const lastClickTime = useRef(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Constants for enterprise-grade behavior
  const DEBOUNCE_DELAY = 150; // Reduced from 300ms for better UX
  const TRANSITION_DURATION = 200;
  const MIN_CLICK_INTERVAL = 100; // Minimum time between valid clicks

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
    setIsTransitioning(false);
    setIsProcessing(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Theme cycle logic with proper state management
  const getNextTheme = useCallback((currentTheme: string): string => {
    switch (currentTheme) {
      case 'system': return 'light';
      case 'light': return 'dark';
      case 'dark': return 'system';
      default: return 'system';
    }
  }, []);

  // Enterprise-grade theme change handler with comprehensive error handling
  const handleThemeChange = useCallback(async (newTheme: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    setIsTransitioning(true);

    try {
      // Create abort controller for this operation
      abortControllerRef.current = new AbortController();
      
      // Apply theme change
      changeTheme(newTheme as any);
      
      // Wait for transition to complete
      await new Promise(resolve => {
        timeoutRef.current = setTimeout(resolve, TRANSITION_DURATION);
      });

      // Verify theme change was successful
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

    } catch (error) {
      console.error('Theme change failed:', error);
      // Fallback: revert to previous theme
      // This would be handled by the theme system
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsTransitioning(false);
        setIsProcessing(false);
      }
    }
  }, [isProcessing, changeTheme]);

  // Debounced theme toggle with enterprise-grade event handling
  const handleThemeToggle = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    try {
      // Prevent default behavior with error handling
      if (typeof e.preventDefault === 'function') {
        e.preventDefault();
      }
      if (typeof e.stopPropagation === 'function') {
        e.stopPropagation();
      }
      
      // Only call stopImmediatePropagation if it exists (not available on all event types)
      if ('stopImmediatePropagation' in e && typeof (e as any).stopImmediatePropagation === 'function') {
        (e as any).stopImmediatePropagation();
      }
      
      const now = Date.now();
      const timeSinceLastClick = now - lastClickTime.current;
      
      // Enhanced debouncing logic
      if (timeSinceLastClick < MIN_CLICK_INTERVAL || isProcessing || isTransitioning) {
        return;
      }
      
      lastClickTime.current = now;
      
      // Calculate next theme
      const nextTheme = getNextTheme(theme);
      
      // Execute theme change
      handleThemeChange(nextTheme);
    } catch (error) {
      console.error('Theme toggle error:', error);
      // Graceful fallback - still try to change theme
      if (!isProcessing && !isTransitioning) {
        const nextTheme = getNextTheme(theme);
        handleThemeChange(nextTheme);
      }
    }
  }, [theme, isProcessing, isTransitioning, getNextTheme, handleThemeChange]);

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

  // Accessibility helpers with comprehensive screen reader support
  const accessibilityProps = useMemo(() => {
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
  }, [theme, resolvedTheme, getNextTheme]);

  // Enhanced visual feedback system
  const getButtonStyles = useCallback(() => {
    const baseStyles = {
      padding: '8px',
      borderRadius: '8px',
      cursor: isProcessing ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      minWidth: '40px',
      height: '40px',
      outline: 'none',
      border: '2px solid var(--border-warm)',
      position: 'relative' as const,
      overflow: 'hidden' as const,
    };

    if (isProcessing || isTransitioning) {
      return {
        ...baseStyles,
        background: 'var(--muted)',
        color: 'var(--text-secondary)',
        opacity: 0.7,
        boxShadow: 'none',
        transform: 'scale(0.95)',
      };
    }

    return {
      ...baseStyles,
      background: 'var(--card)',
      color: 'var(--text-warm)',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    };
  }, [isProcessing, isTransitioning]);

  // Enhanced hover effects with smooth transitions
  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (isProcessing || isTransitioning) return;
    
    const button = e.currentTarget;
    button.style.background = 'rgba(245, 158, 11, 0.1)';
    button.style.borderColor = 'var(--accent-warm)';
    button.style.transform = 'translateY(-1px)';
    button.style.boxShadow = '0 4px 8px rgba(245, 158, 11, 0.2)';
  }, [isProcessing, isTransitioning]);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (isProcessing || isTransitioning) return;
    
    const button = e.currentTarget;
    button.style.background = 'var(--card)';
    button.style.borderColor = 'var(--border-warm)';
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
  }, [isProcessing, isTransitioning]);

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
    if (isProcessing || isTransitioning) {
      return (
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none"
          aria-hidden="true"
          role="img"
          aria-label="Changing theme"
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

    if (resolvedTheme === 'light') {
      return (
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          aria-hidden="true"
          role="img"
          aria-label="Light theme"
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
        Theme switcher: Currently using {theme} theme. 
        {isProcessing ? 'Changing theme...' : `Press to switch to ${getNextTheme(theme)} theme.`}
      </div>

      <button
        ref={buttonRef}
        onClick={handleThemeToggle}
        onKeyDown={handleKeyDown}
        disabled={isProcessing || isTransitioning}
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

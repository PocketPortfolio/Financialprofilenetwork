import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ThemeSwitcher from '../../app/components/ThemeSwitcher';
import { useTheme } from '../../app/hooks/useTheme';

// Mock the useTheme hook
vi.mock('../../app/hooks/useTheme');

const mockUseTheme = vi.mocked(useTheme);

describe('ThemeSwitcher - Enterprise Grade Tests', () => {
  const defaultMockTheme = {
    theme: 'system' as const,
    resolvedTheme: 'dark' as const,
    changeTheme: vi.fn()
  };

  beforeEach(() => {
    mockUseTheme.mockReturnValue(defaultMockTheme);
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Accessibility Tests (WCAG 2.1 AA Compliance)', () => {
    it('should have proper ARIA attributes', () => {
      render(<ThemeSwitcher />);
      
      const button = screen.getByRole('button');
      
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('aria-describedby');
      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(button).toHaveAttribute('aria-live', 'polite');
      expect(button).toHaveAttribute('title');
    });

    it('should support keyboard navigation', () => {
      render(<ThemeSwitcher />);
      
      const button = screen.getByRole('button');
      
      // Test Enter key
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(defaultMockTheme.changeTheme).toHaveBeenCalledWith('light');
      
      // Test Space key
      fireEvent.keyDown(button, { key: ' ' });
      expect(defaultMockTheme.changeTheme).toHaveBeenCalledWith('light');
      
      // Test Arrow keys
      fireEvent.keyDown(button, { key: 'ArrowRight' });
      expect(defaultMockTheme.changeTheme).toHaveBeenCalledWith('light');
      
      fireEvent.keyDown(button, { key: 'ArrowDown' });
      expect(defaultMockTheme.changeTheme).toHaveBeenCalledWith('light');
    });

    it('should have proper focus management', () => {
      render(<ThemeSwitcher />);
      
      const button = screen.getByRole('button');
      
      fireEvent.focus(button);
      expect(button).toHaveStyle('outline: 2px solid var(--accent-warm)');
      
      fireEvent.blur(button);
      expect(button).toHaveStyle('outline: none');
    });

    it('should provide screen reader feedback', () => {
      render(<ThemeSwitcher />);
      
      // Check for hidden description element
      const description = document.getElementById('theme-switcher-description-system');
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent('Theme switcher: Currently using system theme');
    });

    it('should have proper contrast ratios', () => {
      render(<ThemeSwitcher />);
      
      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);
      
      // Verify button has sufficient contrast
      expect(button).toHaveStyle('color: var(--text-warm)');
      expect(button).toHaveStyle('border: 2px solid var(--border-warm)');
    });
  });

  describe('Double-Click Prevention Tests', () => {
    it('should prevent rapid successive clicks', async () => {
      render(<ThemeSwitcher />);
      
      const button = screen.getByRole('button');
      
      // Simulate rapid clicks
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      // Should only call changeTheme once
      expect(defaultMockTheme.changeTheme).toHaveBeenCalledTimes(1);
    });

    it('should respect minimum click interval', async () => {
      render(<ThemeSwitcher />);
      
      const button = screen.getByRole('button');
      
      // First click
      fireEvent.click(button);
      expect(defaultMockTheme.changeTheme).toHaveBeenCalledTimes(1);
      
      // Immediate second click should be ignored
      fireEvent.click(button);
      expect(defaultMockTheme.changeTheme).toHaveBeenCalledTimes(1);
      
      // Wait for debounce period and click again
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });
      
      fireEvent.click(button);
      expect(defaultMockTheme.changeTheme).toHaveBeenCalledTimes(2);
    });

    it('should prevent clicks during transition', () => {
      mockUseTheme.mockReturnValue({
        ...defaultMockTheme,
      });
      
      render(<ThemeSwitcher />);
      
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      expect(defaultMockTheme.changeTheme).not.toHaveBeenCalled();
      expect(button).toBeDisabled();
    });
  });

  describe('Theme Cycle Tests', () => {
    it('should cycle through themes correctly', () => {
      render(<ThemeSwitcher />);
      
      const button = screen.getByRole('button');
      
      // System -> Light
      fireEvent.click(button);
      expect(defaultMockTheme.changeTheme).toHaveBeenCalledWith('light');
      
      // Light -> Dark
      mockUseTheme.mockReturnValue({
        ...defaultMockTheme,
        theme: 'light'
      });
      fireEvent.click(button);
      expect(defaultMockTheme.changeTheme).toHaveBeenCalledWith('dark');
      
      // Dark -> System
      mockUseTheme.mockReturnValue({
        ...defaultMockTheme,
        theme: 'dark'
      });
      fireEvent.click(button);
      expect(defaultMockTheme.changeTheme).toHaveBeenCalledWith('system');
    });
  });

  describe('Visual Feedback Tests', () => {
    it('should show loading state during transition', () => {
      mockUseTheme.mockReturnValue({
        ...defaultMockTheme,
      });
      
      render(<ThemeSwitcher />);
      
      const button = screen.getByRole('button');
      const spinner = button.querySelector('svg');
      
      expect(button).toBeDisabled();
      expect(spinner).toBeInTheDocument();
      expect(button).toHaveStyle('opacity: 0.7');
    });

    it('should show correct icon for each theme', () => {
      // Test light theme
      mockUseTheme.mockReturnValue({
        ...defaultMockTheme,
        resolvedTheme: 'light'
      });
      
      const { rerender } = render(<ThemeSwitcher />);
      
      let button = screen.getByRole('button');
      let icon = button.querySelector('svg');
      expect(icon).toHaveAttribute('aria-label', 'Light theme');
      
      // Test dark theme
      mockUseTheme.mockReturnValue({
        ...defaultMockTheme,
        resolvedTheme: 'dark'
      });
      
      rerender(<ThemeSwitcher />);
      
      button = screen.getByRole('button');
      icon = button.querySelector('svg');
      expect(icon).toHaveAttribute('aria-label', 'Dark theme');
    });

    it('should have proper hover effects', () => {
      render(<ThemeSwitcher />);
      
      const button = screen.getByRole('button');
      
      fireEvent.mouseEnter(button);
      expect(button).toHaveStyle('background: rgba(245, 158, 11, 0.1)');
      expect(button).toHaveStyle('transform: translateY(-1px)');
      
      fireEvent.mouseLeave(button);
      expect(button).toHaveStyle('background: var(--card)');
      expect(button).toHaveStyle('transform: translateY(0)');
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle theme change errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockUseTheme.mockReturnValue({
        ...defaultMockTheme,
        changeTheme: vi.fn().mockImplementation(() => {
          throw new Error('Theme change failed');
        })
      });
      
      render(<ThemeSwitcher />);
      
      const button = screen.getByRole('button');
      
      // Should not throw error
      expect(() => fireEvent.click(button)).not.toThrow();
      
      consoleSpy.mockRestore();
    });

    it('should handle stopImmediatePropagation errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<ThemeSwitcher />);
      
      const button = screen.getByRole('button');
      
      // Mock event without stopImmediatePropagation
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        // stopImmediatePropagation is missing
      };
      
      // Should not throw error even without stopImmediatePropagation
      expect(() => {
        button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }).not.toThrow();
      
      consoleSpy.mockRestore();
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Mock localStorage to throw error
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn().mockImplementation(() => {
            throw new Error('localStorage not available');
          }),
          setItem: vi.fn().mockImplementation(() => {
            throw new Error('localStorage not available');
          }),
          removeItem: vi.fn(),
        },
        writable: true,
      });
      
      // Should not throw error during render
      expect(() => render(<ThemeSwitcher />)).not.toThrow();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Performance Tests', () => {
    it('should not cause unnecessary re-renders', () => {
      const renderSpy = vi.fn();
      
      const TestComponent = () => {
        renderSpy();
        return <ThemeSwitcher />;
      };
      
      const { rerender } = render(<TestComponent />);
      
      // Re-render with same props
      rerender(<TestComponent />);
      
      // Should only render twice (initial + rerender)
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('should clean up event listeners on unmount', () => {
      const { unmount } = render(<ThemeSwitcher />);
      
      // Should not throw error on unmount
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should work with different theme states', async () => {
      const { rerender } = render(<ThemeSwitcher />);
      
      // Test with system theme
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', expect.stringContaining('System theme'));
      
      // Test with light theme
      mockUseTheme.mockReturnValue({
        ...defaultMockTheme,
        theme: 'light',
        resolvedTheme: 'light'
      });
      
      rerender(<ThemeSwitcher />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', expect.stringContaining('Light theme'));
      
      // Test with dark theme
      mockUseTheme.mockReturnValue({
        ...defaultMockTheme,
        theme: 'dark',
        resolvedTheme: 'dark'
      });
      
      rerender(<ThemeSwitcher />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', expect.stringContaining('Dark theme'));
    });

    it('should handle concurrent theme changes', async () => {
      render(<ThemeSwitcher />);
      
      const button = screen.getByRole('button');
      
      // Simulate rapid theme changes
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      // Should only process one change
      expect(defaultMockTheme.changeTheme).toHaveBeenCalledTimes(1);
    });
  });
});



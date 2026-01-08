'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface OptimizedTooltipProps {
  children: React.ReactNode;
  content: string;
  /** Placement preference: 'auto' will choose best position, 'top' or 'bottom' forces position */
  placement?: 'auto' | 'top' | 'bottom';
  /** Maximum width of tooltip */
  maxWidth?: number;
  /** Custom trigger element (if not provided, wraps children) */
  trigger?: React.ReactNode;
}

/**
 * Optimized tooltip component with smart positioning, better visibility, and viewport awareness
 */
export function OptimizedTooltip({ 
  children, 
  content, 
  placement = 'auto',
  maxWidth = 360,
  trigger 
}: OptimizedTooltipProps) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; placement: 'top' | 'bottom' } | null>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (show && triggerRef.current) {
      const calculatePosition = () => {
        if (!triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const tooltipWidth = maxWidth;
        const tooltipHeight = 120; // Estimated height (will adjust based on content)
        const spacing = 12; // Space between trigger and tooltip
        const padding = 16; // Viewport padding

        // Check available space above and below
        const spaceAbove = rect.top;
        const spaceBelow = viewportHeight - rect.bottom;

        let top: number;
        let left: number;
        let finalPlacement: 'top' | 'bottom';

        // Determine placement
        if (placement === 'top') {
          finalPlacement = 'top';
        } else if (placement === 'bottom') {
          finalPlacement = 'bottom';
        } else {
          // Auto: choose best position
          finalPlacement = spaceAbove >= tooltipHeight + spacing || spaceAbove > spaceBelow ? 'top' : 'bottom';
        }

        // Calculate vertical position
        if (finalPlacement === 'top') {
          top = rect.top - tooltipHeight - spacing;
        } else {
          top = rect.bottom + spacing;
        }

        // Center horizontally, but keep within viewport
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        left = Math.max(padding, Math.min(left, viewportWidth - tooltipWidth - padding));

        setPosition({ top, left, placement: finalPlacement });
      };

      calculatePosition();

      // Recalculate on scroll/resize
      const handleResize = () => calculatePosition();
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize, true);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize, true);
      };
    }
  }, [show, maxWidth, placement]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShow(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShow(false);
      setPosition(null);
    }, 150); // Small delay to allow moving to tooltip
  };

  const handleTooltipMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleTooltipMouseLeave = () => {
    setShow(false);
    setPosition(null);
  };

  const triggerElement = trigger || children;

  return (
    <>
      <span 
        ref={triggerRef as any}
        style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {triggerElement}
      </span>
      {show && position && typeof window !== 'undefined' && createPortal(
        <div
          ref={tooltipRef}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            padding: 'var(--space-4)',
            backgroundColor: 'var(--surface-elevated)',
            border: '2px solid var(--info)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-xl), 0 0 0 1px rgba(14, 165, 233, 0.1)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text)',
            whiteSpace: 'pre-wrap',
            maxWidth: `${maxWidth}px`,
            minWidth: '280px',
            zIndex: 1400, // --z-popover
            pointerEvents: 'auto',
            lineHeight: 'var(--line-relaxed)',
          }}
        >
          {/* Arrow */}
          <div
            style={{
              position: 'absolute',
              [position.placement === 'top' ? 'bottom' : 'top']: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              [position.placement === 'top' ? 'borderBottom' : 'borderTop']: '8px solid var(--info)',
            }}
          />
          {/* Arrow inner (matches background) */}
          <div
            style={{
              position: 'absolute',
              [position.placement === 'top' ? 'bottom' : 'top']: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              [position.placement === 'top' ? 'borderBottom' : 'borderTop']: '6px solid var(--surface-elevated)',
            }}
          />
          {content}
        </div>,
        document.body
      )}
    </>
  );
}


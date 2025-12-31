import React, { useEffect, useRef, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

// Helper functions defined outside component to avoid hoisting issues
const getColors = (type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  switch (type) {
    case 'success':
      return {
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        shadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
      };
    case 'error':
      return {
        gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        shadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
      };
    case 'warning':
      return {
        gradient: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
        shadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
      };
    default:
      return {
        gradient: 'linear-gradient(135deg, var(--brand) 0%, #2563eb 100%)',
        shadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
      };
  }
};

const getIcon = (type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  switch (type) {
    case 'success':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'error':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'warning':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 9v3m0 3v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    default:
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
  }
};

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  title,
  message,
  type = 'info',
  onClose
}) => {
  const renderCountRef = useRef(0);
  const prevIsOpenRef = useRef(isOpen);
  const animationStartedRef = useRef(false);
  const [shouldAnimate, setShouldAnimate] = useState(isOpen);
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);

  // #region agent log
  useEffect(() => {
    renderCountRef.current += 1;
    const wasOpen = prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;
    if (isOpen && !wasOpen) {
      // Reset animation state when modal opens
      animationStartedRef.current = false;
      isClosingRef.current = false; // Reset closing flag when modal opens
      setShouldAnimate(true);
      // Prevent body scroll and repaints when modal is open
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift from scrollbar
    } else if (!isOpen && wasOpen) {
      // Reset when modal closes
      animationStartedRef.current = false;
      isClosingRef.current = false; // Reset closing flag when modal closes
      setShouldAnimate(false);
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    
    // Cleanup on unmount
    return () => {
      if (isOpen) {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }
    };
  }, [isOpen, type, shouldAnimate]);
  // #endregion

  // Memoize colors to prevent recalculation on every render
  const colors = useMemo(() => getColors(type), [type]);

  // Memoize overlay styles to prevent re-renders
  // Reduced blur to improve performance and prevent glitching
  const overlayStyle = useMemo(() => ({
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999, // Higher z-index to ensure modal is above everything
    padding: '20px',
    // Removed backdrop blur to prevent performance issues and glitching
    // backdropFilter: 'blur(4px)',
    // WebkitBackdropFilter: 'blur(4px)',
    // CSS optimizations to prevent repaints from dashboard affecting modal
    isolation: 'isolate' as const, // Create new stacking context
    contain: 'layout style paint' as const, // Isolate from parent layout recalculations
    transform: 'translateZ(0)' as const, // Force GPU layer to prevent repaints
    backfaceVisibility: 'hidden' as const // Prevent flickering
  }), []);

  // Memoize modal content style to prevent animation reset on re-renders
  const modalContentStyle = useMemo(() => ({
    background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-elevated) 100%)',
    border: '2px solid var(--border)',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '480px',
    width: '100%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    // Disable animation completely to prevent glitching from dashboard re-renders
    animation: 'none',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    // Prevent hover effects that could cause glitching
    pointerEvents: 'auto' as const,
    // Force GPU acceleration and prevent repaints
    transform: 'translateZ(0)' as const, // Force GPU layer
    backfaceVisibility: 'hidden' as const, // Prevent flickering
    isolation: 'isolate' as const, // Create new stacking context
    contain: 'layout style paint' as const // Isolate modal from parent layout recalculations
  }), [shouldAnimate, animationStartedRef.current]);

  // #region agent log
  // Track overlay repaints using ResizeObserver
  useEffect(() => {
    if (!isOpen || !overlayRef.current) return;
    
    const overlay = overlayRef.current;
    let repaintCount = 0;
    
    // Use ResizeObserver to detect layout changes (repaints)
    const resizeObserver = new ResizeObserver(() => {
      repaintCount++;
    });
    
    resizeObserver.observe(overlay);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [isOpen]);
  // #endregion

  if (!isOpen) return null;

  // Use portal to render modal outside dashboard DOM hierarchy to prevent re-render glitches
  return createPortal(
    <div 
      ref={overlayRef}
      style={overlayStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        ref={modalContentRef}
        style={modalContentStyle}
        onAnimationStart={(e) => {
          animationStartedRef.current = true;
        }}
        onAnimationEnd={(e) => {
          setShouldAnimate(false);
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: colors.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '16px',
            flexShrink: 0,
            boxShadow: colors.shadow
          }}>
            {getIcon(type)}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: '700',
              color: 'var(--text)',
              margin: '0 0 8px 0',
              letterSpacing: '-0.3px'
            }}>
              {title}
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              lineHeight: 'var(--line-snug)',
              fontSize: 'var(--font-size-base)',
              margin: 0,
              whiteSpace: 'pre-line'
            }}>
              {message}
            </p>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onTouchStart={(e) => {
              e.preventDefault(); // Prevent click event from firing on iOS
              e.stopPropagation();
              if (isClosingRef.current) return;
              isClosingRef.current = true;
              onClose();
              // Reset after a short delay to allow state update
              setTimeout(() => {
                isClosingRef.current = false;
              }, 300);
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isClosingRef.current) return;
              isClosingRef.current = true;
              onClose();
              // Reset after a short delay to allow state update
              setTimeout(() => {
                isClosingRef.current = false;
              }, 300);
            }}
            className="brand-button brand-button-primary"
            style={{
              padding: '12px 24px',
              background: colors.gradient,
              border: 'none',
              color: 'white',
              borderRadius: '12px',
              fontSize: 'var(--font-size-base)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: colors.shadow,
              minWidth: '100px',
              // iOS-specific: prevent double-tap zoom and ensure proper touch handling
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = colors.shadow.replace('0.3', '0.5');
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = colors.shadow;
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default React.memo(AlertModal);


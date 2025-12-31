import React, { useEffect, useRef, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type?: 'delete' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  type = 'info',
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  const renderCountRef = useRef(0);
  const prevIsOpenRef = useRef(isOpen);
  const animationStartedRef = useRef(false);
  const [shouldAnimate, setShouldAnimate] = useState(isOpen);
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  // #region agent log
  useEffect(() => {
    renderCountRef.current += 1;
    const wasOpen = prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;
    if (isOpen && !wasOpen) {
      // Reset animation state when modal opens
      animationStartedRef.current = false;
      setShouldAnimate(true);
      // Prevent body scroll and repaints when modal is open
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift from scrollbar
    } else if (!isOpen && wasOpen) {
      // Reset when modal closes
      animationStartedRef.current = false;
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
  }, [isOpen, type, isLoading, shouldAnimate]);
  // #endregion

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
    maxWidth: '520px',
    width: '100%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(245, 158, 11, 0.1)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    // Disable animation completely to prevent glitching from dashboard re-renders
    animation: 'none',
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
  }, [isOpen, isLoading]);
  // #endregion

  if (!isOpen) return null;

  // Use portal to render modal outside dashboard DOM hierarchy to prevent re-render glitches
  return createPortal(
    <div 
      ref={overlayRef}
      style={overlayStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onCancel();
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
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: type === 'delete' 
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
              : type === 'warning'
              ? 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)'
              : 'linear-gradient(135deg, var(--brand) 0%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '20px',
            boxShadow: type === 'delete' 
              ? '0 4px 12px rgba(239, 68, 68, 0.3)' 
              : type === 'warning'
              ? '0 4px 12px rgba(245, 158, 11, 0.3)'
              : '0 4px 12px rgba(37, 99, 235, 0.3)'
          }}>
            {type === 'delete' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v3m0 3v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : type === 'warning' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v3m0 3v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <h3 style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: '700',
            color: 'var(--text)',
            margin: '0 0 4px 0',
            letterSpacing: '-0.5px'
          }}>
            {title}
          </h3>
        </div>
        
        <p style={{
          color: 'var(--text-secondary)',
          lineHeight: 'var(--line-snug)',
          marginBottom: '24px',
          fontSize: 'var(--font-size-base)',
          fontWeight: '500'
        }}>
          {message}
        </p>
        
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="brand-button"
            style={{
              padding: '14px 28px',
              background: 'transparent',
              border: '2px solid var(--border)',
              color: 'var(--text-secondary)',
              borderRadius: '12px',
              fontSize: 'var(--font-size-base)',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
              transition: 'all 0.2s ease',
              minWidth: '100px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'var(--surface-elevated)';
                e.currentTarget.style.borderColor = 'var(--signal)';
                e.currentTarget.style.color = 'var(--signal)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="brand-button brand-button-primary"
            style={{
              padding: '14px 28px',
              background: type === 'delete' 
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                : 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
              border: type === 'delete' ? '2px solid #dc2626' : '2px solid var(--accent-warm)',
              color: 'white',
              borderRadius: '12px',
              fontSize: 'var(--font-size-base)',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: type === 'delete' 
                ? '0 4px 12px rgba(239, 68, 68, 0.3)' 
                : '0 4px 12px rgba(245, 158, 11, 0.3)',
              minWidth: '140px',
              height: '48px'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                if (type === 'delete') {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
                } else {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
                }
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                if (type === 'delete') {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                } else {
                  e.currentTarget.style.background = 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                }
              }
            }}
          >
            {isLoading && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}/>
              </svg>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default React.memo(ConfirmationModal);


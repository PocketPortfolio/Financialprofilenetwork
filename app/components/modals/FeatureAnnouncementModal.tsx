'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { trackFeatureAnnouncementView, trackFeatureUpgradeClick } from '../../lib/analytics/events';

interface FeatureAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeatureAnnouncementModal: React.FC<FeatureAnnouncementModalProps> = ({
  isOpen,
  onClose
}) => {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      if (typeof window !== 'undefined') {
        console.log('✅ FeatureAnnouncementModal opened');
      }
      setShouldAnimate(true);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
      }
      // Track modal view
      trackFeatureAnnouncementView();
    } else {
      setShouldAnimate(false);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    }

    return () => {
      if (isOpen && typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen]);

  const handleUpgrade = () => {
    trackFeatureUpgradeClick();
    onClose();
    router.push('/sponsor');
  };

  // Debug logging (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🔍 FeatureAnnouncementModal render:', { isOpen, shouldAnimate });
    }
  }, [isOpen, shouldAnimate]);

  if (!isOpen) {
    if (typeof window !== 'undefined') {
      console.log('⏸️ FeatureAnnouncementModal not rendering (isOpen=false)');
    }
    return null;
  }

  if (typeof window !== 'undefined') {
    console.log('🎨 FeatureAnnouncementModal rendering portal');
  }

  // Ensure we're on the client side before creating portal
  if (typeof document === 'undefined' || !document.body) {
    return null;
  }

  return createPortal(
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalContentRef}
        style={{
          background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-elevated) 100%)',
          border: '2px solid var(--accent-warm)',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(245, 158, 11, 0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero Icon */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 7C4 5.89543 4.89543 5 6 5H18C19.1046 5 20 5.89543 20 7V17C20 18.1046 19.1046 19 18 19H6C4.89543 19 4 18.1046 4 17V7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 12H16M8 8H12M8 16H12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 2V5M12 19V22M2 12H5M19 12H22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Headline */}
        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: 'var(--text)',
          margin: '0 0 16px 0',
          textAlign: 'center',
          letterSpacing: '-0.5px'
        }}>
          Your Data. Now Sovereign.
        </h2>

        {/* Body Copy */}
        <div style={{
          color: 'var(--text-secondary)',
          lineHeight: '1.7',
          marginBottom: '32px',
          fontSize: '16px',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 16px 0' }}>
            Pocket Portfolio now supports <strong style={{ color: 'var(--text)' }}>Bidirectional Google Drive Sync</strong>.
          </p>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: '0',
            textAlign: 'left',
            display: 'inline-block'
          }}>
            <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ color: 'var(--accent-warm)', fontSize: '20px', lineHeight: '1.2' }}>✓</span>
              <span><strong>🛠️ Hackable Data:</strong> Full read/write access to your raw JSON file.</span>
            </li>
            <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ color: 'var(--accent-warm)', fontSize: '20px', lineHeight: '1.2' }}>✓</span>
              <span><strong>Own Your Data:</strong> Zero vendor lock-in. Your Drive is your database. Developer-friendly JSON.</span>
            </li>
            <li style={{ marginBottom: '0', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ color: 'var(--accent-warm)', fontSize: '20px', lineHeight: '1.2' }}>✓</span>
              <span><strong>Corporate & Founder Exclusive:</strong> Upgrade to unlock.</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '14px 28px',
              background: 'transparent',
              border: '2px solid var(--border)',
              color: 'var(--text-secondary)',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '120px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--surface-elevated)';
              e.currentTarget.style.borderColor = 'var(--signal)';
              e.currentTarget.style.color = 'var(--signal)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            Maybe Later
          </button>
          <button
            onClick={handleUpgrade}
            style={{
              padding: '14px 32px',
              background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
              border: '2px solid var(--accent-warm)',
              color: 'white',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              minWidth: '180px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #f59e0b 0%, var(--accent-warm) 100%)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
            }}
          >
            Unlock Sovereign Sync
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default React.memo(FeatureAnnouncementModal);


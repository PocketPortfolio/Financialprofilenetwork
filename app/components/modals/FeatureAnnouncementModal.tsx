'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Lock, WifiOff, Check } from 'lucide-react';
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
    router.push('/sponsor?utm_source=feature_announcement_modal&utm_medium=system_alert');
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
          background: 'hsl(var(--card))',
          border: '2px solid hsl(var(--primary))',
          borderRadius: '2px',
          padding: '32px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px hsl(var(--primary) / 0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Tech Pattern */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.03,
            backgroundImage: 'radial-gradient(hsl(var(--primary)) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
            pointerEvents: 'none'
          }}
        />

        {/* Hero Icon - System Alert Style */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '24px',
          position: 'relative'
        }}>
          <div style={{
            position: 'relative',
            width: '80px',
            height: '80px',
            borderRadius: '6px',
            background: 'hsl(var(--primary) / 0.1)',
            border: '2px solid hsl(var(--primary) / 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px hsl(var(--primary) / 0.2)'
          }}>
            {/* Pulsing glow */}
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                background: 'hsl(var(--primary))',
                filter: 'blur(12px)',
                opacity: 0.2,
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                borderRadius: '6px'
              }}
            />
            <WifiOff 
              size={40} 
              style={{ 
                position: 'relative',
                color: 'hsl(var(--primary))',
                zIndex: 1
              }} 
            />
            {/* Notification Dot */}
            <span 
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                display: 'flex',
                width: '16px',
                height: '16px'
              }}
            >
              <span 
                style={{
                  position: 'absolute',
                  display: 'inline-flex',
                  height: '100%',
                  width: '100%',
                  borderRadius: '50%',
                  background: 'hsl(var(--primary))',
                  opacity: 0.75,
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              />
              <span 
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  borderRadius: '50%',
                  height: '16px',
                  width: '16px',
                  background: 'hsl(var(--primary))'
                }}
              />
            </span>
          </div>
        </div>

        {/* Headline - System Alert Style */}
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: 'hsl(var(--foreground))',
          margin: '0 0 8px 0',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'
        }}>
          System Alert: Local Storage Only
        </h2>

        <p style={{
          fontSize: '14px',
          color: 'hsl(var(--muted-foreground))',
          textAlign: 'center',
          margin: '0 0 24px 0',
          lineHeight: '1.5'
        }}>
          Your portfolio is currently trapped on this device.{' '}
          <span style={{ fontWeight: '600', color: 'hsl(var(--foreground))' }}>
            Data loss risk is non-zero.
          </span>
        </p>

        {/* Body Copy - Terminal Style */}
        <div style={{
          color: 'hsl(var(--muted-foreground))',
          lineHeight: '1.7',
          marginBottom: '32px',
          fontSize: '14px',
          background: 'hsl(var(--muted) / 0.3)',
          border: '1px solid hsl(var(--border))',
          borderRadius: '2px',
          padding: '16px'
        }}>
          <p style={{ margin: '0 0 16px 0', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
            Pocket Portfolio now supports <strong style={{ color: 'hsl(var(--primary))' }}>Bidirectional Google Drive Sync</strong>.
          </p>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: '0',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Check size={18} style={{ color: 'hsl(var(--primary))', flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong style={{ color: 'hsl(var(--foreground))' }}>🛠️ Hackable Data:</strong> Full read/write access to your raw JSON file.
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Check size={18} style={{ color: 'hsl(var(--primary))', flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong style={{ color: 'hsl(var(--foreground))' }}>Own Your Data:</strong> Zero vendor lock-in. Your Drive is your database. Developer-friendly JSON.
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Check size={18} style={{ color: 'hsl(var(--primary))', flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong style={{ color: 'hsl(var(--foreground))' }}>Corporate & Founder Exclusive:</strong> Upgrade to unlock.
              </span>
            </li>
          </ul>
        </div>

        {/* Trust Badge */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '24px',
            fontSize: '10px',
            color: 'hsl(var(--muted-foreground))',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          <ShieldAlert size={14} style={{ color: 'hsl(var(--primary))' }} />
          <span>AES-256 ENCRYPTED • ZERO-KNOWLEDGE</span>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: typeof window !== 'undefined' && window.innerWidth < 640 ? 'column' : 'row'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: '2px solid hsl(var(--border))',
              color: 'hsl(var(--muted-foreground))',
              borderRadius: '2px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: typeof window !== 'undefined' && window.innerWidth < 640 ? '100%' : '120px',
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'hsl(var(--muted))';
              e.currentTarget.style.borderColor = 'hsl(var(--primary))';
              e.currentTarget.style.color = 'hsl(var(--primary))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'hsl(var(--border))';
              e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
            }}
          >
            Maybe Later
          </button>
          <button
            onClick={handleUpgrade}
            style={{
              padding: '12px 24px',
              background: 'hsl(var(--primary))',
              border: 'none',
              color: 'hsl(var(--primary-foreground))',
              borderRadius: '2px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 0 15px hsl(var(--primary) / 0.3)',
              minWidth: typeof window !== 'undefined' && window.innerWidth < 640 ? '100%' : '180px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'hsl(var(--primary) / 0.9)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 0 20px hsl(var(--primary) / 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'hsl(var(--primary))';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 15px hsl(var(--primary) / 0.3)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
          >
            <Lock size={16} />
            Unlock Sovereign Sync
          </button>
        </div>

        {/* Bottom Status Bar */}
        <div 
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(to right, hsl(var(--primary) / 0.5), hsl(var(--primary) / 0.1), transparent)'
          }}
        />
      </div>
    </div>,
    document.body
  );
};

export default React.memo(FeatureAnnouncementModal);

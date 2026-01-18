'use client';

import React from 'react';
import { ShieldAlert, Lock, WifiOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTrades } from '../hooks/useTrades';
import { usePremiumTheme } from '../hooks/usePremiumTheme';
import { useGoogleDrive } from '../hooks/useGoogleDrive';

interface SyncUpgradeCTAProps {
  className?: string;
}

export default function SyncUpgradeCTA({ className = '' }: SyncUpgradeCTAProps) {
  const { isAuthenticated, user, signInWithGoogle } = useAuth();
  const { trades } = useTrades();
  const { tier } = usePremiumTheme();
  const { syncState } = useGoogleDrive();
  
  // Show if:
  // 1. Unauthenticated user with local trades, OR
  // 2. Authenticated free tier user without sync connected
  const hasLocalTrades = !isAuthenticated && trades.length > 0;
  const isFreeTierWithoutSync = isAuthenticated && 
    (tier === null || tier === 'codeSupporter' || tier === 'featureVoter') && 
    !syncState.isConnected;
  
  if (!hasLocalTrades && !isFreeTierWithoutSync) {
    return null;
  }

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      try {
        await signInWithGoogle();
      } catch (error) {
        console.error('Error signing up:', error);
      }
    } else {
      // Navigate to sponsor page for premium upgrade
      window.location.href = '/sponsor?utm_source=dashboard_sync_alert&utm_medium=system_alert';
    }
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div 
      className={`sync-upgrade-banner ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '2px',
        border: '2px solid hsl(var(--primary) / 0.3)',
        background: 'hsl(var(--card))',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
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
      
      <div 
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          padding: '20px',
          background: 'hsl(var(--card) / 0.5)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* LEFT: The "Problem" (System Alert) */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {/* Pulsing glow effect */}
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                background: 'hsl(var(--primary))',
                filter: 'blur(8px)',
                opacity: 0.2,
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            />
            <div 
              style={{
                position: 'relative',
                width: '48px',
                height: '48px',
                borderRadius: '6px',
                background: 'hsl(var(--primary) / 0.1)',
                border: '1px solid hsl(var(--primary) / 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'hsl(var(--primary))'
              }}
            >
              <WifiOff size={24} />
            </div>
            {/* Notification Dot */}
            <span 
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                display: 'flex',
                width: '12px',
                height: '12px'
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
                  height: '12px',
                  width: '12px',
                  background: 'hsl(var(--primary))'
                }}
              />
            </span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            <h3 
              style={{
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'hsl(var(--primary))',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: 0
              }}
            >
              System Alert: Local Storage Only
            </h3>
            <p 
              style={{
                fontSize: '13px',
                color: 'hsl(var(--muted-foreground))',
                lineHeight: '1.5',
                margin: 0,
                maxWidth: '100%'
              }}
            >
              Your portfolio is currently trapped on this device.{' '}
              <span style={{ fontWeight: '600', color: 'hsl(var(--foreground))' }}>
                Data loss risk is non-zero.
              </span>
              {' '}Establish a secure, encrypted uplink to the Sovereign Cloud.
            </p>
          </div>
        </div>

        {/* RIGHT: The "Solution" (Action) */}
        <div 
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '12px',
            width: isMobile ? '100%' : 'auto',
            alignItems: 'center'
          }}
        >
          <button
            onClick={handleUpgrade}
            style={{
              padding: '12px 24px',
              background: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '700',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              boxShadow: '0 0 15px hsl(var(--primary) / 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: isMobile ? '100%' : 'auto',
              justifyContent: 'center'
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
            {!isAuthenticated ? 'Initialize Sync' : 'Upgrade to Sync'}
          </button>
          
          {/* Trust Badge / Secondary Info - Hidden on mobile */}
          {!isMobile && (
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                fontSize: '10px',
                color: 'hsl(var(--muted-foreground))',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                padding: '0 8px',
                gap: '2px'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldAlert size={12} style={{ color: 'hsl(var(--primary))' }} />
                AES-256 ENCRYPTED
              </span>
              <span>ZERO-KNOWLEDGE</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Status Bar (Terminal Aesthetic) */}
      <div 
        style={{
          height: '2px',
          width: '100%',
          background: 'linear-gradient(to right, hsl(var(--primary) / 0.5), hsl(var(--primary) / 0.1), transparent)'
        }}
      />
    </div>
  );
}

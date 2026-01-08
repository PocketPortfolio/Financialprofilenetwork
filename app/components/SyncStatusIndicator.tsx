'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { usePremiumTheme } from '../hooks/usePremiumTheme';

const SyncStatusIndicator: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { tier } = usePremiumTheme();
  const [isDirectTraffic, setIsDirectTraffic] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Check if this is direct traffic (no referrer)
    if (typeof window !== 'undefined') {
      const referrer = document.referrer;
      setIsDirectTraffic(!referrer || referrer === window.location.href);
    }
  }, []);

  // Only show for free tier users on direct traffic
  const isFreeTier = !tier || (tier !== 'corporateSponsor' && tier !== 'foundersClub');
  const shouldShow = isDirectTraffic && isAuthenticated && isFreeTier;

  if (!shouldShow) return null;

  const handleClick = () => {
    router.push('/sponsor');
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        marginLeft: '12px'
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={handleClick}
        style={{
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          color: 'var(--text-secondary)',
          fontSize: '14px',
          fontWeight: '500'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-warm)';
          e.currentTarget.style.color = 'var(--accent-warm)';
          e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.background = 'transparent';
        }}
        aria-label="Google Drive Sync: Locked (Corporate/Founder Only)"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ opacity: 0.6 }}
        >
          <path
            d="M19 11H5M5 11L9 7M5 11L9 15M12 5L12 19M19 5L19 19M5 5L5 19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.3" />
        </svg>
        <span style={{ fontSize: '12px' }}>☁️</span>
      </button>

      {/* Tooltip - using OptimizedTooltip for better visibility */}
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 12px)',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--surface-elevated)',
            border: '2px solid var(--info)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text)',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-xl), 0 0 0 1px rgba(14, 165, 233, 0.1)',
            zIndex: 1400, // --z-popover
            pointerEvents: 'none',
            lineHeight: 'var(--line-relaxed)',
          }}
        >
          Google Drive Sync: Locked (Corporate/Founder Only)
          {/* Arrow */}
          <div
            style={{
              position: 'absolute',
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid var(--info)',
            }}
          />
          {/* Arrow inner (matches background) */}
          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid var(--surface-elevated)',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SyncStatusIndicator;


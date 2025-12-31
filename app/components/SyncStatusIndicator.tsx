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

      {/* Tooltip */}
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '8px',
            padding: '8px 12px',
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '12px',
            color: 'var(--text)',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          Google Drive Sync: Locked (Corporate/Founder Only)
          <div
            style={{
              position: 'absolute',
              bottom: '-4px',
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: '8px',
              height: '8px',
              background: 'var(--surface-elevated)',
              borderRight: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SyncStatusIndicator;


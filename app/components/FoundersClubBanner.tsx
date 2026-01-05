'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { usePremiumTheme } from '../hooks/usePremiumTheme';
import { getFoundersClubSpotsRemaining, isFoundersClubSoldOut } from '../lib/utils/foundersClub';

/**
 * Sticky banner showing Founders Club scarcity counter
 * Only visible to free/anonymous users on dashboard
 */
export default function FoundersClubBanner() {
  const { isAuthenticated, user } = useAuth();
  const { tier } = usePremiumTheme();
  const spotsRemaining = getFoundersClubSpotsRemaining();

  // Only show for free tier users (not corporate or founders club)
  const isFreeTier = !tier || (tier !== 'corporateSponsor' && tier !== 'foundersClub');
  
  if (!isFreeTier) {
    return null; // Don't show to premium users
  }

  if (isFoundersClubSoldOut()) {
    return null; // Don't show if sold out
  }

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: '#000000',
        color: '#f59e0b',
        padding: '12px 24px',
        textAlign: 'center',
        borderBottom: '2px solid #f59e0b',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: '700', letterSpacing: '0.5px' }}>
          🇬🇧 UK FOUNDERS CLUB: Batch 1 Closing. {spotsRemaining}/50 Lifetime Spots Remaining.
        </span>
        <Link
          href="/sponsor?utm_source=dashboard_banner&utm_medium=sticky_cta&utm_campaign=founders_club"
          style={{
            padding: '8px 20px',
            background: '#f59e0b',
            color: '#000000',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '700',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease',
            display: 'inline-block',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#d97706';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f59e0b';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Secure Lifetime Access £100
        </Link>
      </div>
    </div>
  );
}


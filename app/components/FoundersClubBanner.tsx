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
      className="founder-banner"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'hsl(var(--card))',
        color: 'hsl(var(--primary))',
        padding: '12px 24px',
        textAlign: 'center',
        borderBottom: `2px solid hsl(var(--primary))`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
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
            background: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '700',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease',
            display: 'inline-block',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'hsl(var(--primary) / 0.9)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'hsl(var(--primary))';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Secure Lifetime Access £100
        </Link>
      </div>
    </div>
  );
}


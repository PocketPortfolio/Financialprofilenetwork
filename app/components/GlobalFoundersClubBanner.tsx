'use client';

import React from 'react';
import Link from 'next/link';
import { usePremiumTheme } from '../hooks/usePremiumTheme';
import { useTrades } from '../hooks/useTrades';

/**
 * Global Founders Club banner shown on all pages.
 * Fixed at the very top, above all navigation.
 * Hidden for Corporate and UK Founders tier members.
 * PLG: Hidden until user has at least one trade (post-activation).
 */
export default function GlobalFoundersClubBanner() {
  const { tier, isLoading } = usePremiumTheme();
  const { trades } = useTrades();

  const isPaid = tier === 'corporateSponsor' || tier === 'foundersClub';
  const hasTrades = trades && trades.length > 0;
  // Do not show banner before activation (no trades yet)
  if (!isLoading && !isPaid && !hasTrades) {
    return null;
  }
  const showContent = !isLoading && !isPaid && hasTrades;
  const hidden = isLoading || isPaid || !hasTrades;

  return (
    <div
      className="founder-banner global-founders-banner"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1001,
        height: hidden ? 0 : undefined,
        minHeight: hidden ? 0 : undefined,
        overflow: 'hidden',
        visibility: hidden ? 'hidden' : 'visible',
        pointerEvents: hidden ? 'none' : 'auto',
        background: 'hsl(var(--card))',
        color: 'hsl(var(--primary))',
        padding: showContent ? '12px 24px' : 0,
        textAlign: 'center',
        borderBottom: showContent ? '2px solid hsl(var(--primary))' : 'none',
        boxShadow: showContent ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
        width: '100%',
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
          🇬🇧 UK FOUNDERS CLUB
        </span>
        <Link
          href="/sponsor?utm_source=global_banner&utm_medium=top_cta&utm_campaign=founders_club"
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
          Join Founders Club – £12/mo or £100/yr
        </Link>
      </div>
    </div>
  );
}

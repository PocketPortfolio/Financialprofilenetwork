'use client';

import React from 'react';
import Link from 'next/link';
import { getFoundersClubScarcityMessage } from '../lib/utils/foundersClub';
import { usePremiumTheme } from '../hooks/usePremiumTheme';

/** Approximate banner height so useStickyHeader can reserve space before content loads */
const BANNER_PLACEHOLDER_HEIGHT = 52;

/**
 * Global Founders Club banner shown on all pages.
 * Fixed at the very top, above all navigation.
 * Hidden for Corporate and UK Founders tier members.
 *
 * Always renders a DOM node with .founder-banner so useStickyHeader can find it
 * and attach ResizeObserver immediately (fixes nav disappearing in production when
 * tier check is slow and banner would otherwise mount after the hook's timeouts).
 */
export default function GlobalFoundersClubBanner() {
  const { tier, isLoading } = usePremiumTheme();

  const isPaid = tier === 'corporateSponsor' || tier === 'foundersClub';
  const showContent = !isLoading && !isPaid;
  // While loading: same height, invisible so header reserves space. Paid: 0 height so header at top.
  const hidden = isLoading || isPaid;

  return (
    <div
      className="founder-banner global-founders-banner"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1001,
        height: hidden ? (isPaid ? 0 : BANNER_PLACEHOLDER_HEIGHT) : undefined,
        minHeight: isPaid ? 0 : undefined,
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
          🇬🇧 UK FOUNDERS CLUB: Batch 1 Closing. {getFoundersClubScarcityMessage()} Lifetime Spots Remaining.
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
          Secure Lifetime Access £100
        </Link>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { getFoundersClubScarcityMessage } from '../lib/utils/foundersClub';

/**
 * Global Founders Club banner shown on all pages
 * Fixed at the very top, above all navigation
 */
export default function GlobalFoundersClubBanner() {
  return (
    <div
      className="founder-banner global-founders-banner"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1001, // Above header
        background: 'hsl(var(--card))',
        color: 'hsl(var(--primary))',
        padding: '12px 24px',
        textAlign: 'center',
        borderBottom: '2px solid hsl(var(--primary))',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
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

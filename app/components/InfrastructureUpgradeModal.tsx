'use client';

import React from 'react';
import Link from 'next/link';
import { usePremiumTheme } from '../hooks/usePremiumTheme';
import { getFoundersClubSpotsRemaining } from '../lib/utils/foundersClub';

interface InfrastructureUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  spotsRemaining?: number;
}

/**
 * "Infrastructure Upgrade" modal for Sovereign Sync gate
 * Shows when user tries to enable Sovereign Sync or import large CSV
 */
export default function InfrastructureUpgradeModal({ 
  isOpen, 
  onClose,
  spotsRemaining 
}: InfrastructureUpgradeModalProps) {
  const { tier } = usePremiumTheme();
  // Use provided spotsRemaining or get from single source of truth
  const currentSpotsRemaining = spotsRemaining ?? getFoundersClubSpotsRemaining();
  
  if (!isOpen) return null;

  // Don't show if user already has access
  const hasAccess = tier === 'corporateSponsor' || tier === 'foundersClub';
  if (hasAccess) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '600px',
          width: '100%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          border: '2px solid var(--border-warm)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h2
          style={{
            fontSize: '28px',
            fontWeight: '700',
            color: 'var(--text)',
            marginBottom: '16px',
            lineHeight: '1.2',
          }}
        >
          Unlock Infinite Data Sovereignty
        </h2>

        {/* Body */}
        <p
          style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            marginBottom: '24px',
          }}
        >
          Browser storage is limited. Sovereign Sync turns your Google Drive into an unlimited, encrypted database.
        </p>

        {/* Benefits List */}
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 24px 0',
          }}
        >
          <li
            style={{
              padding: '12px 0',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '20px', flexShrink: 0 }}>✅</span>
            <div>
              <strong style={{ color: 'var(--text)' }}>Bypass Browser Limits:</strong>
              <span style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>
                Import massive trade history files.
              </span>
            </div>
          </li>
          <li
            style={{
              padding: '12px 0',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '20px', flexShrink: 0 }}>✅</span>
            <div>
              <strong style={{ color: 'var(--text)' }}>Programmatic API:</strong>
              <span style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>
                Connect your own scripts and agents.
              </span>
            </div>
          </li>
          <li
            style={{
              padding: '12px 0',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '20px', flexShrink: 0 }}>✅</span>
            <div>
              <strong style={{ color: 'var(--text)' }}>Lifetime Security:</strong>
              <span style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>
                One payment, forever own your stack.
              </span>
            </div>
          </li>
        </ul>

        {/* Urgency Message */}
        <div
          style={{
            background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
            border: '2px solid var(--border-warm)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#000000',
              margin: 0,
            }}
          >
            Included with UK Founders Club. Only {currentSpotsRemaining} Spots Left.
          </p>
        </div>

        {/* CTA Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/sponsor?utm_source=infrastructure_modal&utm_medium=upgrade_cta&utm_campaign=sovereign_sync"
            style={{
              flex: 1,
              padding: '16px 24px',
              background: '#f59e0b',
              color: '#000000',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '700',
              textAlign: 'center',
              transition: 'all 0.2s ease',
              minWidth: '200px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#d97706';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f59e0b';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Upgrade to Sovereign - £100
          </Link>
          <button
            onClick={onClose}
            style={{
              padding: '16px 24px',
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--surface-elevated)';
              e.currentTarget.style.borderColor = 'var(--border-warm)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}


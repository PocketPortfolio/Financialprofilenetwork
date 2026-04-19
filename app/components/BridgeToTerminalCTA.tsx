'use client';

import React from 'react';
import { trackBridgeToTerminalCtaClick, trackBridgeToTerminalSecondaryClick } from '@/app/lib/analytics/events';

type BridgeToTerminalCTAProps = {
  title: string;
  subtitle: string;
  href: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  analytics?: {
    source: 'json_api' | 'import_page' | 'symbol_hub' | 'unknown';
    contextId?: string;
    bridgeVariant?: 'A' | 'B';
    bridgeHook?: 'sovereign' | 'local_first' | 'private_ledger';
  };
};

export default function BridgeToTerminalCTA({
  title,
  subtitle,
  href,
  primaryLabel = 'Open Terminal',
  secondaryHref,
  secondaryLabel = 'How it works',
  analytics,
}: BridgeToTerminalCTAProps) {
  return (
    <section
      style={{
        marginBottom: '24px',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(17, 20, 24, 0.35) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '14px',
        padding: '18px 18px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: '16px',
              letterSpacing: '-0.2px',
              color: 'var(--text)',
              marginBottom: '4px',
            }}
          >
            {title}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>{subtitle}</div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <a
            href={href}
            onClick={() => {
              if (!analytics) return;
              trackBridgeToTerminalCtaClick({
                source: analytics.source,
                destination: href,
                contextId: analytics.contextId,
                ctaId: 'open_terminal',
                bridgeVariant: analytics.bridgeVariant,
                bridgeHook: analytics.bridgeHook,
              });
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '40px',
              padding: '0 14px',
              background: 'var(--accent-warm)',
              color: 'var(--warning-muted)',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '0.01em',
              border: '1px solid rgba(245, 158, 11, 0.55)',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            {primaryLabel} →
          </a>

          {secondaryHref && (
            <a
              href={secondaryHref}
              onClick={() => {
                if (!analytics) return;
                trackBridgeToTerminalSecondaryClick({
                  source: analytics.source,
                  destination: secondaryHref,
                  contextId: analytics.contextId,
                  linkId: 'how_local_first_works',
                });
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '40px',
                padding: '0 14px',
                background: 'var(--surface)',
                color: 'var(--text)',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '13px',
                letterSpacing: '0.01em',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {secondaryLabel}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}


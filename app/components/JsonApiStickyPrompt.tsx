'use client';

import Link from 'next/link';
import { trackBridgeToTerminalCtaClick } from '@/app/lib/analytics/events';
import type { BridgeSurface } from '@/app/lib/seo/symbolRouteSurface';

type JsonApiStickyPromptProps = {
  dashboardHref: string;
  contextId: string;
  bridgeVariant?: 'A' | 'B';
  bridgeHook?: 'sovereign' | 'local_first' | 'private_ledger';
  bridgeSurface?: BridgeSurface;
  /** json-api: legacy sticky. symbol_hub: main /s/[symbol] asset pages. */
  pageSource?: 'json_api' | 'symbol_hub';
  /** Element id for [N] scroll target (defaults by pageSource). */
  scrollTargetId?: string;
};

/**
 * SEO-safe: does not hide JSON. Persistent bottom command line linking to Terminal (Y) or scroll to live preview (N).
 */
export default function JsonApiStickyPrompt({
  dashboardHref,
  contextId,
  bridgeVariant,
  bridgeHook,
  bridgeSurface,
  pageSource = 'json_api',
  scrollTargetId,
}: JsonApiStickyPromptProps) {
  const resolvedScrollId =
    scrollTargetId ?? (pageSource === 'symbol_hub' ? 'symbol-route-main' : 'json-api-live-preview-root');
  const analyticsSource = pageSource === 'symbol_hub' ? 'symbol_hub' : 'json_api';
  const dismissLabel =
    pageSource === 'symbol_hub' ? '[N] — jump to asset view' : '[N] — view raw JSON block';
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          maxWidth: '896px',
          margin: '0 auto',
          padding: '10px 16px calc(16px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '12px',
            lineHeight: 1.5,
            color: 'var(--text)',
            background: 'rgba(10, 10, 10, 0.94)',
            border: '1px solid var(--border-warm)',
            borderRadius: '12px',
            boxShadow: '0 0 24px rgba(245, 158, 11, 0.22)',
            padding: '12px 14px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ color: 'var(--accent-warm)', fontWeight: 600 }}>
            {'> system_ready. Initialize Sovereign reasoning for this asset?'}
          </span>
          <Link
            href={dashboardHref}
            onClick={() =>
              trackBridgeToTerminalCtaClick({
                source: analyticsSource,
                destination: dashboardHref,
                contextId,
                ctaId: 'sticky_terminal_prompt_y',
                bridgeVariant,
                bridgeHook,
                bridgeSurface: bridgeSurface ?? (pageSource === 'json_api' ? 'json_api' : 'hub'),
              })
            }
            style={{
              color: 'var(--accent-warm)',
              fontWeight: 700,
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            [Y]
          </Link>
          <span style={{ color: 'var(--text-secondary)' }}>— open Terminal</span>
          <button
            type="button"
            onClick={() =>
              document.getElementById(resolvedScrollId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontFamily: 'inherit',
              fontSize: '12px',
              cursor: 'pointer',
              borderRadius: '8px',
              padding: '4px 10px',
            }}
          >
            {dismissLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

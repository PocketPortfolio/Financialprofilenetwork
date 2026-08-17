'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';
import { SovereignHeader } from '@/app/components/dashboard/SovereignHeader';
import { useGoogleDrive } from '@/app/hooks/useGoogleDrive';

type Bucket = 'farm' | 'import' | 'brand' | 'enterprise' | 'wm_advisor' | 'other';

interface TelemetryPayload {
  generatedAt: string;
  windowDays: number;
  auth: { googleSa: boolean; googleSaEmail?: string | null; stripe: boolean };
  pin: { paidKeys: number; mrrGbp: number; day28Pass: boolean; configured: boolean };
  gsc: {
    siteUrl: string;
    startDate: string;
    endDate: string;
    totals: { clicks: number; impressions: number; ctr: number; position: number };
    topQueries: Array<{ query: string; clicks: number; impressions: number; ctr: number; position: number; bucket: Bucket }>;
    signalQueries: Array<{ query: string; clicks: number; ctr: number; bucket: Bucket }>;
    clickShare: Record<Bucket, { clicks: number; share: number }>;
  } | null;
  pageMix: { farmPageShare: number; importPageShare: number };
  ga4: {
    propertyId: string;
    sources: Array<{ sourceMedium: string; sessions: number; engagedSessions: number; avgEngagementSec: number }>;
    conversionEvents: Array<{ eventName: string; eventCount: number }>;
    enterpriseLandings: Array<{ landingPage: string; sessions: number; avgEngagementSec: number }>;
  } | null;
  warnings: string[];
}

function apiDisabledWarning(warnings: string[] | undefined, prefix: 'GSC' | 'GA4'): boolean {
  return Boolean(
    warnings?.some(
      (w) =>
        w.startsWith(`${prefix}:`) &&
        (/has not been used/i.test(w) || /is disabled/i.test(w) || /SERVICE_DISABLED/i.test(w)),
    ),
  );
}

const BUCKET_COLOR: Record<Bucket, string> = {
  farm: 'rgba(239, 68, 68, 0.15)',
  import: 'rgba(245, 158, 11, 0.18)',
  brand: 'rgba(245, 158, 11, 0.1)',
  enterprise: 'rgba(16, 185, 129, 0.15)',
  wm_advisor: 'rgba(245, 158, 11, 0.22)',
  other: 'transparent',
};

export default function AdminGrowthTelemetryPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const { syncState } = useGoogleDrive();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [data, setData] = useState<TelemetryPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!user) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }
      try {
        const token = await user.getIdTokenResult();
        setIsAdmin(token.claims.admin === true);
      } catch {
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };
    if (!loading) void run();
  }, [user, loading]);

  const load = useCallback(async () => {
    if (!isAdmin || !user) return;
    setLoadingData(true);
    setError(null);
    try {
      const token = await user.getIdToken(true);
      const res = await fetch(`/api/admin/telemetry?_=${Date.now()}`, {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load telemetry');
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load telemetry');
    } finally {
      setLoadingData(false);
    }
  }, [isAdmin, user]);

  useEffect(() => {
    if (isAdmin && !checkingAdmin) void load();
  }, [isAdmin, checkingAdmin, load]);

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--text)' }}>
        <SovereignHeader
          syncState={syncState.isSyncing ? 'syncing' : syncState.isConnected ? 'idle' : 'error'}
          lastSyncTime={syncState.lastSyncTime}
          user={user}
        />
        <p style={{ padding: '48px', textAlign: 'center', fontFamily: 'ui-monospace, monospace' }}>Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--text)' }}>
        <SovereignHeader
          syncState={syncState.isSyncing ? 'syncing' : syncState.isConnected ? 'idle' : 'error'}
          lastSyncTime={syncState.lastSyncTime}
          user={user}
        />
        <div style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 22, marginBottom: 12 }}>Access Denied</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            Admin claim required. Sign out/in after `npm run set-admin`.
          </p>
          <Link href="/dashboard" style={{ color: 'var(--accent-warm)' }}>
            Return to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const pin = data?.pin;
  const mix = data?.gsc?.clickShare;

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--text)' }}>
      <SovereignHeader
        syncState={syncState.isSyncing ? 'syncing' : syncState.isConnected ? 'idle' : 'error'}
        lastSyncTime={syncState.lastSyncTime}
        user={user}
      />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 80px' }}>
        <header style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p
              style={{
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--accent-warm)',
                fontFamily: 'ui-monospace, Menlo, monospace',
                marginBottom: 8,
              }}
            >
              Command HUD · last 28 days
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>Growth Telemetry</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 8, maxWidth: 640 }}>
              Live GSC + GA4 overlay. North star remains Board Triad — paid Stripe keys, not waitlist volume.
              Cached 2 minutes. Does not replace <Link href="/admin/analytics" style={{ color: 'var(--accent-warm)' }}>/admin/analytics</Link>.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            style={{
              alignSelf: 'flex-start',
              padding: '10px 16px',
              borderRadius: 8,
              border: '1px solid var(--accent-warm)',
              background: 'rgba(245, 158, 11, 0.12)',
              color: 'var(--accent-warm)',
              fontFamily: 'ui-monospace, monospace',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>
        </header>

        {error && (
          <p style={{ color: '#f87171', fontFamily: 'ui-monospace, monospace', marginBottom: 16 }}>{error}</p>
        )}
        {data?.warnings?.map((w) => (
          <p key={w} style={{ color: 'var(--accent-warm)', fontSize: 13, fontFamily: 'ui-monospace, monospace', marginBottom: 8 }}>
            {w}
          </p>
        ))}

        {loadingData && !data ? (
          <p style={{ fontFamily: 'ui-monospace, monospace' }}>Fetching GSC / GA4 / Stripe…</p>
        ) : null}

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            margin: '24px 0 32px',
          }}
        >
          <PinCard
            label="Paid Stripe keys"
            value={pin ? String(pin.paidKeys) : '—'}
            hint={pin?.day28Pass ? 'Day-28 gate PASS' : 'Day-28 gate FAIL · target ≥ 1'}
            pass={Boolean(pin?.day28Pass)}
          />
          <PinCard
            label="MRR (sponsor prices)"
            value={pin ? `£${pin.mrrGbp.toFixed(2)}` : '—'}
            hint="Stripe first-party · not GA4 MP"
          />
          <PinCard
            label="Farm query click share"
            value={mix ? `${Math.round(mix.farm.share * 100)}%` : '—'}
            hint="Target trending under 50%"
            pass={mix ? mix.farm.share < 0.5 : undefined}
          />
          <PinCard
            label="Import query click share"
            value={mix ? `${Math.round(mix.import.share * 100)}%` : '—'}
            hint="Target toward 15%"
            pass={mix ? mix.import.share >= 0.1 : undefined}
          />
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          <HudPanel title="GSC · top queries by clicks (signal vs noise)">
            {!data?.gsc ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                {apiDisabledWarning(data?.warnings, 'GSC')
                  ? 'Search Console API is disabled on GCP project 862430760996. Enable it as the project owner, wait ~1 minute, then Refresh.'
                  : `Add ${data?.auth?.googleSaEmail || 'the growth service account'} as a Search Console user on sc-domain:pocketportfolio.app (Restricted is enough). Then Refresh.`}
              </p>
            ) : (
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', fontFamily: 'ui-monospace, monospace' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th>Query</th>
                    <th>Clk</th>
                    <th>CTR</th>
                    <th>Bucket</th>
                  </tr>
                </thead>
                <tbody>
                  {data.gsc.topQueries.map((row) => (
                    <tr key={row.query} style={{ background: BUCKET_COLOR[row.bucket] }}>
                      <td style={{ padding: '6px 4px' }}>{row.query}</td>
                      <td>{row.clicks}</td>
                      <td>{(row.ctr * 100).toFixed(1)}%</td>
                      <td>{row.bucket}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {data?.gsc?.signalQueries?.length ? (
              <>
                <p style={{ marginTop: 16, fontSize: 12, color: 'var(--accent-warm)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  High-intent (import / brand / WM / enterprise)
                </p>
                <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 13 }}>
                  {data.gsc.signalQueries.slice(0, 3).map((row) => (
                    <li key={row.query}>
                      {row.query} · {row.clicks} clicks · {(row.ctr * 100).toFixed(1)}% CTR · {row.bucket}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </HudPanel>

          <HudPanel title="GA4 · source / medium">
            {!data?.ga4 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                {apiDisabledWarning(data?.warnings, 'GA4')
                  ? 'Analytics Data API is disabled on GCP project 862430760996. Enable it as the project owner, wait ~1 minute, then Refresh.'
                  : `Add ${data?.auth?.googleSaEmail || 'the growth service account'} as Viewer on GA4 property 501238770 (Admin → Property access management). Search Console Restricted is a different product. Then Refresh.`}
              </p>
            ) : (
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', fontFamily: 'ui-monospace, monospace' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th>Source / medium</th>
                    <th>Sess</th>
                    <th>Engaged</th>
                  </tr>
                </thead>
                <tbody>
                  {data.ga4.sources.map((row) => (
                    <tr key={row.sourceMedium}>
                      <td style={{ padding: '6px 4px' }}>{row.sourceMedium}</td>
                      <td>{Math.round(row.sessions)}</td>
                      <td>{Math.round(row.engagedSessions)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </HudPanel>

          <HudPanel title="Leading conversions (not waitlist)">
            {!data?.ga4 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>GA4 custom events: csv_import_success, newsroom_cta_click, advisor_tool, developer_utility_conversion.</p>
            ) : data.ga4.conversionEvents.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No keyed conversion events in this window.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, fontFamily: 'ui-monospace, monospace' }}>
                {data.ga4.conversionEvents.map((ev) => (
                  <li key={ev.eventName}>
                    {ev.eventName}: {ev.eventCount}
                  </li>
                ))}
              </ul>
            )}
          </HudPanel>

          <HudPanel title="LinkedIn / organic → enterprise landings">
            {!data?.ga4?.enterpriseLandings?.length ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                Watch /tier1designpartner, /architecture, /for/advisors, /import/*, /learn/*, /newsroom after the
                LinkedIn post.
              </p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, fontFamily: 'ui-monospace, monospace' }}>
                {data.ga4.enterpriseLandings.map((row) => (
                  <li key={row.landingPage}>
                    {row.landingPage} · {Math.round(row.sessions)} sess · {Math.round(row.avgEngagementSec)}s
                  </li>
                ))}
              </ul>
            )}
          </HudPanel>
        </div>

        <p style={{ marginTop: 28, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'ui-monospace, monospace' }}>
          {data?.generatedAt ? `Generated ${data.generatedAt}` : ''}
          {data?.gsc
            ? ` · Page farm share ${Math.round((data.pageMix.farmPageShare ?? 0) * 100)}% · Import page share ${Math.round((data.pageMix.importPageShare ?? 0) * 100)}%`
            : ' · Page mix waiting on GSC'}
        </p>
      </main>
    </div>
  );
}

function PinCard({
  label,
  value,
  hint,
  pass,
}: {
  label: string;
  value: string;
  hint: string;
  pass?: boolean;
}) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 12,
        border: '1px solid var(--border-subtle)',
        background: 'var(--surface)',
      }}
    >
      <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{label}</p>
      <p style={{ fontSize: 32, fontWeight: 800, color: pass === false ? '#f87171' : 'var(--accent-warm)', margin: '8px 0 4px' }}>
        {value}
      </p>
      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{hint}</p>
    </div>
  );
}

function HudPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        padding: 18,
        borderRadius: 12,
        border: '1px solid var(--border-subtle)',
        background: 'var(--surface)',
      }}
    >
      <h2 style={{ fontSize: 14, margin: '0 0 12px', color: 'var(--accent-warm)', fontFamily: 'ui-monospace, monospace' }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { generateMetadata as genMeta } from '@/app/lib/seo/meta';
import ProductionNavbar from '@/app/components/marketing/ProductionNavbar';
import BipApplyGate from './BipApplyGate';
import { BOARD_OF_INVESTORS, ORG } from '@/lib/canonical-claims';

export const metadata: Metadata = genMeta({
  title: 'Board of Investors (BIP)',
  description: `${BOARD_OF_INVESTORS.eyebrow} ${BOARD_OF_INVESTORS.subheadline}`,
  path: BOARD_OF_INVESTORS.path,
  image: `${ORG.url}${BOARD_OF_INVESTORS.ogImage}`,
});

const MONO: React.CSSProperties = {
  fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)',
};

const CARD: React.CSSProperties = {
  border: '1px solid var(--border-warm)',
  borderRadius: '12px',
  background: 'var(--surface)',
  padding: '18px',
};

const SCARCITY: React.CSSProperties = {
  border: '2px solid var(--accent-warm)',
  borderRadius: '12px',
  background: 'var(--background)',
  padding: '18px',
};

function SlotsRemaining({ maxSeats, remainingOverride }: { maxSeats: number; remainingOverride?: number }) {
  const remaining =
    typeof remainingOverride === 'number' && Number.isFinite(remainingOverride)
      ? Math.max(0, Math.min(maxSeats, Math.floor(remainingOverride)))
      : maxSeats;
  const filled = Math.max(0, maxSeats - remaining);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
      <div style={{ ...CARD, borderColor: 'var(--accent-warm)' }}>
        <p style={{ ...MONO, margin: 0, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-warm)' }}>
          Capacity
        </p>
        <p style={{ margin: '8px 0 0', fontSize: '20px', fontWeight: 900 }}>{maxSeats}</p>
      </div>
      <div style={{ ...CARD, borderColor: 'var(--accent-warm)' }}>
        <p style={{ ...MONO, margin: 0, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-warm)' }}>
          Filled
        </p>
        <p style={{ margin: '8px 0 0', fontSize: '20px', fontWeight: 900 }}>{filled}</p>
      </div>
      <div style={{ ...CARD, borderColor: 'var(--accent-warm)' }}>
        <p style={{ ...MONO, margin: 0, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-warm)' }}>
          Remaining
        </p>
        <p style={{ margin: '8px 0 0', fontSize: '20px', fontWeight: 900 }}>{remaining}</p>
      </div>
    </div>
  );
}

export default function BoardOfInvestorsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const slotsParamRaw = searchParams?.slots;
  const slotsParam = Array.isArray(slotsParamRaw) ? slotsParamRaw[0] : slotsParamRaw;
  const remainingOverride = typeof slotsParam === 'string' ? Number.parseInt(slotsParam, 10) : undefined;
  return (
    <>
      <ProductionNavbar />
      <main
        style={{
          maxWidth: '1040px',
          margin: '0 auto',
          padding: 'clamp(20px, 4vw, 48px) clamp(14px, 3vw, 28px)',
          color: 'var(--text)',
        }}
      >
        <header style={{ marginBottom: 'clamp(22px, 4vw, 36px)' }}>
          <p
            style={{
              ...MONO,
              margin: '0 0 10px',
              fontSize: '12px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--accent-warm)',
            }}
          >
            {BOARD_OF_INVESTORS.eyebrow}
          </p>
          <h1 style={{ margin: '0 0 10px', fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 900, letterSpacing: '-0.02em' }}>
            {BOARD_OF_INVESTORS.headline}
          </h1>
          <p style={{ margin: 0, fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {BOARD_OF_INVESTORS.subheadline}
          </p>
        </header>

        <section style={{ ...SCARCITY, marginBottom: 'clamp(20px, 4vw, 32px)' }}>
          <p style={{ ...MONO, margin: 0, fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-warm)' }}>
            Scarcity enforced
          </p>
          <h2 style={{ margin: '10px 0 14px', fontSize: '20px', fontWeight: 900 }}>
            Maximum {BOARD_OF_INVESTORS.maxSeats} seats
          </h2>
          <SlotsRemaining maxSeats={BOARD_OF_INVESTORS.maxSeats} remainingOverride={Number.isFinite(remainingOverride) ? remainingOverride : undefined} />
          <p style={{ margin: '14px 0 0', color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' }}>
            This is a governance board. We are selecting aligned operators and investors who reinforce the sovereign architecture mandate.
          </p>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: 'clamp(20px, 4vw, 32px)' }}>
          <article style={CARD}>
            <h3 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: 900 }}>FIN pillars (non-negotiable)</h3>
            <ol style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' }}>
              {BOARD_OF_INVESTORS.finPillars.map((p) => (
                <li key={p} style={{ marginBottom: '8px' }}>
                  {p}
                </li>
              ))}
            </ol>
          </article>

          <article style={CARD}>
            <h3 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: 900 }}>What you are backing</h3>
            <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' }}>
              <li>Open-source ingestion substrate (verifiable by clone-and-grep).</li>
              <li>Stateless inference posture that limits audit scope by design.</li>
              <li>Tier 1 design partnerships as the GTM wedge for institutional anchoring.</li>
            </ul>
          </article>
        </section>

        <section style={{ ...SCARCITY, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ flex: '1 1 320px' }}>
            <p style={{ ...MONO, margin: '0 0 8px', fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-warm)' }}>
              Next action
            </p>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' }}>
              If you align with the FIN pillars, start from the public substrate and then join the BIP conversation.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link
              href="/designchallenge"
              style={{
                background: 'var(--accent-warm)',
                color: '#1a1208',
                fontWeight: 800,
                padding: '12px 16px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '14px',
              }}
            >
              Start at /designchallenge →
            </Link>
            <Link
              href="/tier1designpartner"
              style={{
                border: '2px solid var(--accent-warm)',
                color: 'var(--accent-warm)',
                fontWeight: 800,
                padding: '12px 16px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '14px',
                background: 'transparent',
              }}
            >
              Read Tier 1 brief →
            </Link>
            <BipApplyGate />
          </div>
        </section>

        <section
          id="bip-apply"
          style={{
            ...CARD,
            marginTop: 'clamp(18px, 3vw, 26px)',
            background: 'var(--background)',
            scrollMarginTop: '90px',
          }}
          tabIndex={-1}
        >
          <p style={{ ...MONO, margin: 0, fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-warm)' }}>
            Application path
          </p>
          <h2 style={{ margin: '10px 0 8px', fontSize: '18px', fontWeight: 900 }}>Verified intent required</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' }}>
            When you click “Apply for investor seat,” we capture an email routing key plus first-touch attribution (no portfolio/trade payloads). The purpose is governance alignment, not data collection.
          </p>
        </section>
      </main>
    </>
  );
}


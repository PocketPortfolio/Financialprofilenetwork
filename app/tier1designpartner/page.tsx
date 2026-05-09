import type { Metadata } from 'next';
import Link from 'next/link';
import { generateMetadata as genMeta } from '@/app/lib/seo/meta';
import ProductionNavbar from '@/app/components/marketing/ProductionNavbar';
import { MOAT_CLAIMS, ORG, TIER1_DESIGN_PARTNER, URLS } from '@/lib/canonical-claims';
import Tier1IntentGate from './Tier1IntentGate';

export const metadata: Metadata = genMeta({
  title: 'Tier 1 Design Partner',
  description: `${TIER1_DESIGN_PARTNER.eyebrow} ${TIER1_DESIGN_PARTNER.subheadline}`,
  path: TIER1_DESIGN_PARTNER.path,
  image: `${ORG.url}${TIER1_DESIGN_PARTNER.ogImage}`,
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

const CALLOUT: React.CSSProperties = {
  border: '1px solid var(--accent-warm)',
  borderRadius: '12px',
  background: 'var(--background)',
  padding: '18px',
};

export default function Tier1DesignPartnerPage() {
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
            {TIER1_DESIGN_PARTNER.eyebrow}
          </p>
          <h1 style={{ margin: '0 0 10px', fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 900, letterSpacing: '-0.02em' }}>
            {TIER1_DESIGN_PARTNER.headline}
          </h1>
          <p style={{ margin: 0, fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {TIER1_DESIGN_PARTNER.subheadline}
          </p>
        </header>

        <section style={{ ...CALLOUT, marginBottom: 'clamp(20px, 4vw, 32px)' }}>
          <p style={{ ...MONO, margin: 0, fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-warm)' }}>
            Primary outcome
          </p>
          <h2 style={{ margin: '10px 0 8px', fontSize: '20px', fontWeight: 800 }}>
            Audit perimeter reduction — by architecture, not policy
          </h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' }}>
            This surface is intentionally dense. It is written for CTO, Security, and Compliance leaders who need to reduce critical third-party scope under EU DORA / GDPR by limiting data custody.
          </p>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: 'clamp(20px, 4vw, 32px)' }}>
          <article style={CARD}>
            <h3 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: 800 }}>Clean-room posture</h3>
            <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' }}>
              <li>Local-first ingestion: broker / custody exports parse in the user’s browser.</li>
              <li>Stateless inference: AI requests are processed without per-user server persistence.</li>
              <li>Partner/customer PII is not warehoused by Pocket Portfolio services.</li>
            </ul>
          </article>

          <article style={CARD}>
            <h3 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: 800 }}>Regulated vertical focus</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' }}>
              {TIER1_DESIGN_PARTNER.focusVerticals.join(' · ')}. The program is designed for environments where institutional trust and audit scope are the gating constraints.
            </p>
          </article>

          <article style={CARD}>
            <h3 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: 800 }}>Canonical claim</h3>
            <p style={{ margin: '0 0 8px', ...MONO, fontSize: '12px', color: 'var(--accent-warm)' }}>
              {MOAT_CLAIMS.limitedScopeProcessor.phrase}
            </p>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' }}>
              {MOAT_CLAIMS.limitedScopeProcessor.longForm}
            </p>
          </article>
        </section>

        <section style={{ ...CARD, marginBottom: 'clamp(20px, 4vw, 32px)' }}>
          <p style={{ ...MONO, margin: 0, fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-warm)' }}>
            PPI-METER/1
          </p>
          <h2 style={{ margin: '10px 0 8px', fontSize: '18px', fontWeight: 900 }}>Stateless metering (usage without data custody)</h2>
          <p style={{ margin: '0 0 14px', color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' }}>
            A Tier 1 partner needs billing, quotas, and governance without expanding audit scope. We meter capability usage without ingesting partner/customer PII.
          </p>
          <pre
            style={{
              margin: 0,
              padding: '14px',
              borderRadius: '10px',
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border-warm)',
              overflowX: 'auto',
              fontSize: '12px',
              lineHeight: 1.6,
              color: 'var(--text)',
              ...MONO,
            }}
          >
{`PPI-METER/1
Inputs: capability_id, event_type, timestamp, tenant_id, sku_id
Constraints:
  - no raw portfolio payloads
  - no customer identifiers
  - no PII fields (name/email/address/account numbers)
Output: counters for billing + governance (aggregate only)`}
          </pre>
        </section>

        <section style={{ ...CALLOUT, marginBottom: 'clamp(20px, 4vw, 32px)' }}>
          <p style={{ ...MONO, margin: 0, fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-warm)' }}>
            Regulatory posture
          </p>
          <h2 style={{ margin: '10px 0 8px', fontSize: '18px', fontWeight: 900 }}>EU DORA narrative: shrink the oversight surface</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' }}>
            Target posture: reduce partner oversight + exit-plan complexity by keeping customer data local and limiting third-party processing scope. DORA classification
            (critical vs non-critical ICT third party) remains a partner risk decision — our architecture is built to keep you on the non-critical side where feasible.
          </p>
        </section>

        <section style={{ ...CALLOUT, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ flex: '1 1 320px' }}>
            <p style={{ ...MONO, margin: '0 0 8px', fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-warm)' }}>
              Escalation path
            </p>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' }}>
              Start at the public challenge hub, then escalate to the seed governance board. Tier 1 engagement is verified without collecting portfolio/trade payloads.
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
              Review /designchallenge →
            </Link>
            <a
              href={URLS.architecture}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                border: '2px solid var(--accent-warm)',
                color: 'var(--accent-warm)',
                fontWeight: 900,
                padding: '12px 16px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '14px',
                background: 'transparent',
              }}
            >
              Architecture →
            </a>
            <Link
              href="/board-of-investors"
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
              Apply for Board of Investors →
            </Link>
          </div>
        </section>

        <section style={{ marginTop: 'clamp(18px, 3vw, 26px)' }}>
          <Tier1IntentGate />
        </section>
      </main>
    </>
  );
}


'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import OpenContactForm from './OpenContactForm';
import OpenLiveNpmStat from './OpenLiveNpmStat';
import OpenLandingVisual from './OpenLandingVisual';
import OpenStorySection from './OpenStorySection';
import { OPEN_LANDING_COPY } from '../../../lib/canonical-claims';
import { OPEN_LANDING_VISUALS } from '../../../lib/open-landing-visuals';

interface Receipt {
  value: string;
  label: string;
  citation: string;
}
interface Threat {
  headline: string;
  value: string;
  citation: string;
  context: string;
}
interface PackageSummary {
  name: string;
  description: string;
  category: 'core' | 'adapter';
}
interface SdkSummary {
  name: string;
  license: string;
  brokerAdapterCount: number;
}

export default function OpenLandingClient({
  copy,
  sdk,
  packages,
  receipts,
  threats,
}: {
  copy: typeof OPEN_LANDING_COPY;
  sdk: SdkSummary;
  packages: PackageSummary[];
  receipts: {
    mau: Receipt;
    allTimeDownloads: Receipt;
    scImpressions: Receipt;
    adapterFloor: Receipt;
  };
  threats: { gdpr: Threat; euAiAct: Threat; breach: Threat };
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <main
      id="open-landing-top"
      ref={containerRef}
      style={{
        background: 'var(--bg)',
        color: 'var(--text)',
        fontFamily: 'inherit',
        scrollMarginTop: '80px',
      }}
    >
      <Hero copy={copy} />
      <SubHero copy={copy} />
      <ThreatSection threats={threats} copy={copy} />
      <BridgeSection copy={copy} receipts={receipts} />
      <PillarsSection copy={copy} sdk={sdk} />
      <TracksSection copy={copy} />
      <PackagesSection sdk={sdk} packages={packages} />
      <ContactSection copy={copy} />
    </main>
  );
}

// ─── Reusable motion primitives ───────────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] as const },
};

const stagger = {
  initial: 'hidden',
  whileInView: 'show',
  viewport: { once: true, margin: '-80px' },
  variants: {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  },
};

const child = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] as const } },
};

const sectionStyle: React.CSSProperties = {
  padding: 'clamp(64px, 8vw, 112px) 24px',
  maxWidth: '1240px',
  margin: '0 auto',
};

const eyebrowStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '4px 12px',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--accent-warm)',
  border: '1px solid var(--accent-warm)',
  borderRadius: '4px',
  marginBottom: '24px',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ copy }: { copy: typeof OPEN_LANDING_COPY }) {
  return (
    <section style={{ ...sectionStyle, paddingBottom: 'clamp(40px, 6vw, 80px)' }}>
      <motion.div
        {...fadeUp}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: 'clamp(32px, 5vw, 56px)',
          alignItems: 'center',
        }}
      >
        <motion.div style={{ minWidth: 0 }}>
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={eyebrowStyle}
        >
          {copy.eyebrow}
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          style={{
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: '-0.03em',
            margin: '0 0 24px 0',
          }}
        >
          {copy.heroTitle}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{
            fontSize: 'clamp(18px, 1.6vw, 22px)',
            lineHeight: 1.55,
            color: 'var(--text-secondary)',
            margin: '0 0 32px 0',
            maxWidth: '720px',
          }}
        >
          {copy.heroBody}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/architecture"
              style={{
                display: 'inline-block',
                padding: '14px 24px',
                background: 'var(--accent-warm)',
                color: '#0b0d10',
                textDecoration: 'none',
                fontWeight: 700,
                borderRadius: '6px',
                fontSize: '15px',
                letterSpacing: '0.01em',
              }}
            >
              See how it works
            </Link>
          </motion.div>
          <Link
            href="#contact"
            scroll
            className="open-btn-secondary"
            style={{
              display: 'inline-block',
              padding: '14px 24px',
              fontWeight: 600,
              fontSize: '15px',
            }}
          >
            Request a briefing
          </Link>
        </motion.div>
        </motion.div>
        <OpenLandingVisual visual={OPEN_LANDING_VISUALS.hero} priority />
      </motion.div>
    </section>
  );
}

// ─── Sub-hero: AI + privacy ───────────────────────────────────────────────────

function SubHero({ copy }: { copy: typeof OPEN_LANDING_COPY }) {
  return (
    <OpenStorySection visual={OPEN_LANDING_VISUALS.subHero} visualPosition="left" band>
      <span style={eyebrowStyle}>{copy.subHero.eyebrow}</span>
      <h2
        style={{
          fontSize: 'clamp(28px, 3.5vw, 40px)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          margin: '0 0 20px 0',
        }}
      >
        {copy.subHero.title}
      </h2>
      <p
        style={{
          fontSize: '17px',
          lineHeight: 1.65,
          color: 'var(--text-secondary)',
          margin: '0 0 24px 0',
        }}
      >
        {copy.subHero.body}
      </p>
      <motion.div
        {...stagger}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {copy.subHero.tags.map((tag) => (
          <motion.span
            key={tag}
            variants={child}
            className="open-tag"
            style={{
              padding: '6px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              color: 'var(--text)',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            {tag}
          </motion.span>
        ))}
      </motion.div>
    </OpenStorySection>
  );
}

// ─── Threat scares ────────────────────────────────────────────────────────────

function ThreatSection({
  threats,
  copy,
}: {
  threats: { gdpr: Threat; euAiAct: Threat; breach: Threat };
  copy: typeof OPEN_LANDING_COPY;
}) {
  const cards: Threat[] = [threats.gdpr, threats.euAiAct, threats.breach];
  return (
    <section style={sectionStyle}>
      <motion.div {...fadeUp} style={{ maxWidth: '760px', marginBottom: '40px' }}>
        <span style={eyebrowStyle}>{copy.threat.eyebrow}</span>
        <h2
          style={{
            fontSize: 'clamp(28px, 3.5vw, 44px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            margin: '0 0 16px 0',
          }}
        >
          {copy.threat.title}
        </h2>
        <p
          style={{
            fontSize: '17px',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            margin: 0,
            maxWidth: '640px',
          }}
        >
          {copy.threat.body}
        </p>
      </motion.div>

      <motion.div {...fadeUp} style={{ marginBottom: '40px' }}>
        <OpenLandingVisual visual={OPEN_LANDING_VISUALS.threat} />
      </motion.div>

      <motion.div
        {...stagger}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        {cards.map((threat) => (
          <motion.article
            key={threat.citation}
            variants={child}
            whileHover={{ y: -4, borderColor: 'var(--accent-warm)' }}
            transition={{ duration: 0.2 }}
            style={{
              padding: '28px',
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '120px',
                height: '120px',
                background:
                  'radial-gradient(circle at top right, rgba(245,158,11,0.18) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                fontSize: '11px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                marginBottom: '14px',
              }}
            >
              {threat.headline}
            </div>
            <div
              style={{
                fontSize: 'clamp(28px, 3vw, 36px)',
                fontWeight: 800,
                color: 'var(--accent-warm)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                marginBottom: '12px',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {threat.value}
            </div>
            <p
              style={{
                fontSize: '13px',
                lineHeight: 1.55,
                color: 'var(--text-secondary)',
                margin: '0 0 16px 0',
              }}
            >
              {threat.context}
            </p>
            <div
              style={{
                fontSize: '10px',
                letterSpacing: '0.06em',
                color: 'var(--text-secondary)',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              {threat.citation}
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}

// ─── Bridge: Pocket Portfolio as the savior ───────────────────────────────────

function ReceiptCard({ r }: { r: Receipt }) {
  return (
    <motion.div
      variants={child}
      whileHover={{ scale: 1.02, borderColor: 'var(--accent-warm)' }}
      style={{
        padding: '20px',
        background: 'var(--bg)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
      }}
    >
      {r.citation === 'TRAC-01' ? (
        <OpenLiveNpmStat fallback={r.value} citation={r.citation} />
      ) : (
        <>
          <div
            style={{
              fontSize: 'clamp(22px, 2.6vw, 30px)',
              fontWeight: 800,
              color: 'var(--accent-warm)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em',
            }}
          >
            {r.value}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text)', marginTop: '4px' }}>{r.label}</div>
          <div
            style={{
              fontSize: '10px',
              color: 'var(--text-secondary)',
              marginTop: '6px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            {r.citation}
          </div>
        </>
      )}
    </motion.div>
  );
}

function BridgeSection({
  copy,
  receipts,
}: {
  copy: typeof OPEN_LANDING_COPY;
  receipts: {
    mau: Receipt;
    allTimeDownloads: Receipt;
    scImpressions: Receipt;
    adapterFloor: Receipt;
  };
}) {
  return (
    <OpenStorySection visual={OPEN_LANDING_VISUALS.bridge} visualPosition="right" band>
      <span style={{ ...eyebrowStyle, marginBottom: '20px' }}>
        {copy.threat.bridgeEyebrow}
      </span>
      <h2
        style={{
          fontSize: 'clamp(28px, 3.5vw, 40px)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          margin: '0 0 16px 0',
        }}
      >
        {copy.threat.bridgeTitle}
      </h2>
      <p
        style={{
          fontSize: '17px',
          lineHeight: 1.6,
          color: 'var(--text-secondary)',
          margin: '0 0 20px 0',
        }}
      >
        {copy.threat.bridgeBody}
      </p>
      <motion.a
        href="https://www.pocketportfolio.app/dashboard"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ x: 4 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--accent-warm)',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '15px',
          marginBottom: '28px',
        }}
      >
        See the consumer terminal in production
        <span aria-hidden>→</span>
      </motion.a>
      <motion.div
        {...stagger}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
        }}
      >
        {[receipts.mau, receipts.allTimeDownloads, receipts.scImpressions, receipts.adapterFloor].map(
          (r) => <ReceiptCard key={r.citation} r={r} />,
        )}
      </motion.div>
    </OpenStorySection>
  );
}

// ─── Pillars ──────────────────────────────────────────────────────────────────

function PillarsSection({
  copy,
  sdk,
}: {
  copy: typeof OPEN_LANDING_COPY;
  sdk: SdkSummary;
}) {
  return (
    <>
      <OpenStorySection visual={OPEN_LANDING_VISUALS.pillars} visualPosition="left">
        <h2
          style={{
            fontSize: 'clamp(28px, 3.5vw, 40px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          {copy.pillarsTitle}
        </h2>
        <p
          style={{
            fontSize: '17px',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            margin: '16px 0 0 0',
          }}
        >
          {copy.pillarsIntro}
        </p>
      </OpenStorySection>
      <section style={{ ...sectionStyle, paddingTop: 0 }}>
        <motion.div
          {...stagger}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {copy.pillars.map((pillar) => (
            <motion.div key={pillar.title} variants={child}>
              <PillarCard
                title={pillar.title}
                body={pillar.body.replace('19+', String(sdk.brokerAdapterCount) + '+')}
                href={pillar.href}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>
    </>
  );
}

function PillarCard({ title, body, href }: { title: string; body: string; href: string }) {
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.2 }} style={{ height: '100%' }}>
      <Link
        href={href}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: '28px',
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          textDecoration: 'none',
          color: 'inherit',
          transition: 'border-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-warm)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
        }}
      >
        <h3
          style={{
            fontSize: '20px',
            fontWeight: 700,
            margin: '0 0 12px 0',
            color: 'var(--text)',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: '14px',
            lineHeight: 1.65,
            color: 'var(--text-secondary)',
            margin: 0,
            flex: 1,
          }}
        >
          {body}
        </p>
        <motion.div
          style={{
            marginTop: '20px',
            fontSize: '12px',
            color: 'var(--accent-warm)',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          Read more →
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ─── Tracks ───────────────────────────────────────────────────────────────────

function TracksSection({ copy }: { copy: typeof OPEN_LANDING_COPY }) {
  return (
    <>
      <OpenStorySection visual={OPEN_LANDING_VISUALS.tracks} visualPosition="right" band>
        <h2
          style={{
            fontSize: 'clamp(28px, 3.5vw, 40px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          {copy.tracksTitle}
        </h2>
        <p
          style={{
            fontSize: '17px',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            margin: '16px 0 0 0',
          }}
        >
          {copy.tracksIntro}
        </p>
      </OpenStorySection>
      <section
        style={{
          background: 'var(--surface)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ ...sectionStyle, paddingTop: 0 }}>
          <motion.div
            {...stagger}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
            }}
          >
            {copy.tracks.map((t) => (
              <motion.div key={t.href} variants={child}>
                <TrackCard {...t} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}

function TrackCard({
  eyebrow,
  title,
  body,
  href,
}: {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
}) {
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.2 }} style={{ height: '100%' }}>
      <Link
        href={href}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: '24px',
          background: 'var(--bg)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          textDecoration: 'none',
          color: 'inherit',
          transition: 'border-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-warm)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
        }}
      >
        <div
          style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--accent-warm)',
            marginBottom: '10px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          {eyebrow}
        </div>
        <h3
          style={{
            fontSize: '17px',
            fontWeight: 700,
            margin: '0 0 10px 0',
            color: 'var(--text)',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: '13px',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            margin: 0,
            flex: 1,
          }}
        >
          {body}
        </p>
      </Link>
    </motion.div>
  );
}

// ─── Packages ─────────────────────────────────────────────────────────────────

function PackagesSection({
  sdk,
  packages,
}: {
  sdk: SdkSummary;
  packages: PackageSummary[];
}) {
  return (
    <OpenStorySection visual={OPEN_LANDING_VISUALS.packages} visualPosition="left">
      <h2
        style={{
          fontSize: 'clamp(28px, 3.5vw, 40px)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          margin: '0 0 12px 0',
        }}
      >
        The substrate, in {packages.length} packages.
      </h2>
      <p
        style={{
          fontSize: '15px',
          color: 'var(--text-secondary)',
          margin: '0 0 24px 0',
          maxWidth: '640px',
          lineHeight: 1.55,
        }}
      >
        One core SDK ({sdk.name}, {sdk.license}) plus broker-discovery adapter aliases that
        re-export the core for npm search engines.
      </p>
      <motion.ul
        {...stagger}
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '8px',
        }}
      >
        {packages.map((pkg) => (
          <motion.li
            key={pkg.name}
            variants={child}
            whileHover={{ borderColor: 'var(--accent-warm)' }}
            transition={{ duration: 0.15 }}
            style={{
              padding: '14px 16px',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              background: 'var(--surface)',
            }}
          >
            <a
              href={'https://www.npmjs.com/package/' + pkg.name}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: pkg.category === 'core' ? 'var(--accent-warm)' : 'var(--text)',
                textDecoration: 'none',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '13px',
                fontWeight: pkg.category === 'core' ? 700 : 500,
              }}
            >
              {pkg.name}
            </a>
            <p
              style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                margin: '4px 0 0 0',
                lineHeight: 1.45,
              }}
            >
              {pkg.description}
            </p>
          </motion.li>
        ))}
      </motion.ul>
    </OpenStorySection>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────

function ContactSection({ copy }: { copy: typeof OPEN_LANDING_COPY }) {
  return (
    <section
      id="contact"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        scrollMarginTop: '80px',
      }}
    >
      <OpenStorySection visual={OPEN_LANDING_VISUALS.contact} visualPosition="left">
        <span style={eyebrowStyle}>{copy.contact.eyebrow}</span>
        <h2
          style={{
            fontSize: 'clamp(28px, 3.5vw, 40px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            margin: '0 0 12px 0',
          }}
        >
          {copy.contact.title}
        </h2>
        <p
          style={{
            fontSize: '17px',
            lineHeight: 1.55,
            color: 'var(--text-secondary)',
            margin: '0 0 28px 0',
          }}
        >
          {copy.contact.body}
        </p>
        <OpenContactForm />
      </OpenStorySection>
    </section>
  );
}

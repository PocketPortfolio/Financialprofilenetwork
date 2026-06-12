'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import OpenContactForm from './OpenContactForm';
import OpenLandingProofVideo from './OpenLandingProofVideo';
import OpenLandingVisual from './OpenLandingVisual';
import { OPEN_LANDING_COPY } from '../../../lib/canonical-claims';
import { OPEN_LANDING_VISUALS } from '../../../lib/open-landing-visuals';

interface Threat {
  headline: string;
  value: string;
  citation: string;
  context: string;
}

export default function OpenLandingClient({
  copy,
  sdk,
  threats,
}: {
  copy: typeof OPEN_LANDING_COPY;
  sdk: { brokerAdapterCount: number };
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
      <ByocSection copy={copy} />
      <VideoProofSection copy={copy} />
      <IntegrationSection copy={copy} adapterCount={sdk.brokerAdapterCount} />
      <BoardMoatSection copy={copy} threats={threats} />
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

const primaryCtaStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '14px 24px',
  background: 'var(--accent-warm)',
  color: '#0b0d10',
  textDecoration: 'none',
  fontWeight: 700,
  borderRadius: '6px',
  fontSize: '15px',
  letterSpacing: '0.01em',
};

// ─── Phase 1: Hook ────────────────────────────────────────────────────────────

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
              fontSize: 'clamp(36px, 5.5vw, 64px)',
              fontWeight: 800,
              lineHeight: 1.05,
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
              maxWidth: '640px',
            }}
          >
            {copy.heroBody}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="#contact" scroll style={primaryCtaStyle}>
                {copy.heroCta}
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
        <OpenLandingVisual visual={OPEN_LANDING_VISUALS.hero} priority />
      </motion.div>
    </section>
  );
}

// ─── Phase 2: BYOC procurement block ──────────────────────────────────────────

function ByocSection({ copy }: { copy: typeof OPEN_LANDING_COPY }) {
  return (
    <section
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div style={sectionStyle}>
        <motion.div {...fadeUp}>
          <span style={eyebrowStyle}>{copy.byoc.eyebrow}</span>
          <h2
            style={{
              fontSize: 'clamp(28px, 3.5vw, 40px)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: '0 0 16px 0',
              maxWidth: '720px',
            }}
          >
            {copy.byoc.title}
          </h2>
          <p
            style={{
              fontSize: '17px',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              margin: '0 0 32px 0',
              maxWidth: '720px',
            }}
          >
            {copy.byoc.body}
          </p>
          <motion.ol
            {...stagger}
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 28px 0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
              counterReset: 'byoc-step',
            }}
          >
            {copy.byoc.points.map((point, index) => (
              <motion.li
                key={point.title}
                variants={child}
                style={{
                  padding: '24px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--accent-warm)',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    marginBottom: '10px',
                  }}
                >
                  {String(index + 1).padStart(2, '0')} · {point.title}
                </div>
                <p
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.55,
                    color: 'var(--text-secondary)',
                    margin: 0,
                  }}
                >
                  {point.body}
                </p>
              </motion.li>
            ))}
          </motion.ol>
          <p
            style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              margin: '0 0 16px 0',
              maxWidth: '720px',
            }}
          >
            {copy.byoc.footnote}
          </p>
          <Link
            href={copy.byoc.architectureHref}
            style={{
              color: 'var(--accent-warm)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '15px',
            }}
          >
            {copy.byoc.architectureLinkLabel}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Phase 3: Proof (video) ───────────────────────────────────────────────────

function VideoProofSection({ copy }: { copy: typeof OPEN_LANDING_COPY }) {
  return (
    <section
      style={{
        ...sectionStyle,
        paddingTop: 'clamp(32px, 4vw, 48px)',
        paddingBottom: 'clamp(48px, 6vw, 80px)',
      }}
    >
      <motion.div {...fadeUp}>
        <span style={eyebrowStyle}>{copy.proof.eyebrow}</span>
        <h2
          style={{
            fontSize: 'clamp(26px, 3.2vw, 38px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            margin: '0 0 16px 0',
            maxWidth: '720px',
          }}
        >
          {copy.proof.title}
        </h2>
        <p
          style={{
            fontSize: '17px',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            margin: '0 0 32px 0',
            maxWidth: '640px',
          }}
        >
          {copy.proof.body}
        </p>

        <div
          style={{
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            overflow: 'hidden',
            background: 'var(--surface)',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.25)',
          }}
        >
          <OpenLandingProofVideo />
        </div>

        <motion.div
          {...fadeUp}
          style={{ marginTop: '20px' }}
        >
          <Link
            href="/architecture"
            style={{
              color: 'var(--accent-warm)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '15px',
            }}
          >
            {copy.proof.architectureLinkLabel}
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Phase 3: Integration path ────────────────────────────────────────────────

function IntegrationSection({
  copy,
  adapterCount,
}: {
  copy: typeof OPEN_LANDING_COPY;
  adapterCount: number;
}) {
  const points = copy.integration.points.map((point) =>
    point.replace('{adapterCount}', String(adapterCount)),
  );

  return (
    <section
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div style={sectionStyle}>
        <motion.div {...fadeUp}>
          <span style={eyebrowStyle}>{copy.integration.eyebrow}</span>
          <h2
            style={{
              fontSize: 'clamp(28px, 3.5vw, 40px)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: '0 0 16px 0',
            }}
          >
            {copy.integration.title}
          </h2>
          <p
            style={{
              fontSize: '17px',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              margin: '0 0 32px 0',
              maxWidth: '640px',
            }}
          >
            {copy.integration.body}
          </p>
          <motion.ul
            {...stagger}
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            {points.map((point) => (
              <motion.li
                key={point}
                variants={child}
                style={{
                  padding: '20px 24px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 600,
                  lineHeight: 1.45,
                }}
              >
                <span style={{ color: 'var(--accent-warm)', marginRight: '8px' }} aria-hidden>
                  →
                </span>
                {point}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Phase 4: Board moat ──────────────────────────────────────────────────────

function ThreatCard({ threat }: { threat: Threat }) {
  return (
    <motion.article
      variants={child}
      whileHover={{ y: -4, borderColor: 'var(--accent-warm)' }}
      transition={{ duration: 0.2 }}
      style={{
        padding: '24px',
        background: 'var(--surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          marginBottom: '12px',
        }}
      >
        {threat.headline}
      </div>
      <div
        style={{
          fontSize: 'clamp(24px, 2.8vw, 32px)',
          fontWeight: 800,
          color: 'var(--accent-warm)',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          marginBottom: '10px',
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
          margin: '0 0 12px 0',
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
          paddingTop: '10px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        {threat.citation}
      </div>
    </motion.article>
  );
}

function BoardMoatSection({
  copy,
  threats,
}: {
  copy: typeof OPEN_LANDING_COPY;
  threats: { gdpr: Threat; euAiAct: Threat; breach: Threat };
}) {
  const threatCards: Threat[] = [threats.gdpr, threats.euAiAct, threats.breach];

  return (
    <section style={sectionStyle}>
      <motion.div {...fadeUp} style={{ maxWidth: '760px', marginBottom: '48px' }}>
        <span style={eyebrowStyle}>{copy.moat.eyebrow}</span>
        <h2
          style={{
            fontSize: 'clamp(28px, 3.5vw, 44px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            margin: '0 0 16px 0',
          }}
        >
          {copy.moat.title}
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
          {copy.moat.body}
        </p>
      </motion.div>

      <motion.div
        {...stagger}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          marginBottom: '56px',
        }}
      >
        {copy.moat.outcomes.map((outcome) => (
          <motion.article
            key={outcome.title}
            variants={child}
            style={{
              padding: '24px',
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
            }}
          >
            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 10px 0' }}>
              {outcome.title}
            </h3>
            <p
              style={{
                fontSize: '14px',
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
                margin: 0,
              }}
            >
              {outcome.body}
            </p>
          </motion.article>
        ))}
      </motion.div>

      <motion.div {...fadeUp} style={{ marginBottom: '40px' }}>
        <span style={{ ...eyebrowStyle, marginBottom: '16px' }}>{copy.moat.threatEyebrow}</span>
        <h3
          style={{
            fontSize: 'clamp(22px, 2.8vw, 30px)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            margin: '0 0 24px 0',
          }}
        >
          {copy.moat.threatTitle}
        </h3>
        <motion.div
          {...stagger}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          {threatCards.map((threat) => (
            <ThreatCard key={threat.citation} threat={threat} />
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        {...fadeUp}
        style={{
          padding: '32px',
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          borderLeft: '3px solid var(--accent-warm)',
        }}
      >
        <span style={{ ...eyebrowStyle, marginBottom: '16px' }}>
          {copy.moat.socialProofEyebrow}
        </span>
        <h3
          style={{
            fontSize: 'clamp(20px, 2.4vw, 26px)',
            fontWeight: 800,
            lineHeight: 1.2,
            margin: '0 0 12px 0',
          }}
        >
          {copy.moat.socialProofTitle}
        </h3>
        <p
          style={{
            fontSize: '15px',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            margin: '0 0 24px 0',
            maxWidth: '720px',
          }}
        >
          {copy.moat.socialProofBody}
        </p>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link href="#contact" scroll style={primaryCtaStyle}>
            {copy.moat.midCta}
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Phase 5: Contact snare ───────────────────────────────────────────────────

function ContactSection({ copy }: { copy: typeof OPEN_LANDING_COPY }) {
  return (
    <section
      id="contact"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border-subtle)',
        scrollMarginTop: '80px',
      }}
    >
      <div style={sectionStyle}>
        <motion.div {...fadeUp} style={{ maxWidth: '720px', margin: '0 auto' }}>
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
        </motion.div>
      </div>
    </section>
  );
}

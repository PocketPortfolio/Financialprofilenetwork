'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { VerifiedReceiptsSection } from '@/app/components/landing/VerifiedReceiptsSection';
import { trackEvent } from '@/app/lib/analytics/events';
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
      <ProofStrip copy={copy} adapterCount={sdk.brokerAdapterCount} />
      <ByocSection copy={copy} />
      <ArchitectureBoundarySection copy={copy} />
      <PocketHarnessSection copy={copy} />
      <ImplementationSection copy={copy} />
      <BoardMoatSection copy={copy} threats={threats} />
      <FaqSection copy={copy} />
      <ContactSection copy={copy} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: copy.faq.items.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          }),
        }}
      />
    </main>
  );
}

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

const secondaryCtaStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '14px 8px',
  color: 'var(--accent-warm)',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '15px',
};

const bodySecondary: React.CSSProperties = {
  fontSize: '17px',
  lineHeight: 1.6,
  color: 'rgba(232, 236, 243, 0.82)',
  margin: '0 0 32px 0',
  maxWidth: '720px',
};

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
              fontSize: 'clamp(32px, 5.2vw, 58px)',
              fontWeight: 800,
              lineHeight: 1.08,
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
            style={{ ...bodySecondary, marginBottom: 28 }}
          >
            {copy.heroBody}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="#contact"
                scroll
                style={primaryCtaStyle}
                onClick={() => trackEvent('homepage_diligence_cta_clicked', { location: 'hero' })}
              >
                {copy.heroCta}
              </Link>
            </motion.div>
            <Link
              href={copy.heroSecondaryHref}
              style={secondaryCtaStyle}
              onClick={() => trackEvent('homepage_architecture_clicked', { location: 'hero' })}
            >
              {copy.heroSecondaryCta} →
            </Link>
          </motion.div>
        </motion.div>
        <OpenLandingVisual visual={OPEN_LANDING_VISUALS.hero} priority />
      </motion.div>
    </section>
  );
}

function ProofStrip({
  copy,
  adapterCount,
}: {
  copy: typeof OPEN_LANDING_COPY;
  adapterCount: number;
}) {
  return (
    <section
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ ...sectionStyle, paddingTop: 'clamp(36px, 5vw, 56px)', paddingBottom: 'clamp(36px, 5vw, 56px)' }}>
        <motion.div {...fadeUp}>
          <span style={{ ...eyebrowStyle, marginBottom: 20 }}>{copy.proofStrip.eyebrow}</span>
          <motion.ul
            {...stagger}
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 20px 0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
            }}
          >
            {copy.proofStrip.items.map((item) => {
              const title = item.title.replace('{adapterCount}', String(adapterCount));
              return (
                <motion.li
                  key={title}
                  variants={child}
                  style={{
                    padding: '18px 20px',
                    background: 'var(--bg)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      marginBottom: 8,
                      lineHeight: 1.35,
                    }}
                  >
                    {title}
                  </div>
                  <p
                    style={{
                      fontSize: '13px',
                      lineHeight: 1.55,
                      color: 'rgba(232, 236, 243, 0.78)',
                      margin: 0,
                    }}
                  >
                    {item.body}
                  </p>
                </motion.li>
              );
            })}
          </motion.ul>
          <Link
            href={copy.proofStrip.architectureHref}
            style={{ color: 'var(--accent-warm)', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}
            onClick={() => trackEvent('homepage_architecture_clicked', { location: 'proof_strip' })}
          >
            {copy.proofStrip.architectureLinkLabel}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function ByocSection({ copy }: { copy: typeof OPEN_LANDING_COPY }) {
  return (
    <section style={sectionStyle}>
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
        <p style={bodySecondary}>{copy.byoc.body}</p>
        <motion.ol
          {...stagger}
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 28px 0',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          {copy.byoc.points.map((point, index) => (
            <motion.li
              key={point.title}
              variants={child}
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
                  color: 'rgba(232, 236, 243, 0.78)',
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
            color: 'rgba(232, 236, 243, 0.78)',
            margin: '0 0 16px 0',
            maxWidth: '720px',
          }}
        >
          {copy.byoc.footnote}
        </p>
        <Link
          href={copy.byoc.architectureHref}
          style={{ color: 'var(--accent-warm)', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}
          onClick={() => trackEvent('homepage_architecture_clicked', { location: 'byoc' })}
        >
          {copy.byoc.architectureLinkLabel}
        </Link>
      </motion.div>
    </section>
  );
}

function ArchitectureBoundaryDiagram({
  steps,
  boundaryLabel,
}: {
  steps: readonly string[];
  boundaryLabel: string;
}) {
  return (
    <div
      role="img"
      aria-label={`Architecture flow: ${steps.join(' to ')}. ${boundaryLabel}`}
      style={{
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        background: '#0b0d10',
        padding: 'clamp(20px, 3vw, 32px)',
        marginBottom: 24,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        {steps.map((step, index) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                padding: '10px 12px',
                border: index === 3 ? '1px solid var(--accent-warm)' : '1px solid var(--border-subtle)',
                borderRadius: 6,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 11,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: index >= 3 ? 'var(--accent-warm)' : 'rgba(232, 236, 243, 0.88)',
                maxWidth: 160,
                textAlign: 'center',
                lineHeight: 1.35,
              }}
            >
              {step}
            </div>
            {index < steps.length - 1 && (
              <span aria-hidden style={{ color: 'var(--accent-warm)', fontWeight: 700 }}>
                →
              </span>
            )}
          </div>
        ))}
      </div>
      <div
        style={{
          borderTop: '2px solid var(--accent-warm)',
          paddingTop: 14,
          textAlign: 'center',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 12,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--accent-warm)',
        }}
      >
        {boundaryLabel}
      </div>
    </div>
  );
}

function ArchitectureBoundarySection({ copy }: { copy: typeof OPEN_LANDING_COPY }) {
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
          <p style={bodySecondary}>{copy.proof.body}</p>

          <ArchitectureBoundaryDiagram
            steps={copy.proof.diagramSteps}
            boundaryLabel={copy.proof.boundaryLabel}
          />

          <div
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              overflow: 'hidden',
              background: 'var(--bg)',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.25)',
              marginBottom: 20,
            }}
          >
            <OpenLandingProofVideo />
          </div>

          <Link
            href="/architecture"
            style={{ color: 'var(--accent-warm)', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}
            onClick={() => trackEvent('homepage_architecture_clicked', { location: 'architecture_section' })}
          >
            {copy.proof.architectureLinkLabel}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function PocketHarnessSection({ copy }: { copy: typeof OPEN_LANDING_COPY }) {
  return (
    <section style={sectionStyle}>
      <motion.div
        {...fadeUp}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 'clamp(24px, 4vw, 40px)',
          alignItems: 'start',
        }}
      >
        <div>
          <span style={eyebrowStyle}>{copy.pocketHarness.eyebrow}</span>
          <h2
            style={{
              fontSize: 'clamp(26px, 3.2vw, 36px)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              margin: '0 0 16px 0',
            }}
          >
            {copy.pocketHarness.title}
          </h2>
          <p style={{ ...bodySecondary, marginBottom: 20 }}>{copy.pocketHarness.body}</p>
          <Link
            href={copy.pocketHarness.ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent-warm)', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}
            onClick={() => trackEvent('homepage_pocket_harness_clicked')}
          >
            {copy.pocketHarness.ctaLabel} →
          </Link>
        </div>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'grid',
            gap: 10,
          }}
        >
          {copy.pocketHarness.points.map((point) => (
            <li
              key={point}
              style={{
                padding: '14px 16px',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                background: 'var(--surface)',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <span style={{ color: 'var(--accent-warm)', marginRight: 8 }} aria-hidden>
                →
              </span>
              {point}
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}

function ImplementationSection({ copy }: { copy: typeof OPEN_LANDING_COPY }) {
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
          <span style={eyebrowStyle}>{copy.implementation.eyebrow}</span>
          <h2
            style={{
              fontSize: 'clamp(28px, 3.5vw, 40px)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: '0 0 16px 0',
            }}
          >
            {copy.implementation.title}
          </h2>
          <p style={bodySecondary}>{copy.implementation.body}</p>
          <motion.ul
            {...stagger}
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 24px 0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            {copy.implementation.points.map((point) => (
              <motion.li
                key={point.title}
                variants={child}
                style={{
                  padding: '20px 24px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px 0' }}>{point.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(232, 236, 243, 0.78)', margin: 0 }}>
                  {point.body}
                </p>
              </motion.li>
            ))}
          </motion.ul>
          <Link
            href={copy.implementation.ctaHref}
            style={{ color: 'var(--accent-warm)', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}
            onClick={() => trackEvent('homepage_sdk_proof_clicked')}
          >
            {copy.implementation.ctaLabel}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

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
          color: 'rgba(232, 236, 243, 0.72)',
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
          color: 'rgba(232, 236, 243, 0.78)',
          margin: '0 0 12px 0',
        }}
      >
        {threat.context}
      </p>
      <div
        style={{
          fontSize: '10px',
          letterSpacing: '0.06em',
          color: 'rgba(232, 236, 243, 0.65)',
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
        <p style={{ ...bodySecondary, margin: 0 }}>{copy.moat.body}</p>
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
            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 10px 0' }}>{outcome.title}</h3>
            <p
              style={{
                fontSize: '14px',
                lineHeight: 1.6,
                color: 'rgba(232, 236, 243, 0.78)',
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
            margin: '0 0 12px 0',
          }}
        >
          {copy.moat.threatTitle}
        </h3>
        <p style={{ ...bodySecondary, marginBottom: 24 }}>{copy.moat.threatIntro}</p>
        <motion.div
          {...stagger}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            marginBottom: 20,
          }}
        >
          {threatCards.map((threat) => (
            <ThreatCard key={threat.citation} threat={threat} />
          ))}
        </motion.div>
        <Link
          href={copy.moat.threatBriefHref}
          style={{ color: 'var(--accent-warm)', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}
        >
          {copy.moat.threatBriefLabel}
        </Link>
      </motion.div>

      <motion.div
        {...fadeUp}
        style={{
          padding: '32px',
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          borderLeft: '3px solid var(--accent-warm)',
          marginBottom: 40,
        }}
      >
        <span style={{ ...eyebrowStyle, marginBottom: '16px' }}>{copy.moat.socialProofEyebrow}</span>
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
            color: 'rgba(232, 236, 243, 0.82)',
            margin: '0 0 20px 0',
            maxWidth: '720px',
          }}
        >
          {copy.moat.socialProofBody}
        </p>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 24px 0',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          {copy.moat.evidenceItems.map((item) => (
            <li
              key={item}
              style={{
                padding: '6px 10px',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                fontSize: 12,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'rgba(232, 236, 243, 0.8)',
              }}
            >
              {item}
            </li>
          ))}
        </ul>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="#contact"
            scroll
            style={primaryCtaStyle}
            onClick={() => trackEvent('homepage_diligence_cta_clicked', { location: 'social_proof' })}
          >
            {copy.moat.midCta}
          </Link>
        </motion.div>
      </motion.div>

      <VerifiedReceiptsSection
        surface="open"
        title="Verified receipts (operator-grade)"
        subtitle="Curated feedback from the live harness — focused on compliance, procurement velocity, and boundary clarity."
      />
    </section>
  );
}

function FaqSection({ copy }: { copy: typeof OPEN_LANDING_COPY }) {
  return (
    <section
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ ...sectionStyle, maxWidth: 900 }}>
        <motion.div {...fadeUp}>
          <span style={eyebrowStyle}>{copy.faq.eyebrow}</span>
          <h2
            style={{
              fontSize: 'clamp(26px, 3.2vw, 36px)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              margin: '0 0 28px 0',
            }}
          >
            {copy.faq.title}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {copy.faq.items.map((item, index) => (
              <article
                key={item.question}
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  background: 'var(--bg)',
                  padding: '16px 18px',
                }}
                onFocus={() =>
                  trackEvent('homepage_faq_opened', { question: item.question.slice(0, 80), index })
                }
                tabIndex={0}
              >
                <h3 style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.4, margin: '0 0 10px 0' }}>
                  <span style={{ color: 'var(--accent-warm)', marginRight: 8 }} aria-hidden>
                    Q
                  </span>
                  {item.question}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: 'rgba(232, 236, 243, 0.82)',
                    fontSize: 14,
                    lineHeight: 1.6,
                  }}
                >
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
          <div style={{ marginTop: 24 }}>
            <Link
              href="/architecture"
              style={{ color: 'var(--accent-warm)', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}
              onClick={() => trackEvent('homepage_architecture_clicked', { location: 'faq' })}
            >
              Read the full architecture brief →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ContactSection({ copy }: { copy: typeof OPEN_LANDING_COPY }) {
  return (
    <section
      id="contact"
      style={{
        background: 'var(--bg)',
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
              color: 'rgba(232, 236, 243, 0.82)',
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

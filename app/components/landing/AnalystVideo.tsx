'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LandingProductVideo } from './LandingProductVideo';
import {
  POCKET_ANALYST_ASPECT_RATIO,
  getPocketAnalystVideoSrc,
  pocketAnalystLocalSrc,
  pocketAnalystPosterSrc,
} from '../../../lib/landing-product-video';
import { RETAIL_LANDING_COPY } from '@/lib/landing-retail-copy';
import type { LandingPageVariant } from '@/lib/landing-retail-variant';

type AnalystVideoProps = {
  variant?: LandingPageVariant;
};

export function AnalystVideo({ variant = 'control' }: AnalystVideoProps) {
  const isRetail = variant === 'retail';
  const retail = RETAIL_LANDING_COPY.analyst;
  const videoRef = useRef<HTMLDivElement>(null);
  const videoSrc = getPocketAnalystVideoSrc();

  const scrollToVideo = () => {
    videoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <section className="relative w-full overflow-hidden" style={{ padding: 'clamp(48px, 10vw, 96px) 0' }}>
      <div className="mobile-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 24px)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: 'clamp(32px, 6vw, 48px)',
            alignItems: 'center',
          }}
          className="analyst-video-grid"
        >
          {/* Copy side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '9999px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                color: 'var(--accent-warm, #f59e0b)',
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                width: 'fit-content',
              }}
            >
              <span style={{ position: 'relative', display: 'flex', height: 8, width: 8 }}>
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    background: 'var(--accent-warm, #f59e0b)',
                    opacity: 0.75,
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
                <span
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    borderRadius: '50%',
                    height: 8,
                    width: 8,
                    background: 'var(--accent-warm, #f59e0b)',
                  }}
                />
              </span>
              {isRetail ? retail.eyebrow : 'New: Pocket Analyst'}
            </div>

            <h2
              className="brand-text"
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                color: 'var(--text, hsl(var(--foreground)))',
              }}
            >
              {isRetail ? retail.headline : 'Your Personal Quantitative Analyst.'}
            </h2>

            <p
              style={{
                fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
                lineHeight: 1.6,
                color: 'var(--text-secondary, hsl(var(--muted-foreground)))',
                maxWidth: '28rem',
              }}
            >
              {isRetail
                ? retail.body
                : 'Ask complex financial questions. Get instant answers. Insights are built from a bounded portfolio summary — not your raw statements.'}
            </p>

            {!isRetail && (
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-secondary)', maxWidth: '28rem' }}>
                Pocket Analyst combines <strong style={{ color: 'var(--text)' }}>local-first</strong> privacy with{' '}
                <strong style={{ color: 'var(--text)' }}>Gemini &amp; OpenAI</strong> to answer questions about your
                portfolio, risks, and returns.
              </p>
            )}

            {isRetail && (
              <p
                style={{
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                  maxWidth: '28rem',
                  fontWeight: 500,
                }}
              >
                {retail.privacy}
              </p>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <Link
                href="/dashboard?utm_source=landing&utm_medium=analyst_video&utm_campaign=pocket_analyst"
                style={{
                  padding: '12px 24px',
                  borderRadius: '10px',
                  background: 'var(--accent-warm, #f59e0b)',
                  color: '#000',
                  fontSize: '15px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'filter 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'brightness(1.1)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = '';
                  e.currentTarget.style.transform = '';
                }}
              >
                {isRetail ? retail.tryCta : 'Try Ask AI'}
              </Link>
              <button
                type="button"
                onClick={scrollToVideo}
                style={{
                  padding: '12px 24px',
                  borderRadius: '10px',
                  background: 'transparent',
                  border: '2px solid var(--border-warm)',
                  color: 'var(--foreground)',
                  fontSize: '15px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.2s, color 0.2s, border-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface-hover, hsl(var(--muted)))';
                  e.currentTarget.style.borderColor = 'var(--accent-warm)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '';
                  e.currentTarget.style.borderColor = 'var(--border-warm)';
                }}
              >
                {isRetail ? retail.watchCta : 'Watch Demo'}
              </button>
            </div>
          </motion.div>

          {/* Video side: same size as hero video (max 900px, width 100%, height auto) */}
          <motion.div
            ref={videoRef}
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            style={{
              width: '100%',
              maxWidth: '900px',
              margin: '0 auto',
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
              border: '1px solid var(--border-warm)',
              background: '#000',
            }}
            className="group"
          >
            <div
              style={{
                position: 'absolute',
                inset: -4,
                background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(234,88,12,0.15) 100%)',
                borderRadius: 20,
                filter: 'blur(12px)',
                opacity: 0.5,
                transition: 'opacity 0.3s',
              }}
              className="group-hover:opacity-75"
              aria-hidden
            />
            <LandingProductVideo
              src={videoSrc}
              fallbackSrc={pocketAnalystLocalSrc()}
              posterSrc={pocketAnalystPosterSrc()}
              aspectRatio={POCKET_ANALYST_ASPECT_RATIO}
              borderRadius={14}
              show4KBadge
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

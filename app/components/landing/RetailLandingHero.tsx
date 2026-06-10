'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { LocalProcessingTerminal } from '@/app/components/LocalProcessingTerminal';
import { LandingProductVideo } from '@/app/components/landing/LandingProductVideo';
import { RETAIL_LANDING_COPY } from '@/lib/landing-retail-copy';
import {
  DASHBOARD_DEMO_ASPECT_RATIO,
  DASHBOARD_DEMO_POSTER,
  DASHBOARD_DEMO_CACHE_BUST,
  dashboardDemoLocalSrc,
} from '@/lib/landing-product-video';
import type { useLandingCsvDemo } from '@/app/hooks/useLandingCsvDemo';

type CsvDemo = ReturnType<typeof useLandingCsvDemo>;

type RetailLandingHeroProps = {
  isMobile: boolean;
  heroVideoSrc: string;
  csvDemo: CsvDemo;
};

export default function RetailLandingHero({ isMobile, heroVideoSrc, csvDemo }: RetailLandingHeroProps) {
  const copy = RETAIL_LANDING_COPY.hero;
  const snare = RETAIL_LANDING_COPY.foundersSnare;
  const demo = RETAIL_LANDING_COPY.productDemo;
  const csvDemoInputRef = useRef<HTMLInputElement>(null);

  const scrollToDropzone = () => {
    document.getElementById('retail-hero-dropzone')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => csvDemoInputRef.current?.click(), 280);
  };

  return (
    <main
      className="brand-surface brand-grid brand-grid-pulse mobile-container terminal-content-scope"
      style={{
        width: '100%',
        maxWidth: '100vw',
        padding: 'clamp(24px, 6vw, 60px) clamp(12px, 3vw, 24px)',
        paddingTop: isMobile ? 'calc(clamp(24px, 6vw, 60px) + 80px)' : undefined,
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflowX: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="brand-card mobile-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          width: '100%',
          maxWidth: 'min(1200px, 95vw)',
          margin: '0 auto clamp(40px, 8vw, 80px) auto',
          padding: 'clamp(20px, 4vw, 32px)',
          boxSizing: 'border-box',
        }}
      >
        <h1
          className="brand-text"
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 'bold',
            lineHeight: '1.1',
            marginBottom: '20px',
            letterSpacing: '-0.03em',
            maxWidth: '800px',
          }}
        >
          {copy.headline}
        </h1>

        <p
          className="brand-text-secondary"
          style={{
            fontSize: 'clamp(1.125rem, 2vw, 1.35rem)',
            lineHeight: '1.6',
            marginBottom: '20px',
            maxWidth: '720px',
            color: 'var(--text-secondary)',
          }}
        >
          {copy.subhead}
        </p>

        <div
          style={{
            width: '100%',
            maxWidth: '720px',
            marginBottom: '28px',
            padding: '14px clamp(12px, 3vw, 18px)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-warm)',
            background: 'rgba(245, 158, 11, 0.06)',
            fontSize: 'clamp(0.9375rem, 1.5vw, 1.0625rem)',
            lineHeight: '1.55',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            boxSizing: 'border-box',
          }}
        >
          {copy.privacyBand}
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'center',
            marginBottom: '28px',
            width: '100%',
          }}
        >
          <button
            type="button"
            onClick={scrollToDropzone}
            className="brand-button brand-button-primary"
            style={{
              padding: 'clamp(16px, 3vw, 20px) clamp(32px, 6vw, 48px)',
              background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
              color: 'white',
              borderRadius: '12px',
              fontSize: 'clamp(16px, 3vw, 18px)',
              fontWeight: 700,
              border: '2px solid var(--border-warm)',
              cursor: 'pointer',
              boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.4)',
            }}
          >
            {copy.primaryCta}
          </button>
          <Link
            href="/sponsor?utm_source=landing&utm_medium=hero_cta&utm_campaign=founders_club"
            className="brand-button"
            style={{
              padding: 'clamp(14px, 3vw, 18px) clamp(28px, 5vw, 40px)',
              background: 'transparent',
              border: '2px solid var(--border-warm)',
              color: 'var(--text-warm)',
              borderRadius: '12px',
              fontSize: 'clamp(15px, 3vw, 17px)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            {copy.secondaryCta}
          </Link>
        </div>

        <div style={{ width: '100%', maxWidth: '560px', marginBottom: '32px' }}>
          <input
            ref={csvDemoInputRef}
            type="file"
            accept=".csv,text/csv,text/plain"
            style={{ display: 'none' }}
            aria-hidden
            onChange={csvDemo.handleHeroDemoInputChange}
          />
          <div
            id="retail-hero-dropzone"
            role="button"
            tabIndex={0}
            aria-label={copy.dropzoneAria}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                csvDemoInputRef.current?.click();
              }
            }}
            onDragOver={csvDemo.handleHeroDropZoneDragOver}
            onDrop={csvDemo.handleHeroDropZoneDrop}
            onClick={() => csvDemoInputRef.current?.click()}
            style={{
              fontSize: '15px',
              lineHeight: 1.5,
              padding: 'clamp(20px, 4vw, 28px)',
              borderRadius: '12px',
              border: '2px dashed var(--accent-warm)',
              background: 'var(--surface-elevated)',
              color: 'var(--text)',
              cursor: 'pointer',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          >
            <span style={{ color: 'var(--accent-warm)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              {copy.primaryCta}
            </span>
            {copy.dropzoneHint}
          </div>

          {csvDemo.terminalActive && (
            <div style={{ marginTop: '14px', width: '100%' }}>
              <LocalProcessingTerminal
                key={csvDemo.terminalMountKey}
                active={csvDemo.terminalActive}
                onSequenceComplete={csvDemo.handleSanitizationSequenceComplete}
                style={{ maxHeight: 'none', minHeight: '140px' }}
              />
            </div>
          )}

          {csvDemo.showFoundersSnare && (
            <div
              style={{
                marginTop: '18px',
                padding: '18px 20px',
                borderRadius: '12px',
                border: '2px solid var(--border-warm)',
                background: 'linear-gradient(135deg, var(--surface) 0%, var(--warm-bg) 100%)',
                textAlign: 'center',
              }}
            >
              <p
                className="brand-text"
                style={{
                  margin: '0 0 14px 0',
                  fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                  fontWeight: 600,
                  lineHeight: 1.45,
                }}
              >
                {snare.headline}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                <Link
                  href="/sponsor?utm_source=landing&utm_medium=hero_dropzone&utm_campaign=founders_club"
                  className="brand-button brand-button-primary"
                  style={{
                    padding: '12px 22px',
                    background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: 600,
                    border: '2px solid var(--border-warm)',
                  }}
                >
                  {snare.primaryCta}
                </Link>
                <button
                  type="button"
                  onClick={csvDemo.dismissFoundersSnare}
                  style={{
                    padding: '12px 18px',
                    background: 'transparent',
                    border: '1px solid rgba(245, 158, 11, 0.38)',
                    borderRadius: '10px',
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  {snare.secondaryCta}
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ width: '100%', maxWidth: 'min(1100px, 100%)', marginTop: '24px' }}>
          <p
            style={{
              fontSize: 'clamp(0.9375rem, 1.5vw, 1.0625rem)',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
              maxWidth: '640px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {demo.caption}
          </p>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--muted)',
              marginBottom: '20px',
              maxWidth: '640px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {demo.metricsHint}
          </p>
          <div
            className="group"
            style={{ width: '100%', position: 'relative' }}
          >
            <div
              style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow:
                  '0 24px 64px rgba(0, 0, 0, 0.45), 0 0 40px rgba(245, 158, 11, 0.22)',
                border: '2px solid var(--border-warm)',
                background: '#050508',
              }}
            >
              <LandingProductVideo
                src={heroVideoSrc}
                fallbackSrc={dashboardDemoLocalSrc()}
                posterSrc={`${DASHBOARD_DEMO_POSTER}?v=${DASHBOARD_DEMO_CACHE_BUST}`}
                aspectRatio={DASHBOARD_DEMO_ASPECT_RATIO}
                variant="hero"
                show4KBadge
                borderRadius={14}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

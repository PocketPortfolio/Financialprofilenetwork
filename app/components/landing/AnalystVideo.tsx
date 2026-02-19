'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Same pattern as hero: set NEXT_PUBLIC_POCKET_ANALYST_VIDEO_URL to the full Cloudinary URL in .env.local and Vercel.
const RAW_VIDEO_URL =
  typeof process.env.NEXT_PUBLIC_POCKET_ANALYST_VIDEO_URL === 'string' &&
  process.env.NEXT_PUBLIC_POCKET_ANALYST_VIDEO_URL.trim() !== ''
    ? process.env.NEXT_PUBLIC_POCKET_ANALYST_VIDEO_URL.trim()
    : '';

// Trim Cloudinary video to 42 seconds (so_0 = start 0s, eo_42 = end 42s). Use slash after params so version/path is not parsed as transformation (fixes 404).
function trimTo42Seconds(url: string): string {
  if (!url.includes('res.cloudinary.com')) return url;
  const uploadIdx = url.indexOf('/upload/');
  if (uploadIdx === -1) return url;
  const insert = uploadIdx + '/upload/'.length;
  return url.slice(0, insert) + 'so_0,eo_42/' + url.slice(insert);
}
const DEFAULT_VIDEO_URL = RAW_VIDEO_URL ? trimTo42Seconds(RAW_VIDEO_URL) : '';

export function AnalystVideo() {
  const videoRef = useRef<HTMLDivElement>(null);

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
              New: Pocket Analyst
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
              Your Personal Quantitative Analyst.
            </h2>

            <p
              style={{
                fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
                lineHeight: 1.6,
                color: 'var(--text-secondary, hsl(var(--muted-foreground)))',
                maxWidth: '28rem',
              }}
            >
              Ask complex financial questions. Get instant answers. Your data never leaves the secure enclave.
            </p>

            <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-secondary)', maxWidth: '28rem' }}>
              Pocket Analyst combines <strong style={{ color: 'var(--text)' }}>local-first</strong> privacy with{' '}
              <strong style={{ color: 'var(--text)' }}>Gemini &amp; OpenAI</strong> to answer questions about your portfolio, risks, and returns.
            </p>

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
                Try Ask AI
              </Link>
              <button
                type="button"
                onClick={scrollToVideo}
                style={{
                  padding: '12px 24px',
                  borderRadius: '10px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  fontSize: '15px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface-hover, hsl(var(--muted)))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '';
                }}
              >
                Watch Demo
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
              border: '1px solid var(--border)',
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
            {DEFAULT_VIDEO_URL ? (
              <video
                src={DEFAULT_VIDEO_URL}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  objectFit: 'contain',
                  borderRadius: 14,
                }}
                onError={(e) => {
                  const video = e.target as HTMLVideoElement;
                  console.error('Pocket Analyst video load error:', video.error);
                }}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div
                style={{
                  aspectRatio: '16/9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 14,
                }}
              >
                Put video in public/pocketanalyst.mp4 → npm run upload-pocket-analyst-cloudinary → add printed URL to .env.local
              </div>
            )}
            <div
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                padding: '4px 8px',
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                borderRadius: 6,
                fontSize: 10,
                fontFamily: 'ui-monospace, monospace',
                color: 'rgba(255,255,255,0.85)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              4K
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

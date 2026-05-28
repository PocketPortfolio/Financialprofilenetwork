'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

type LandingProductVideoProps = {
  src: string;
  fallbackSrc: string;
  /** CSS aspect-ratio value, e.g. "3840 / 2098" — reserves space on mobile before decode. */
  aspectRatio: string;
  style?: CSSProperties;
  borderRadius?: number | string;
  show4KBadge?: boolean;
  /** First-frame / keyframe still shown until video can play (LCP + no flash). */
  posterSrc?: string;
  /** Hero: cinematic cover + ambient chrome; inline: letterboxed contain. */
  variant?: 'hero' | 'inline';
};

/**
 * Autoplaying landing demo clip — mobile-safe (playsInline + muted), CDN-first with local fallback.
 */
export function LandingProductVideo({
  src,
  fallbackSrc,
  aspectRatio,
  style,
  borderRadius = 0,
  show4KBadge = false,
  posterSrc,
  variant = 'inline',
}: LandingProductVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const isHero = variant === 'hero';

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const onReady = () => setReady(true);
    el.addEventListener('canplay', onReady);
    if (el.readyState >= 3) setReady(true);

    return () => el.removeEventListener('canplay', onReady);
  }, [src]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio,
        background: '#050508',
        borderRadius,
        overflow: 'hidden',
        isolation: 'isolate',
        ...style,
      }}
    >
      {isHero ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: -6,
            background:
              'linear-gradient(135deg, rgba(245,158,11,0.22) 0%, rgba(234,88,12,0.12) 45%, rgba(0,255,136,0.08) 100%)',
            filter: 'blur(20px)',
            opacity: 0.65,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      ) : null}

      {posterSrc && !ready ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterSrc}
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: isHero ? 'cover' : 'contain',
            zIndex: 1,
          }}
        />
      ) : null}

      <video
        ref={videoRef}
        key={src}
        src={src}
        poster={posterSrc}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-label="Product demo video"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit: isHero ? 'cover' : 'contain',
          zIndex: 2,
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.45s ease-out',
          transform: 'translateZ(0)',
        }}
        onLoadedData={() => setReady(true)}
        onError={(e) => {
          const video = e.currentTarget;
          console.error('Landing product video load error:', video.error);
          const fallbackPath = fallbackSrc.split('?')[0];
          if (!video.src.includes(fallbackPath)) {
            video.src = fallbackSrc;
          }
        }}
      >
        Your browser does not support the video tag.
      </video>

      {isHero ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 3,
            background:
              'radial-gradient(ellipse 85% 70% at 50% 45%, transparent 40%, rgba(0,0,0,0.35) 100%)',
          }}
        />
      ) : null}

      {isHero ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 4,
            opacity: 0.04,
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 3px)',
          }}
        />
      ) : null}

      {show4KBadge ? (
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 6,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              padding: '4px 10px',
              background: 'rgba(0,0,0,0.72)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 700,
              fontFamily: 'ui-monospace, monospace',
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.92)',
              border: '1px solid rgba(245,158,11,0.35)',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.15)',
            }}
          >
            4K UHD
          </div>
          {isHero ? (
            <div
              style={{
                padding: '3px 8px',
                background: 'rgba(245,158,11,0.12)',
                borderRadius: 4,
                fontSize: 9,
                fontFamily: 'ui-monospace, monospace',
                letterSpacing: '0.08em',
                color: 'var(--accent-warm, #f59e0b)',
                border: '1px solid rgba(245,158,11,0.25)',
              }}
            >
              LIVE DEMO
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

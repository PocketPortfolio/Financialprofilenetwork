'use client';

import type { CSSProperties } from 'react';

type LandingProductVideoProps = {
  src: string;
  fallbackSrc: string;
  /** CSS aspect-ratio value, e.g. "3840 / 2098" — reserves space on mobile before decode. */
  aspectRatio: string;
  style?: CSSProperties;
  borderRadius?: number | string;
  show4KBadge?: boolean;
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
}: LandingProductVideoProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio,
        background: '#000',
        borderRadius,
        overflow: 'hidden',
        ...style,
      }}
    >
      <video
        key={src}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-label="Product demo video"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit: 'contain',
        }}
        onError={(e) => {
          const video = e.currentTarget;
          console.error('Landing product video load error:', video.error);
          if (!video.src.includes(fallbackSrc)) {
            video.src = fallbackSrc;
          }
        }}
      >
        Your browser does not support the video tag.
      </video>
      {show4KBadge ? (
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
            pointerEvents: 'none',
          }}
        >
          4K
        </div>
      ) : null}
    </div>
  );
}

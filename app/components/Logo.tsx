'use client';

import React from 'react';
import Image from 'next/image';
import { useSurface } from './SurfaceProvider';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showWordmark?: boolean;
  className?: string;
  /**
   * Force a specific brand surface. When omitted, the surface is read from the
   * <SurfaceProvider> context (defaults to 'pocket' on the P. surface and is
   * set to 'open' inside app/open/layout.tsx).
   */
  variant?: 'pocket' | 'open';
}

// Unified brand mark: matches the marketing/email monogram (amber `P.` / `O.`
// on dark surface). Legacy variants under /brand/ are kept for internal use
// (e.g. maskable PWA icon, white-on-green email mark) but the product UI
// should always render the canonical asset for cross-channel consistency.
const LOGO_SRC: Record<'pocket' | 'open', string> = {
  pocket: '/brand/pp-icon.png',
  open: '/brand/op-icon.png',
};

const WORDMARK_TEXT: Record<'pocket' | 'open', string> = {
  pocket: 'Pocket Portfolio',
  open: 'Open Portfolio',
};

export default function Logo({ size = 'medium', showWordmark = true, className, variant }: LogoProps) {
  const contextSurface = useSurface();
  const resolved: 'pocket' | 'open' = variant ?? contextSurface;

  const sizeClasses = {
    small: { width: 36, height: 36 },
    medium: { width: 44, height: 44 },
    large: { width: 56, height: 56 },
  };

  const wordmarkSizeClass =
    size === 'small' ? 'brand-wordmark-small' : size === 'large' ? 'brand-wordmark-large' : '';

  const { width, height } = sizeClasses[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Image
        src={LOGO_SRC[resolved]}
        alt={WORDMARK_TEXT[resolved]}
        width={width}
        height={height}
        priority
        className={className}
        style={{
          marginRight: showWordmark ? '8px' : '0',
          borderRadius: '8px',
        }}
      />
      {showWordmark && (
        <span className={`brand-wordmark ${wordmarkSizeClass}`}>
          {WORDMARK_TEXT[resolved]}<span className="brand-wordmark-dot">.</span>
        </span>
      )}
    </div>
  );
}

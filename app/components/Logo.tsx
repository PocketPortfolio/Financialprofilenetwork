import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showWordmark?: boolean;
  className?: string;
}

// Unified brand mark: matches the marketing/email monogram (amber `P.` on
// dark surface). Legacy variants under /brand/ are kept for internal use
// (e.g. maskable PWA icon, white-on-green email mark) but the product UI
// should always render this asset for cross-channel consistency.
const LOGO_SRC = '/brand/pp-icon.png';

export default function Logo({ size = 'medium', showWordmark = true, className }: LogoProps) {
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
        src={LOGO_SRC}
        alt="Pocket Portfolio"
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
          Pocket Portfolio<span className="brand-wordmark-dot">.</span>
        </span>
      )}
    </div>
  );
}

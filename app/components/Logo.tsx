import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showWordmark?: boolean;
}

export default function Logo({ size = 'medium', showWordmark = true }: LogoProps) {
  const sizeClasses = {
    small: { width: 36, height: 36 },   // Increased from 24px for better visibility in mobile nav
    medium: { width: 44, height: 44 }, // Increased from 32px to match industry standards (40-48px range)
    large: { width: 56, height: 56 }   // Increased from 48px for hero sections
  };

  // Determine wordmark size class
  const wordmarkSizeClass = size === 'small' ? 'brand-wordmark-small' : size === 'large' ? 'brand-wordmark-large' : '';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Image
        src="/brand/pp-maskable.svg"
        alt="Pocket Portfolio"
        width={sizeClasses[size].width}
        height={sizeClasses[size].height}
        priority
        style={{ 
          marginRight: showWordmark ? '8px' : '0',
          filter: 'brightness(0.8) contrast(1.2)'
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
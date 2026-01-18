import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showWordmark?: boolean;
  className?: string;
}

export default function Logo({ size = 'medium', showWordmark = true, className }: LogoProps) {
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
        width={size === 'small' && (className?.includes('text-emerald') || className?.includes('emerald')) ? 32 : sizeClasses[size].width}
        height={size === 'small' && (className?.includes('text-emerald') || className?.includes('emerald')) ? 32 : sizeClasses[size].height}
        priority
        className={className}
        style={{ 
          marginRight: showWordmark ? '8px' : '0',
          width: size === 'small' && (className?.includes('text-emerald') || className?.includes('emerald')) ? '32px' : undefined,
          height: size === 'small' && (className?.includes('text-emerald') || className?.includes('emerald')) ? '32px' : undefined,
          filter: className?.includes('text-emerald') || className?.includes('emerald') 
            ? 'brightness(1.2) saturate(1.3) hue-rotate(90deg)' 
            : 'brightness(0.8) contrast(1.2)'
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
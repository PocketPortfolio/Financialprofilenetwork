import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showWordmark?: boolean;
}

export default function Logo({ size = 'medium', showWordmark = true }: LogoProps) {
  const sizeClasses = {
    small: { width: 24, height: 24 },
    medium: { width: 32, height: 32 },
    large: { width: 48, height: 48 }
  };

  const wordmarkHeight = size === 'small' ? 16 : size === 'large' ? 28 : 20;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Image
        src="/brand/pp-monogram.svg"
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
        <Image
          src="/brand/pp-wordmark.svg"
          alt="Pocket Portfolio"
          width={wordmarkHeight * (140 / 28)} // Maintain aspect ratio based on original 140x28
          height={wordmarkHeight}
          priority
          style={{
            filter: 'brightness(0.8) contrast(1.2)'
          }}
        />
      )}
    </div>
  );
}
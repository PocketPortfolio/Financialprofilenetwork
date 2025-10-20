'use client';

import React from 'react';
import Link from 'next/link';

interface WaitlistCTAProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  source: 'web:header' | 'web:footer';
  className?: string;
  children?: React.ReactNode;
}

export default function WaitlistCTA({ 
  variant = 'primary', 
  size = 'md', 
  source, 
  className = '',
  children 
}: WaitlistCTAProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'var(--brand)',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)',
          hoverBackground: '#2563eb'
        };
      case 'secondary':
        return {
          background: 'var(--chrome)',
          color: 'var(--text)',
          border: '1px solid var(--card-border)',
          boxShadow: 'none',
          hoverBackground: 'var(--card)'
        };
      case 'outline':
        return {
          background: 'linear-gradient(135deg, var(--surface) 0%, var(--warm-bg) 100%)',
          color: 'var(--text-warm)',
          border: '2px solid var(--border-warm)',
          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.2)',
          hoverBackground: 'linear-gradient(135deg, var(--warm-bg) 0%, #fef3c7 100%)',
          hoverColor: 'var(--text-warm)'
        };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '8px 16px',
          fontSize: '14px',
          borderRadius: '12px'
        };
      case 'md':
        return {
          padding: '12px 20px',
          fontSize: '14px',
          borderRadius: '12px'
        };
      case 'lg':
        return {
          padding: 'clamp(14px, 3vw, 16px) clamp(24px, 6vw, 32px)',
          fontSize: 'clamp(14px, 3vw, 16px)',
          borderRadius: '12px'
        };
      default:
        return {};
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const buttonStyles = {
    ...variantStyles,
    ...sizeStyles,
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
    ...(className.includes('flex-1') && { flex: '1 1 auto' }),
    ...(className.includes('min-w') && { minWidth: '200px' }),
    ...(className.includes('w-full') && { width: '100%' })
  };

  return (
    <Link 
      href={`/join?source=${source}`}
      style={buttonStyles}
      aria-label="Join our waitlist to get early access"
      onMouseEnter={(e) => {
        if (variantStyles.hoverBackground) {
          e.currentTarget.style.background = variantStyles.hoverBackground;
        }
        if (variantStyles.hoverColor) {
          e.currentTarget.style.color = variantStyles.hoverColor;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = variantStyles.background || 'transparent';
        e.currentTarget.style.color = variantStyles.color || 'var(--text)';
      }}
    >
      {children || 'Join Waitlist'}
    </Link>
  );
}

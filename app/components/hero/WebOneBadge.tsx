'use client';

import Link from 'next/link';

export function WebOneBadge() {
  return (
    <Link
      href="https://www.webone.one"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        marginTop: '16px',
        fontSize: '12px',
        fontWeight: '500',
        color: 'var(--text-secondary)',
        textDecoration: 'none',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '999px', // Pill shape
        transition: 'all 0.2s ease',
        backdropFilter: 'blur(8px)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#E1306C'; // Pink to match brand
        e.currentTarget.style.color = '#E1306C';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.color = 'var(--text-secondary)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <span style={{
        position: 'relative',
        display: 'flex',
        width: '8px',
        height: '8px'
      }}>
        <span style={{
          position: 'absolute',
          display: 'inline-flex',
          width: '100%',
          height: '100%',
          background: '#3b82f6',
          borderRadius: '50%',
          opacity: 0.75,
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}></span>
        <span style={{
          position: 'relative',
          display: 'inline-flex',
          width: '8px',
          height: '8px',
          background: '#3b82f6',
          borderRadius: '50%'
        }}></span>
      </span>
      <span>Featured on <strong>WebOne</strong> (1EO Trusted)</span>
    </Link>
  );
}









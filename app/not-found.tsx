'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ProductionNavbar from './components/marketing/ProductionNavbar';

export default function NotFound() {
  const pathname = usePathname();


  return (
    <>
      <ProductionNavbar />
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'var(--bg)',
        color: 'var(--text)'
      }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 4vw, 4rem)',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: 'var(--text)'
        }}>
          404
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: 'var(--text-secondary)',
          marginBottom: '32px',
          textAlign: 'center',
          maxWidth: '600px'
        }}>
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link 
          href="/"
          style={{
            padding: '12px 24px',
            background: 'var(--accent-warm)',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'opacity 0.2s'
          }}
        >
          Go Home
        </Link>
      </div>
    </>
  );
}


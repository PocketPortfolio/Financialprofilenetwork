'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '../Logo';
import { getDeviceInfo } from '../../lib/utils/device';
import { useStickyHeader } from '../../hooks/useStickyHeader';

const GITHUB_REPO = 'https://github.com/PocketPortfolio/Financialprofilenetwork';
// You can fetch this dynamically from GitHub API if needed
const GITHUB_STARS = '⭐ 1.2k'; // Placeholder - fetch from API

export default function MarketingNavbar() {
  const [isMobile, setIsMobile] = useState(false);

  // Device detection for responsive logo sizing
  useEffect(() => {
    const deviceInfo = getDeviceInfo();
    setIsMobile(deviceInfo.isMobile);
  }, []);

  // Ensure header stays visible when scrolling
  useStickyHeader('nav[style*="position: sticky"]');
  return (
    <nav
      style={{
        height: '64px',
        background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-elevated) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-6)',
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Left: Brand */}
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          textDecoration: 'none',
          color: 'var(--text)',
          flexShrink: 0
        }}
        aria-label="Pocket Portfolio Homepage"
      >
        <Logo size={isMobile ? "small" : "medium"} showWordmark={false} />
        <span className="brand-wordmark">
          Pocket Portfolio<span className="brand-wordmark-dot">.</span>
        </span>
        <span
          style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--signal)',
            border: '1px solid var(--signal)',
            borderRadius: '12px',
            padding: '2px 8px',
            lineHeight: 1.2
          }}
        >
          Open Source
        </span>
      </Link>

      {/* Center: Empty (as per spec) */}
      <div style={{ flex: 1 }} />

      {/* Right: Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          flexShrink: 0
        }}
      >
        {/* GitHub Star Button (Mobile: Hidden) */}
        <a
          href={GITHUB_REPO}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text)',
            textDecoration: 'none',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            background: 'var(--surface-elevated)',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--signal)';
            e.currentTarget.style.color = 'var(--signal)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text)';
          }}
          aria-label="Star on GitHub"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ flexShrink: 0 }}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="github-stars-text">
            {GITHUB_STARS}
          </span>
        </a>

        {/* Primary CTA */}
        <Link
          href="/dashboard"
          className="brand-button brand-button-primary"
          style={{
            padding: 'var(--space-2) var(--space-4)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-medium)',
            borderRadius: '9999px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            whiteSpace: 'nowrap'
          }}
        >
          Go to Dashboard
        </Link>
      </div>
    </nav>
  );
}


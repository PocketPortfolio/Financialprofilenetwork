'use client';

import PocketLandingVisual from './PocketLandingVisual';
import { pocketVisual } from '@/lib/pocket-landing-visuals';
import { pocketLandingHeadingStyle } from '@/lib/pocket-landing-theme';

export default function CommunitySection() {
  return (
    <section
      id="community"
      className="pocket-landing-sota"
      style={{ marginBottom: '120px', textAlign: 'center' }}
    >
      <h2
        style={{
          ...pocketLandingHeadingStyle,
          fontSize: 'clamp(2rem, 4vw, 2.25rem)',
          fontWeight: 'bold',
          marginBottom: '24px',
          letterSpacing: '-0.02em',
        }}
      >
        Built with community
      </h2>
      <p
        style={{
          fontSize: 'clamp(1.125rem, 2vw, 1.25rem)',
          color: 'var(--muted)',
          lineHeight: '1.6',
          maxWidth: '800px',
          margin: '0 auto 32px',
        }}
      >
        Pocket Portfolio is open source. Contribute features, fix bugs, propose ideas, or help with
        docs. We keep the roadmap transparent and welcome first-time contributors.
      </p>

      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto 40px',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <PocketLandingVisual visual={pocketVisual('community')} />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          marginBottom: '48px',
          flexWrap: 'wrap',
        }}
      >
        <a
          href="https://github.com/PocketPortfolio/Financialprofilenetwork"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '12px 24px',
            background: 'var(--accent-warm)',
            color: 'var(--surface-elevated)',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '500',
          }}
        >
          GitHub
        </a>
        <a
          href="https://discord.gg/Ch9PpjRzwe"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: '2px solid color-mix(in srgb, var(--accent-warm) 35%, transparent)',
            color: 'var(--text)',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '500',
          }}
        >
          Join Discord
        </a>
      </div>
      <ul
        style={{
          textAlign: 'left',
          color: 'var(--muted)',
          lineHeight: '1.6',
          display: 'inline-block',
          paddingLeft: '0',
          listStyle: 'none',
        }}
      >
        <li style={{ marginBottom: '8px' }}>• Public roadmap & issues</li>
        <li style={{ marginBottom: '8px' }}>• Good-first-issue labels</li>
        <li style={{ marginBottom: '8px' }}>• Code of Conduct & governance</li>
      </ul>
    </section>
  );
}

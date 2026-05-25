'use client';

import Link from 'next/link';
import DashboardLaunchLink from '@/app/components/nav/DashboardLaunchLink';
import ScrollReveal from '@/app/components/ui/ScrollReveal';
import PocketLandingVisual from './PocketLandingVisual';
import { pocketVisual } from '@/lib/pocket-landing-visuals';

const OBSIDIAN = '#09090b';
const CARD_SHELL: React.CSSProperties = {
  background: OBSIDIAN,
  border: '1px solid rgba(245, 158, 11, 0.18)',
  borderRadius: '16px',
  padding: 'clamp(20px, 4vw, 28px)',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
};

const PORTAL_CARDS = [
  {
    visualId: 'portalTerminal' as const,
    title: 'The Terminal',
    body: 'Track net worth across 50+ brokers. Autonomous research by Pulitzer AI. 800+ weekly briefs. Human-verified.',
    cta: (
      <DashboardLaunchLink
        style={{
          padding: '12px 24px',
          background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: '600',
          textAlign: 'center',
          border: '2px solid rgba(245, 158, 11, 0.35)',
        }}
      >
        Launch App
      </DashboardLaunchLink>
    ),
  },
  {
    visualId: 'portalStorage' as const,
    title: 'Sovereign Storage',
    body: 'Encrypted sync to your Google Drive. Standard JSON/CSV formats. No vendor lock-in. Total data portability.',
    cta: (
      <Link
        href="/features/google-drive-sync"
        style={{
          padding: '12px 24px',
          background: 'transparent',
          border: '2px solid rgba(245, 158, 11, 0.35)',
          color: 'var(--text-warm)',
          textDecoration: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: '600',
          textAlign: 'center',
        }}
      >
        Connect Storage
      </Link>
    ),
  },
  {
    visualId: 'portalFounders' as const,
    title: 'Founders & Sponsors',
    body: 'Back the protocol. Direct access to the Command Team. Shape the roadmap.',
    cta: (
      <Link
        href="/sponsor?utm_source=landing&utm_medium=founders_section&utm_campaign=founders_club"
        style={{
          padding: '12px 24px',
          background: 'transparent',
          border: '2px solid rgba(245, 158, 11, 0.4)',
          color: 'var(--accent-warm)',
          textDecoration: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: '600',
          textAlign: 'center',
        }}
      >
        Request Access
      </Link>
    ),
  },
];

export default function ProductPortalSection() {
  return (
    <ScrollReveal>
      <section
        id="features"
        className="pocket-landing-sota mobile-container"
        style={{
          marginBottom: 'clamp(60px, 10vw, 120px)',
          width: '100%',
          maxWidth: '100vw',
          padding: '0 clamp(12px, 3vw, 24px)',
          boxSizing: 'border-box',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(2rem, 4vw, 2.5rem)',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '16px',
            letterSpacing: '-0.02em',
          }}
        >
          The Product Portal
        </h2>
        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.125rem)',
            textAlign: 'center',
            marginBottom: '48px',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Three pillars of the Sovereign Financial Stack.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'clamp(24px, 5vw, 32px)',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          {PORTAL_CARDS.map((card, i) => (
            <div
              key={card.visualId}
              style={CARD_SHELL}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.45)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.18)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <PocketLandingVisual
                visual={pocketVisual(card.visualId)}
                priority={i === 0}
              />
              <h3
                style={{
                  fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
                  fontWeight: 'bold',
                  margin: 0,
                  color: 'var(--text-warm)',
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                  fontSize: '15px',
                  margin: 0,
                  flex: 1,
                }}
              >
                {card.body}
              </p>
              {card.cta}
            </div>
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
}

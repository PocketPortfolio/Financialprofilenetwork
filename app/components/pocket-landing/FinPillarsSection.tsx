'use client';

import ScrollReveal from '@/app/components/ui/ScrollReveal';
import PocketLandingVisual from './PocketLandingVisual';
import FinPillarsCarousel from './FinPillarsCarousel';
import { pocketVisual } from '@/lib/pocket-landing-visuals';
import { pocketLandingHeadingStyle } from '@/lib/pocket-landing-theme';

export default function FinPillarsSection() {
  const finPlate = {
    ...pocketVisual('finPillars'),
    overlay: 'none' as const,
    caption: undefined,
    motion: 'none' as const,
  };

  return (
    <ScrollReveal>
      <section
        id="fin-pillars"
        className="pocket-landing-sota"
        style={{
          marginBottom: '120px',
          textAlign: 'center',
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        <h2
          style={{
            ...pocketLandingHeadingStyle,
            fontSize: 'clamp(2rem, 4vw, 2.25rem)',
            fontWeight: 'bold',
            marginBottom: '16px',
            letterSpacing: '-0.02em',
          }}
        >
          The FIN Pillars
        </h2>
        <p
          style={{
            fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
            color: 'var(--muted)',
            marginBottom: '32px',
            maxWidth: '800px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Future • Investment • Now — one engine: open core, human-centered execution, shipped insight.
        </p>

        <div
          style={{
            width: '100%',
            maxWidth: '1000px',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          <PocketLandingVisual visual={finPlate} />
          <FinPillarsCarousel />
          <p
            style={{
              margin: '20px 0 0',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            FLOW: OPEN_CORE → UX_AND_PIPELINES → SHIPPED_INSIGHT
          </p>
        </div>
      </section>
    </ScrollReveal>
  );
}

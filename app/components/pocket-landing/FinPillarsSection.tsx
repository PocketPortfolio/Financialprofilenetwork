'use client';

import ScrollReveal from '@/app/components/ui/ScrollReveal';
import PocketLandingVisual from './PocketLandingVisual';
import { pocketVisual } from '@/lib/pocket-landing-visuals';

export default function FinPillarsSection() {
  return (
    <ScrollReveal>
      <section
        id="fin-pillars"
        className="pocket-landing-sota"
        style={{ marginBottom: '120px', textAlign: 'center' }}
      >
        <h2
          style={{
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
          }}
        >
          Future • Investment • Now — one engine: open core, human-centered execution, shipped insight.
        </p>

        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <PocketLandingVisual visual={pocketVisual('finPillars')} />
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

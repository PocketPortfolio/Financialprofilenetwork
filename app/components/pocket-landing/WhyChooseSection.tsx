'use client';

import PocketLandingVisual from './PocketLandingVisual';
import AdFreeInvariantPanel from './AdFreeInvariantPanel';
import { POCKET_TRANSPARENCY_ROW, pocketVisual } from '@/lib/pocket-landing-visuals';
import { pocketLandingHeadingStyle, pocketLandingPanelStyle } from '@/lib/pocket-landing-theme';

export default function WhyChooseSection() {
  return (
    <section
      className="pocket-landing-sota"
      style={{ marginBottom: '120px', textAlign: 'center' }}
    >
      <div
        style={{
          ...pocketLandingPanelStyle,
          padding: '48px 32px',
          marginBottom: '48px',
        }}
      >
        <h2
          style={{
            ...pocketLandingHeadingStyle,
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 'bold',
            marginBottom: '32px',
            letterSpacing: '-0.02em',
          }}
        >
          Why Choose Pocket Portfolio?
        </h2>

        <PocketLandingVisual visual={pocketVisual('whyChoose')} />

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            flexWrap: 'wrap',
            alignItems: 'center',
            marginTop: '32px',
          }}
        >
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Built with transparency:
          </div>
          {POCKET_TRANSPARENCY_ROW.map((label) => (
            <div
              key={label}
              style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '500' }}
            >
              {label}
            </div>
          ))}
        </div>

        <AdFreeInvariantPanel />
      </div>
    </section>
  );
}

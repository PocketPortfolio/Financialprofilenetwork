'use client';

import PocketLandingVisual from './PocketLandingVisual';
import AdFreeInvariantPanel from './AdFreeInvariantPanel';
import { POCKET_TRANSPARENCY_ROW, pocketVisual } from '@/lib/pocket-landing-visuals';

const OBSIDIAN = '#09090b';

export default function WhyChooseSection() {
  return (
    <section
      className="pocket-landing-sota"
      style={{ marginBottom: '120px', textAlign: 'center' }}
    >
      <div
        style={{
          background: OBSIDIAN,
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '12px',
          padding: '48px 32px',
          marginBottom: '48px',
        }}
      >
        <h2
          style={{
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
          <div style={{ fontSize: '14px', color: 'var(--muted)' }}>Built with transparency:</div>
          {POCKET_TRANSPARENCY_ROW.map((label) => (
            <div key={label} style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '500' }}>
              {label}
            </div>
          ))}
        </div>

        <AdFreeInvariantPanel />
      </div>
    </section>
  );
}

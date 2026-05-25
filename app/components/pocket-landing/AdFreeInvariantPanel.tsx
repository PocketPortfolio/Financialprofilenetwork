'use client';

import PocketLandingVisual from './PocketLandingVisual';
import { pocketVisual } from '@/lib/pocket-landing-visuals';

export default function AdFreeInvariantPanel() {
  return (
    <div style={{ marginTop: '32px' }}>
      <PocketLandingVisual visual={pocketVisual('adFreeInvariant')} />
    </div>
  );
}

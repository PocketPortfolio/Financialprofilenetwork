'use client';

import { useEffect, useState } from 'react';
import { LandingProductVideo } from '@/app/components/landing/LandingProductVideo';
import {
  getPocketAnalystHarnessVideoSrc,
  pocketAnalystLocalSrc,
  POCKET_ANALYST_CDN_DEFAULT,
} from '@/lib/landing-product-video';

/** Matches Open bridge figure (`16/9`) — avoids flex/aspect collapse inside the story visual. */
const HARNESS_ASPECT = '16 / 9';

/**
 * Open bridge slot — live Pocket Portfolio harness proof.
 * Cloudinary primary on Open hosts; same-origin fallback only after error.
 */
export default function OpenLandingPocketAnalystHarness() {
  const [videoSrc, setVideoSrc] = useState(POCKET_ANALYST_CDN_DEFAULT);

  useEffect(() => {
    setVideoSrc(getPocketAnalystHarnessVideoSrc());
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 3,
        background: '#09090b',
      }}
    >
      <LandingProductVideo
        src={videoSrc}
        fallbackSrc={pocketAnalystLocalSrc()}
        aspectRatio={HARNESS_ASPECT}
        variant="inline"
        show4KBadge
        borderRadius={0}
        style={{ width: '100%', height: '100%' }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 12,
          right: 14,
          left: 14,
          display: 'flex',
          justifyContent: 'flex-end',
          pointerEvents: 'none',
          zIndex: 6,
        }}
      >
        <span
          style={{
            padding: '4px 10px',
            background: 'rgba(0,0,0,0.72)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: 6,
            fontSize: 9,
            fontWeight: 600,
            fontFamily: 'ui-monospace, monospace',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(245,158,11,0.92)',
            border: '1px solid rgba(245,158,11,0.35)',
          }}
        >
          Live harness · Pocket Analyst · streaming inference
        </span>
      </div>
    </div>
  );
}

'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import type { OpenLandingVisualMeta } from '@/lib/open-landing-visuals';
import OpenLandingBriefingConsole from './briefing-iad/OpenLandingBriefingConsole';
import OpenLandingDigitalFootprintMap from './OpenLandingDigitalFootprintMap';
import OpenLandingPocketAnalystHarness from './OpenLandingPocketAnalystHarness';
import OpenLandingPackageTerminal from './OpenLandingPackageTerminal';
import OpenLandingPlateOverlay from './OpenLandingPlateOverlay';
import OpenLandingSovereignGrid from './OpenLandingSovereignGrid';

const fadeVisual = {
  initial: { opacity: 0, scale: 0.98 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] as const },
};

function aspectCss(ratio: OpenLandingVisualMeta['aspectRatio']): string {
  return ratio === '16/10' ? '16 / 10' : '16 / 9';
}

export default function OpenLandingVisual({
  visual,
  priority = false,
  adapterCount = 19,
}: {
  visual: OpenLandingVisualMeta;
  priority?: boolean;
  adapterCount?: number;
}) {
  const reduceMotion = useReducedMotion();
  const kenBurns = visual.id === 'hero' && !reduceMotion;
  const objectFit = visual.objectFit ?? 'cover';
  const isHarnessVideo = visual.motion === 'pocket-analyst-harness';

  return (
    <motion.figure
      {...fadeVisual}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      style={{
        margin: 0,
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(245,158,11,0.12)',
        background: '#09090b',
        boxShadow:
          '0 32px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: aspectCss(visual.aspectRatio),
          overflow: 'hidden',
        }}
      >
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            background: objectFit === 'contain' ? '#09090b' : undefined,
          }}
          animate={kenBurns ? { scale: [1, 1.03, 1] } : undefined}
          transition={
            kenBurns
              ? { duration: 22, repeat: Infinity, ease: 'easeInOut' }
              : undefined
          }
        >
          {!isHarnessVideo ? (
            <Image
              src={visual.src}
              alt={visual.alt}
              fill
              priority={priority}
              quality={90}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, min(960px, 45vw)"
              style={{
                objectFit,
                objectPosition: 'center center',
              }}
            />
          ) : null}
        </motion.div>

        {visual.motion === 'sovereign-grid' && <OpenLandingSovereignGrid />}
        {visual.motion === 'digital-footprint' && (
          <OpenLandingDigitalFootprintMap
            placement={visual.id === 'tracks' ? 'global' : 'dual-pane'}
          />
        )}
        {visual.motion === 'pocket-analyst-harness' && <OpenLandingPocketAnalystHarness />}
        {visual.motion === 'package-terminal' && <OpenLandingPackageTerminal />}
        {visual.motion === 'briefing-console' && <OpenLandingBriefingConsole />}

        {visual.overlay && (
          <OpenLandingPlateOverlay variant={visual.overlay} adapterCount={adapterCount} />
        )}

        {!reduceMotion &&
          visual.motion !== 'briefing-console' &&
          visual.motion !== 'pocket-analyst-harness' && (
          <motion.div
            aria-hidden
            animate={{ opacity: [0.08, 0.2, 0.08] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(105deg, transparent 38%, rgba(245,158,11,0.1) 50%, transparent 62%)',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
        )}

        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '10px',
            boxShadow: 'inset 0 0 0 1px rgba(245,158,11,0.15)',
            pointerEvents: 'none',
            zIndex: 6,
          }}
        />
      </div>

      <figcaption
        style={{
          padding: '16px 20px',
          fontSize: '15px',
          lineHeight: 1.55,
          color: 'var(--text)',
          borderTop: '1px solid var(--border-subtle)',
          fontFamily:
            'system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
          fontWeight: 600,
          letterSpacing: '0.01em',
        }}
      >
        {visual.caption}
      </figcaption>
    </motion.figure>
  );
}

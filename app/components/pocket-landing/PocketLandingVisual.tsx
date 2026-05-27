'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import type { PocketLandingVisualMeta } from '@/lib/pocket-landing-visuals';
import { pocketPlateUrl } from '@/lib/pocket-landing-visuals';
import {
  pocketPlateFrameStyle,
  pocketPlateHud,
} from '@/lib/pocket-landing-theme';
import PocketLandingPlateOverlay from './PocketLandingPlateOverlay';

const fadeVisual = {
  initial: { opacity: 0, scale: 0.98 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] as const },
};

export default function PocketLandingVisual({
  visual,
  priority = false,
  variant = 'section',
  className,
  bottomDock,
}: {
  visual: PocketLandingVisualMeta;
  priority?: boolean;
  /** section = full card with border; news = flat hero fill for briefing cards */
  variant?: 'section' | 'news';
  className?: string;
  /** Optional HUD docked to plate bottom (e.g. FIN pillars carousel) */
  bottomDock?: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const drift = visual.motion === 'drift' && !reduceMotion;
  const src = pocketPlateUrl(visual);
  const isNews = variant === 'news';

  const shell = (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: visual.aspectRatio,
        overflow: 'hidden',
        ...pocketPlateFrameStyle,
      }}
    >
      <motion.div
        style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
        animate={drift ? { scale: [1, 1.02, 1] } : undefined}
        transition={drift ? { duration: 24, repeat: Infinity, ease: 'easeInOut' } : undefined}
      >
        <Image
          src={src}
          alt={visual.alt}
          fill
          priority={priority || visual.priority}
          quality={90}
          sizes={
            isNews
              ? '(max-width: 768px) 100vw, 400px'
              : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, min(960px, 45vw)'
          }
          style={{
            objectFit: 'cover',
            objectPosition: visual.objectPosition ?? 'center center',
          }}
        />
      </motion.div>

      {visual.overlay !== 'none' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
          <PocketLandingPlateOverlay variant={visual.overlay} visual={visual} />
        </div>
      )}

      {!reduceMotion && !isNews && (
        <motion.div
          aria-hidden
          animate={{ opacity: [0.06, 0.16, 0.06] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(105deg, transparent 38%, color-mix(in srgb, var(--accent-warm) 8%, transparent) 50%, transparent 62%)',
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
          boxShadow: 'inset 0 0 80px color-mix(in srgb, var(--bg) 35%, transparent)',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      />

      {bottomDock}
    </div>
  );

  if (isNews) {
    return <div className={className}>{shell}</div>;
  }

  return (
    <motion.figure
      {...fadeVisual}
      className={className}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      style={{
        margin: 0,
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        border: `1px solid ${pocketPlateHud.borderSubtle}`,
        ...pocketPlateFrameStyle,
        boxShadow:
          'var(--shadow-lg), 0 0 0 1px color-mix(in srgb, var(--text) 4%, transparent) inset',
      }}
    >
      {shell}
      {visual.caption && (
        <figcaption
          style={{
            padding: '12px 16px',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            textAlign: visual.headlineAlign ?? 'center',
            borderTop: `1px solid ${pocketPlateHud.borderSubtle}`,
            background: 'var(--surface-elevated)',
          }}
        >
          {visual.caption}
        </figcaption>
      )}
    </motion.figure>
  );
}

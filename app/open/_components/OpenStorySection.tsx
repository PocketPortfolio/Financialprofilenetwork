'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import OpenLandingVisual from './OpenLandingVisual';
import type { OpenLandingVisualMeta } from '@/lib/open-landing-visuals';

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] as const },
};

export default function OpenStorySection({
  visual,
  visualPosition = 'right',
  visualPriority = false,
  band,
  children,
}: {
  visual: OpenLandingVisualMeta;
  visualPosition?: 'left' | 'right';
  visualPriority?: boolean;
  /** Optional full-bleed background band */
  band?: boolean;
  children: ReactNode;
}) {
  const visualNode = (
    <OpenLandingVisual visual={visual} priority={visualPriority} />
  );

  return (
    <section
      style={
        band
          ? {
              background: 'var(--surface)',
              borderTop: '1px solid var(--border-subtle)',
              borderBottom: '1px solid var(--border-subtle)',
            }
          : undefined
      }
    >
      <motion.div
        {...fadeUp}
        style={{
          padding: 'clamp(64px, 8vw, 112px) 24px',
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: 'clamp(32px, 5vw, 56px)',
          alignItems: 'center',
        }}
      >
        {visualPosition === 'left' ? visualNode : null}
        <motion.div style={{ minWidth: 0 }}>{children}</motion.div>
        {visualPosition === 'right' ? visualNode : null}
      </motion.div>
    </section>
  );
}

'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import PocketLandingVisual from './PocketLandingVisual';
import type { PocketLandingVisualMeta } from '@/lib/pocket-landing-visuals';

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] as const },
};

export default function PocketStorySection({
  visual,
  visualPosition = 'right',
  visualPriority = false,
  children,
}: {
  visual: PocketLandingVisualMeta;
  visualPosition?: 'left' | 'right';
  visualPriority?: boolean;
  children: ReactNode;
}) {
  const visualNode = <PocketLandingVisual visual={visual} priority={visualPriority} />;

  return (
    <motion.div
      {...fadeUp}
      className="pocket-landing-sota"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
        gap: 'clamp(32px, 5vw, 56px)',
        alignItems: 'center',
      }}
    >
      {visualPosition === 'left' ? visualNode : null}
      <div style={{ minWidth: 0 }}>{children}</div>
      {visualPosition === 'right' ? visualNode : null}
    </motion.div>
  );
}

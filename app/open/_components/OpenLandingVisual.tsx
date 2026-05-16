'use client';

import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import type { OpenLandingVisualId, OpenLandingVisualMeta } from '@/lib/open-landing-visuals';

const ACCENT = '#f59e0b';

const fadeVisual = {
  initial: { opacity: 0, scale: 0.98 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] as const },
};

function AmbientOrbs({ variant }: { variant: 'briefing' | 'vault' | 'default' }) {
  if (variant === 'default') return null;

  const orbs =
    variant === 'briefing'
      ? [
          { x: '12%', y: '18%', size: 140, delay: 0 },
          { x: '72%', y: '62%', size: 180, delay: 1.2 },
          { x: '48%', y: '38%', size: 100, delay: 0.6 },
        ]
      : [
          { x: '50%', y: '45%', size: 200, delay: 0 },
          { x: '28%', y: '55%', size: 120, delay: 0.8 },
        ];

  return (
    <>
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          aria-hidden
          animate={{
            opacity: [0.12, 0.32, 0.12],
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: variant === 'briefing' ? 5 + i : 6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: orb.delay,
          }}
          style={{
            position: 'absolute',
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            marginLeft: -orb.size / 2,
            marginTop: -orb.size / 2,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(245,158,11,0.35) 0%, rgba(245,158,11,0) 70%)',
            pointerEvents: 'none',
            filter: 'blur(2px)',
          }}
        />
      ))}
    </>
  );
}

function ScanLine() {
  return (
    <motion.div
      aria-hidden
      initial={{ top: '-20%' }}
      animate={{ top: ['-20%', '120%'] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        height: '28%',
        background:
          'linear-gradient(180deg, transparent 0%, rgba(245,158,11,0.08) 45%, transparent 100%)',
        pointerEvents: 'none',
      }}
    />
  );
}

/** Minimal “console” face layered over the briefing art — pupils + mouth follow pointer (sprung). */
function BriefingRoomFace({
  pupilX,
  pupilY,
  mouthX,
  mouthY,
}: {
  pupilX: MotionValue<number>;
  pupilY: MotionValue<number>;
  mouthX: MotionValue<number>;
  mouthY: MotionValue<number>;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 260 100"
      style={{
        position: 'absolute',
        left: '50%',
        bottom: '8%',
        width: 'min(48%, 248px)',
        height: 'auto',
        transform: 'translateX(-50%)',
        overflow: 'visible',
        pointerEvents: 'none',
        zIndex: 6,
      }}
    >
      <defs>
        <filter id="open-briefing-face-soft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#open-briefing-face-soft)">
        <circle
          cx="88"
          cy="42"
          r="17"
          fill="rgba(6,8,11,0.5)"
          stroke={ACCENT}
          strokeWidth="1.35"
          opacity={0.88}
        />
        <circle
          cx="172"
          cy="42"
          r="17"
          fill="rgba(6,8,11,0.5)"
          stroke={ACCENT}
          strokeWidth="1.35"
          opacity={0.88}
        />
        <motion.g style={{ x: pupilX, y: pupilY }}>
          <circle cx="88" cy="42" r="6" fill={ACCENT} />
          <circle cx="172" cy="42" r="6" fill={ACCENT} />
        </motion.g>
        <motion.g style={{ x: mouthX, y: mouthY }}>
          <line
            x1="74"
            y1="74"
            x2="186"
            y2="74"
            stroke={ACCENT}
            strokeWidth="2.25"
            strokeLinecap="round"
            opacity={0.92}
          />
        </motion.g>
      </g>
    </svg>
  );
}

function interactionFor(id: OpenLandingVisualId): {
  orbs: 'briefing' | 'vault' | 'default';
  scan: boolean;
  kenBurns: boolean;
  hoverLift: number;
  /** Text is baked into the art board — skip overlays that wash out labels */
  textHeavy: boolean;
} {
  switch (id) {
    case 'contact':
      return { orbs: 'briefing', scan: true, kenBurns: true, hoverLift: 6, textHeavy: false };
    case 'subHero':
      return { orbs: 'vault', scan: false, kenBurns: false, hoverLift: 5, textHeavy: true };
    case 'threat':
      return { orbs: 'default', scan: true, kenBurns: false, hoverLift: 4, textHeavy: false };
    case 'pillars':
      return { orbs: 'default', scan: false, kenBurns: false, hoverLift: 5, textHeavy: true };
    case 'packages':
      return { orbs: 'default', scan: false, kenBurns: false, hoverLift: 4, textHeavy: true };
    case 'tracks':
      return { orbs: 'default', scan: false, kenBurns: false, hoverLift: 4, textHeavy: true };
    default:
      return { orbs: 'default', scan: false, kenBurns: true, hoverLift: 4, textHeavy: false };
  }
}

export default function OpenLandingVisual({
  visual,
  priority = false,
}: {
  visual: OpenLandingVisualMeta;
  priority?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const mouseNormX = useMotionValue(0);
  const mouseNormY = useMotionValue(0);
  const springX = useSpring(mouseNormX, { stiffness: 300, damping: 30, mass: 0.35 });
  const springY = useSpring(mouseNormY, { stiffness: 300, damping: 30, mass: 0.35 });

  const isBriefingPlay = visual.id === 'contact' && !reduceMotion;

  const pupilShiftX = useTransform(springX, [-1, 1], [-11, 11]);
  const pupilShiftY = useTransform(springY, [-1, 1], [-8, 8]);
  const mouthShiftX = useTransform(springX, [-1, 1], [-6, 6]);
  const mouthShiftY = useTransform(springY, [-1, 1], [-4, 4]);
  const orbLayerX = useTransform(springX, [-1, 1], [-24, 24]);
  const orbLayerY = useTransform(springY, [-1, 1], [-20, 20]);
  const imgLayerX = useTransform(springX, [-1, 1], [14, -14]);
  const imgLayerY = useTransform(springY, [-1, 1], [11, -11]);
  const vignetteStrength = useTransform([springX, springY], ([x, y]) => {
    const nx = Number(x);
    const ny = Number(y);
    return Math.min(1, Math.hypot(nx, ny));
  });
  const vignetteOpacity = useTransform(vignetteStrength, [0, 0.35, 1], [0.22, 0.5, 0.78]);

  const updatePointer = useCallback(
    (clientX: number, clientY: number) => {
      const el = surfaceRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const w = Math.max(r.width, 1);
      const h = Math.max(r.height, 1);
      mouseNormX.set(((clientX - r.left) / w - 0.5) * 2);
      mouseNormY.set(((clientY - r.top) / h - 0.5) * 2);
    },
    [mouseNormX, mouseNormY],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isBriefingPlay) return;
      updatePointer(e.clientX, e.clientY);
      setHasInteracted(true);
    },
    [isBriefingPlay, updatePointer],
  );

  const onPointerLeave = useCallback(() => {
    mouseNormX.set(0);
    mouseNormY.set(0);
  }, [mouseNormX, mouseNormY]);

  const [w, h] =
    visual.aspectRatio === '21/9'
      ? [21, 9]
      : visual.aspectRatio === '4/3'
        ? [4, 3]
        : [16, 10];

  const fx = interactionFor(visual.id);

  return (
    <motion.figure
      {...fadeVisual}
      whileHover={reduceMotion ? undefined : { y: -fx.hoverLift }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      style={{
        margin: 0,
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(245,158,11,0.12)',
        background: '#06080b',
        boxShadow:
          '0 32px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset',
      }}
    >
      <div
        ref={surfaceRef}
        role={isBriefingPlay ? 'region' : undefined}
        aria-label={
          isBriefingPlay
            ? 'Interactive executive briefing preview — move your pointer inside the frame; lighting and focus respond.'
            : undefined
        }
        onPointerMove={isBriefingPlay ? onPointerMove : undefined}
        onPointerLeave={isBriefingPlay ? onPointerLeave : undefined}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: `${w} / ${h}`,
          overflow: 'hidden',
          cursor: isBriefingPlay ? 'crosshair' : undefined,
        }}
      >
        {!reduceMotion && fx.orbs !== 'default' && (
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              ...(isBriefingPlay ? { x: orbLayerX, y: orbLayerY } : {}),
            }}
          >
            <AmbientOrbs variant={fx.orbs} />
          </motion.div>
        )}
        {!reduceMotion && fx.scan && <ScanLine />}

        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            ...(isBriefingPlay ? { x: imgLayerX, y: imgLayerY } : {}),
          }}
          animate={
            reduceMotion || !fx.kenBurns
              ? undefined
              : { scale: [1, 1.04, 1] }
          }
          transition={
            reduceMotion || !fx.kenBurns
              ? undefined
              : { duration: 20, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <Image
            src={visual.src}
            alt={visual.alt}
            fill
            priority={priority}
            quality={100}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, min(960px, 45vw)"
            style={{
              objectFit: 'cover',
              objectPosition: 'center center',
            }}
          />
        </motion.div>

        {isBriefingPlay && (
          <motion.div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 2,
              background:
                'radial-gradient(ellipse 88% 72% at 50% 42%, transparent 32%, rgba(245,158,11,0.09) 100%)',
              opacity: vignetteOpacity,
            }}
          />
        )}

        {!fx.textHeavy && (
          <motion.div
            aria-hidden
            animate={reduceMotion ? undefined : { opacity: [0.1, 0.28, 0.1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(105deg, transparent 38%, rgba(245,158,11,0.14) 50%, transparent 62%)',
              pointerEvents: 'none',
            }}
          />
        )}

        {isBriefingPlay && (
          <BriefingRoomFace
            pupilX={pupilShiftX}
            pupilY={pupilShiftY}
            mouthX={mouthShiftX}
            mouthY={mouthShiftY}
          />
        )}

        {isBriefingPlay && (
          <motion.p
            id="briefing-play-hint"
            aria-hidden
            initial={false}
            animate={{ opacity: hasInteracted ? 0 : 0.5 }}
            transition={{ duration: 0.55 }}
            style={{
              position: 'absolute',
              top: 14,
              left: 12,
              right: 12,
              margin: 0,
              textAlign: 'center',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          >
            Move inside the screen — the room reacts
          </motion.p>
        )}

        <motion.div
          aria-hidden
          whileHover={reduceMotion ? undefined : { opacity: 0.9 }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '10px',
            boxShadow: 'inset 0 0 0 1px rgba(245,158,11,0.15)',
            pointerEvents: 'none',
            zIndex: 4,
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

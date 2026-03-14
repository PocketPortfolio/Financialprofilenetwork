'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Smartphone, Cpu, Cloud, ArrowRight, ArrowDown } from 'lucide-react';

const NODE_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: 'var(--space-6)',
  background: 'var(--bg)',
  border: '1px solid var(--border-warm)',
  borderRadius: 'var(--radius-md)',
  minWidth: 160,
  width: '100%',
  maxWidth: 264,
};

const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

type Phase = 'reveal' | 'step1' | 'step2' | 'step3' | 'step4' | 'idle';

const REVEAL_DURATION_MS = 200 + 4 * 150;
const STEP1_DURATION_MS = 800;
const STEP2_DURATION_MS = 400;
const STEP3_DURATION_MS = 800;
const STEP4_DURATION_MS = 600;

export default function AnimatedBlueprint() {
  const containerRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<HTMLDivElement>(null);
  const cloudRef = useRef<HTMLDivElement>(null);

  const [centers, setCenters] = useState<{
    device: { x: number; y: number };
    engine: { x: number; y: number };
    cloud: { x: number; y: number };
  }>({ device: { x: 0, y: 0 }, engine: { x: 0, y: 0 }, cloud: { x: 0, y: 0 } });
  const [measured, setMeasured] = useState(false);
  const [phase, setPhase] = useState<Phase>('reveal');
  const [replayKey, setReplayKey] = useState(0);
  const [dataPacketPos, setDataPacketPos] = useState({ x: 0, y: 0 });
  const [dataPacketScale, setDataPacketScale] = useState(1);
  const [responsePacketPos, setResponsePacketPos] = useState({ x: 0, y: 0 });

  const shouldReduceMotion = useReducedMotion();

  const measure = useCallback(() => {
    const container = containerRef.current;
    const device = deviceRef.current;
    const engine = engineRef.current;
    const cloud = cloudRef.current;
    if (!container || !device || !engine || !cloud) return;
    const cr = container.getBoundingClientRect();
    const dr = device.getBoundingClientRect();
    const er = engine.getBoundingClientRect();
    const clr = cloud.getBoundingClientRect();
    setCenters({
      device: {
        x: dr.left - cr.left + dr.width / 2,
        y: dr.top - cr.top + dr.height / 2,
      },
      engine: {
        x: er.left - cr.left + er.width / 2,
        y: er.top - cr.top + er.height / 2,
      },
      cloud: {
        x: clr.left - cr.left + clr.width / 2,
        y: clr.top - cr.top + clr.height / 2,
      },
    });
    setMeasured(true);
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    const el = containerRef.current;
    if (el) ro.observe(el);
    return () => ro.disconnect();
  }, [measure, replayKey]);

  useEffect(() => {
    if (!measured || shouldReduceMotion) return;
    if (phase === 'reveal') {
      const t = setTimeout(() => setPhase('step1'), REVEAL_DURATION_MS);
      return () => clearTimeout(t);
    }
  }, [measured, phase, shouldReduceMotion]);

  useEffect(() => {
    if (!measured || shouldReduceMotion) return;
    if (phase === 'step1') {
      setDataPacketPos(centers.device);
      setDataPacketScale(1);
      const t = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setDataPacketPos(centers.engine);
        });
      });
      const t2 = setTimeout(() => setPhase('step2'), STEP1_DURATION_MS);
      return () => {
        cancelAnimationFrame(t);
        clearTimeout(t2);
      };
    }
    if (phase === 'step2') {
      setDataPacketScale(0.4);
      const t = setTimeout(() => setPhase('step3'), STEP2_DURATION_MS);
      return () => clearTimeout(t);
    }
    if (phase === 'step3') {
      setDataPacketPos(centers.engine);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setDataPacketPos(centers.cloud));
      });
      const t = setTimeout(() => setPhase('step4'), STEP3_DURATION_MS);
      return () => clearTimeout(t);
    }
    if (phase === 'step4') {
      setResponsePacketPos(centers.cloud);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setResponsePacketPos(centers.device));
      });
      const t = setTimeout(() => setPhase('idle'), STEP4_DURATION_MS);
      return () => clearTimeout(t);
    }
  }, [phase, measured, centers, shouldReduceMotion]);

  const handleReplay = useCallback(() => {
    setPhase('reveal');
    setReplayKey((k) => k + 1);
    setDataPacketPos(centers.device);
    setDataPacketScale(1);
    setResponsePacketPos(centers.cloud);
  }, [centers]);

  const showPackets = !shouldReduceMotion && measured && phase !== 'reveal';

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-warm)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-8)',
      }}
    >
      <motion.div
        ref={containerRef}
        className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4 flex-wrap md:flex-nowrap"
        style={{ position: 'relative' }}
        variants={CONTAINER_VARIANTS}
        initial="hidden"
        animate="visible"
      >
        {/* User Device */}
        <motion.div
          ref={deviceRef}
          variants={ITEM_VARIANTS}
          style={NODE_STYLE}
        >
          <Smartphone
            size={32}
            style={{ color: 'var(--text)', marginBottom: 'var(--space-3)' }}
            aria-hidden
          />
          <div
            style={{
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: 'var(--space-1)',
            }}
          >
            User Device
          </div>
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-secondary)',
            }}
          >
            IndexedDB & Zustand
          </div>
        </motion.div>

        <ArrowDown
          className="md:hidden flex-shrink-0"
          size={24}
          style={{ color: 'var(--border-warm)' }}
          aria-hidden
        />
        <ArrowRight
          className="hidden md:block flex-shrink-0"
          size={24}
          style={{ color: 'var(--border-warm)' }}
          aria-hidden
        />

        {/* Context Engine */}
        <motion.div
          ref={engineRef}
          variants={ITEM_VARIANTS}
          style={NODE_STYLE}
        >
          <Cpu
            size={32}
            style={{ color: 'var(--text)', marginBottom: 'var(--space-3)' }}
            aria-hidden
          />
          <div
            style={{
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: 'var(--space-1)',
            }}
          >
            Context Engine
          </div>
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-secondary)',
            }}
          >
            Browser execution
          </div>
        </motion.div>

        <ArrowDown
          className="md:hidden flex-shrink-0"
          size={24}
          style={{ color: 'var(--border-warm)' }}
          aria-hidden
        />
        <ArrowRight
          className="hidden md:block flex-shrink-0"
          size={24}
          style={{ color: 'var(--border-warm)' }}
          aria-hidden
        />

        {/* Data Boundary */}
        <style>{`
          @media (max-width: 767px) {
            .sovereign-dashed-h { display: none !important; }
            .sovereign-dashed-v { display: block !important; }
          }
          @media (min-width: 768px) {
            .sovereign-dashed-h { display: block !important; }
            .sovereign-dashed-v { display: none !important; }
          }
        `}</style>
        <motion.div
          variants={ITEM_VARIANTS}
          className="relative flex flex-col items-center justify-center flex-shrink-0"
          style={{
            position: 'relative',
            minHeight: 96,
            width: 192,
            maxWidth: '100%',
            padding: 'var(--space-6)',
          }}
          aria-hidden
        >
          <div
            className="sovereign-dashed-h hidden md:block"
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              borderTop: '2px dashed var(--accent-warm)',
              transform: 'translateY(-50%)',
            }}
          />
          <div
            className="sovereign-dashed-v md:hidden"
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              borderLeft: '2px dashed var(--accent-warm)',
              transform: 'translateX(-50%)',
            }}
          />
          <div
            style={{
              background: 'var(--surface)',
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 9999,
              border: '1px solid var(--accent-warm)',
              color: 'var(--accent-warm)',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              position: 'relative',
              zIndex: 1,
            }}
          >
            Data Boundary
          </div>
          <div
            style={{
              background: 'var(--bg)',
              padding: 'var(--space-1) var(--space-2)',
              marginTop: 'var(--space-2)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-warm)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            Sanitized Context Only
          </div>
          <ArrowRight
            className="hidden md:block"
            size={20}
            style={{
              color: 'var(--accent-warm)',
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              background: 'var(--surface)',
            }}
            aria-hidden
          />
          <ArrowDown
            className="md:hidden"
            size={20}
            style={{
              color: 'var(--accent-warm)',
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1,
              background: 'var(--surface)',
            }}
            aria-hidden
          />
        </motion.div>

        <ArrowDown
          className="md:hidden flex-shrink-0"
          size={24}
          style={{ color: 'var(--border-warm)' }}
          aria-hidden
        />
        <ArrowRight
          className="hidden md:block flex-shrink-0"
          size={24}
          style={{ color: 'var(--border-warm)' }}
          aria-hidden
        />

        {/* Stateless Cloud API */}
        <motion.div
          ref={cloudRef}
          variants={ITEM_VARIANTS}
          style={NODE_STYLE}
        >
          <Cloud
            size={32}
            style={{ color: 'var(--text)', marginBottom: 'var(--space-3)' }}
            aria-hidden
          />
          <div
            style={{
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: 'var(--space-1)',
            }}
          >
            Stateless Cloud API
          </div>
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-secondary)',
            }}
          >
            Zero Portfolio Storage
          </div>
        </motion.div>

        {/* Data packet (Device -> Engine -> Cloud) */}
        {showPackets && phase !== 'step4' && phase !== 'idle' && (
          <motion.div
            key={`data-${replayKey}`}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: 'var(--accent-warm)',
              pointerEvents: 'none',
              zIndex: 10,
            }}
            animate={{
              x: dataPacketPos.x - 6,
              y: dataPacketPos.y - 6,
              scale: dataPacketScale,
            }}
            transition={{
              type: 'tween',
              duration: phase === 'step2' ? STEP2_DURATION_MS / 1000 : 0.8,
              ease: 'easeInOut',
            }}
            aria-hidden
          />
        )}

        {/* Response packet (Cloud -> Device) */}
        {showPackets && (phase === 'step4' || phase === 'idle') && (
          <motion.div
            key={`response-${replayKey}`}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: 'var(--text-secondary)',
              pointerEvents: 'none',
              zIndex: 10,
            }}
            animate={{
              x: responsePacketPos.x - 5,
              y: responsePacketPos.y - 5,
            }}
            transition={{
              type: 'tween',
              duration: STEP4_DURATION_MS / 1000,
              ease: 'easeInOut',
            }}
            aria-hidden
          />
        )}
      </motion.div>

      {!shouldReduceMotion && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: 'var(--space-6)',
          }}
        >
          <button
            type="button"
            onClick={handleReplay}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              background: 'var(--accent-warm)',
              color: 'var(--bg)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Replay Animation
          </button>
        </div>
      )}
    </div>
  );
}

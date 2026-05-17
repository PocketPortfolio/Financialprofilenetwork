'use client';

import React, { useEffect, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

const CSV_ROWS = [
  '2024-01-15,AAPL,10',
  '2024-02-20,MSFT,5',
  '2024-03-10,GOOGL,3',
];

const JSON_OBJECTS = [
  '{"symbol":"AAPL","qty":10,"date":"2024-01-15"}',
  '{"symbol":"MSFT","qty":5,"date":"2024-02-20"}',
  '{"symbol":"GOOGL","qty":3,"date":"2024-03-10"}',
];

const CARD_STYLE: React.CSSProperties = {
  fontFamily: 'ui-monospace, monospace',
  fontSize: '11px',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid rgba(245, 158, 11, 0.35)',
  background: 'var(--surface-elevated, rgba(26,30,36,0.9))',
  color: 'var(--text-secondary, #9aa3ae)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '100%',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
  paused: { opacity: 1 },
};

const cardLeftVariants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0 },
  paused: { opacity: 1, x: 0 },
};

const cardRightVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0 },
  paused: { opacity: 1, x: 0 },
};

export default function LivingPipeline() {
  const [isVisible, setIsVisible] = useState(true);
  const controls = useAnimationControls();

  useEffect(() => {
    const handleVisibility = () => {
      const visible = document.visibilityState === 'visible';
      setIsVisible(visible);
      if (visible) {
        controls.start('visible');
      } else {
        controls.start('paused');
      }
    };
    handleVisibility();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [controls]);

  return (
    <motion.div
      className="living-pipeline"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'clamp(16px, 4vw, 32px)',
        flexWrap: 'wrap',
        width: '100%',
        maxWidth: 'min(900px, 95vw)',
        marginBottom: '32px',
      }}
      variants={containerVariants}
      initial="hidden"
      animate={controls}
    >
      {/* Left: CSV cards */}
      <motion.div
        style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}
        variants={containerVariants}
      >
        {CSV_ROWS.map((row, i) => (
          <motion.div key={`csv-${i}`} variants={cardLeftVariants} style={CARD_STYLE}>
            {row}
          </motion.div>
        ))}
      </motion.div>

      {/* Center: Processor node with amber pulse */}
      <motion.div
        variants={{
          hidden: { opacity: 0, scale: 0.9 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: { delay: 0.35 },
          },
          paused: { opacity: 1, scale: 1 },
        }}
        animate={controls}
        style={{
          flexShrink: 0,
          width: '56px',
          height: '56px',
          borderRadius: '12px',
          background: 'var(--surface-elevated)',
          border: '2px solid var(--accent-warm)',
          boxShadow: '0 0 20px rgba(245, 158, 11, 0.4), 0 0 40px rgba(245, 158, 11, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <motion.span
          animate={isVisible ? { opacity: [0.4, 0.9, 0.4] } : { opacity: 0.4 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: '-4px',
            borderRadius: '14px',
            border: '2px solid var(--accent-warm)',
            opacity: 0.4,
            pointerEvents: 'none',
          }}
        />
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ position: 'relative', zIndex: 1 }}>
          <path d="M4 6h16M4 12h16M4 18h10" stroke="var(--accent-warm)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </motion.div>

      {/* Right: JSON cards */}
      <motion.div
        style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}
        variants={containerVariants}
      >
        {JSON_OBJECTS.map((obj, i) => (
          <motion.div key={`json-${i}`} variants={cardRightVariants} style={CARD_STYLE}>
            {obj}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { OPEN_LANDING_VIDEO } from '../../../lib/canonical-claims';

/**
 * Phase 2 proof player — poster + prominent play affordance until first interaction.
 * Native timeline/controls appear only after the audience presses play (Civo-style).
 */
export default function OpenLandingProofVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const handlePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      await video.play();
      setHasStarted(true);
    } catch {
      // Autoplay policy or load failure — leave overlay visible for retry.
    }
  };

  const handleEnded = () => {
    setHasStarted(false);
  };

  return (
    <div
      style={{
        position: 'relative',
        lineHeight: 0,
      }}
    >
      <video
        ref={videoRef}
        // Native timeline/controls engage after first play (poster + amber affordance until then).
        controls={hasStarted}
        playsInline
        muted
        preload="none"
        poster={OPEN_LANDING_VIDEO.poster}
        aria-label={OPEN_LANDING_VIDEO.alt}
        onEnded={handleEnded}
        src={OPEN_LANDING_VIDEO.srcMobile}
        style={{
          display: 'block',
          width: '100%',
          aspectRatio: '16 / 9',
          objectFit: 'contain',
          background: '#0b0d10',
        }}
      >
        <source
          media="(max-width: 768px)"
          src={OPEN_LANDING_VIDEO.srcMobile}
          type="video/mp4"
        />
        <source src={OPEN_LANDING_VIDEO.src} type="video/mp4" />
      </video>

      {!hasStarted && (
        <motion.button
          type="button"
          onClick={() => void handlePlay()}
          aria-label="Play Split-Brain architecture video"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 0,
            padding: 0,
            border: 'none',
            background: 'rgba(9, 9, 11, 0.12)',
            cursor: 'pointer',
          }}
        >
          <span
            aria-hidden
            style={{
              width: 'clamp(64px, 10vw, 88px)',
              height: 'clamp(64px, 10vw, 88px)',
              borderRadius: '50%',
              background: 'var(--accent-warm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow:
                '0 12px 40px rgba(245, 158, 11, 0.45), 0 0 0 1px rgba(245, 158, 11, 0.25)',
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="#0b0d10"
              style={{ marginLeft: '4px' }}
            >
              <path d="M8 5.14v13.72L19 12 8 5.14z" />
            </svg>
          </span>
        </motion.button>
      )}
    </div>
  );
}

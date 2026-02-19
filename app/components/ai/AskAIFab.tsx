'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export interface AskAIFabProps {
  onClick: () => void;
}

export function AskAIFab({ onClick }: AskAIFabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open Pocket Analyst"
      style={{
        position: 'fixed',
        right: '24px',
        bottom: '88px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        border: 'none',
        background: 'var(--warning)',
        color: '#000',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
        zIndex: 9998,
      }}
    >
      <Sparkles size={24} />
    </button>
  );
}

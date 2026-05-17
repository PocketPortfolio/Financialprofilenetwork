'use client';

import React, { useState } from 'react';
import IdentityGate from '@/app/components/auth/IdentityGate';

export default function BipApplyGate() {
  const [captured, setCaptured] = useState(false);

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <IdentityGate
        action="bip_apply"
        contextId="board-of-investors"
        onContinue={() => {
          setCaptured(true);
        }}
      >
        {({ request, isUnlocked }) => (
          <button
            type="button"
            onClick={request}
            style={{
              background: 'var(--accent-warm)',
              color: '#1a1208',
              fontWeight: 900,
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid var(--border-warm)',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {isUnlocked ? 'Apply for investor seat →' : 'Apply for investor seat (email gate) →'}
          </button>
        )}
      </IdentityGate>

      {captured && (
        <div
          role="status"
          style={{
            border: '1px solid var(--border-warm)',
            background: 'var(--surface-elevated)',
            borderRadius: 12,
            padding: '10px 12px',
            fontSize: 13,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}
        >
          Captured. We will get back to you soon.
        </div>
      )}
    </div>
  );
}


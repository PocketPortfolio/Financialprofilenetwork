'use client';

import React, { useState } from 'react';
import IdentityGate from '@/app/components/auth/IdentityGate';

export default function Tier1IntentGate() {
  const [captured, setCaptured] = useState(false);

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <IdentityGate
        action="tier1_brief"
        contextId="tier1designpartner"
        onContinue={() => {
          setCaptured(true);
        }}
      >
        {({ request, isUnlocked }) => (
          <button
            type="button"
            onClick={request}
            style={{
              border: '2px solid var(--accent-warm)',
              color: 'var(--accent-warm)',
              fontWeight: 900,
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '14px',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            {isUnlocked ? 'Request Tier 1 brief →' : 'Request Tier 1 brief (email gate) →'}
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


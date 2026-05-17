'use client';

import IdentityGate from '@/app/components/auth/IdentityGate';

export default function Tier1BriefGate({ href }: { href: string }) {
  return (
    <IdentityGate
      action="tier1_brief"
      contextId="tier1designpartner"
      onContinue={() => {
        window.open(href, '_blank', 'noopener,noreferrer');
      }}
    >
      {({ request, isUnlocked }) => (
        <button
          type="button"
          onClick={request}
          style={{
            border: '2px solid var(--accent-warm)',
            color: 'var(--accent-warm)',
            fontWeight: 800,
            padding: '12px 16px',
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '14px',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          {isUnlocked ? 'Open Tier 1 brief →' : 'Unlock Tier 1 brief →'}
        </button>
      )}
    </IdentityGate>
  );
}


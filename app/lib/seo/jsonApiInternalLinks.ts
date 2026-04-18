/**
 * High-volume json-api pages: deterministic semantic variants for internal anchors
 * (avoids one identical button/footer anchor across tens of thousands of URLs).
 *
 * Bridge CTA: titles/subtitles rotate within each NEXT_PUBLIC_BRIDGE_CTA_VARIANT arm (A/B)
 * and across three hooks (sovereign | local_first | private_ledger) for GA4 breakdown.
 */

export type BridgeSemanticHook = 'sovereign' | 'local_first' | 'private_ledger';

function symbolDeterministicBucket(symbol: string, modulo: number): number {
  const id = symbol.replace(/-/g, '').toUpperCase();
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % modulo;
}

function bridgeHook(symbol: string): BridgeSemanticHook {
  const hooks: BridgeSemanticHook[] = ['sovereign', 'local_first', 'private_ledger'];
  return hooks[symbolDeterministicBucket(symbol, hooks.length)];
}

function phraseIndex(symbol: string, variant: 'A' | 'B', hook: BridgeSemanticHook): number {
  return symbolDeterministicBucket(`${symbol}:bridge:${variant}:${hook}`, 2);
}

export type JsonApiBridgeCopy = {
  title: string;
  subtitle: string;
  primaryLabel: string;
  hook: BridgeSemanticHook;
};

/** Full Bridge block for json-api: variant from env A/B test; hook + phrasing from ticker hash. */
export function jsonApiBridgeCopy(symbol: string, variant: 'A' | 'B'): JsonApiBridgeCopy {
  const sym = symbol.replace(/-/g, '').toUpperCase();
  const hook = bridgeHook(sym);
  const p = phraseIndex(sym, variant, hook);

  if (variant === 'B') {
    const banks: Record<
      BridgeSemanticHook,
      { title: [string, string]; subtitle: [string, string]; primaryLabel: [string, string] }
    > = {
      sovereign: {
        title: [
          'Programmable Sovereign Interface — chart this JSON in the Terminal.',
          'Route this JSON into your sovereign workspace — command the Terminal.',
        ],
        subtitle: [
          'Local-first analysis. Stateless data. Your browser is the vault.',
          'Endpoint-first sovereignty: no shared warehouse of your raw ledger.',
        ],
        primaryLabel: ['Open Sovereign Terminal', 'Launch sovereign workspace'],
      },
      local_first: {
        title: [
          'Local-first charts from this JSON — open the Terminal.',
          'Chart where your browser is the vault — wire this endpoint to the Terminal.',
        ],
        subtitle: [
          'Parse and visualize without shipping raw ledgers to a vendor database.',
          'Minimal cloud, maximal local control — start from this stateless slice.',
        ],
        primaryLabel: ['Open local-first portfolio terminal', 'Open local-first tracker'],
      },
      private_ledger: {
        title: [
          'Private ledger analysis — connect this API slice to the Terminal.',
          'Turn this feed into a private wealth view in the Terminal.',
        ],
        subtitle: [
          'Keep sensitive rows off shared analyst lakes — bounded, explicit flows.',
          'Your keys, your sync policy — the Terminal stays privacy-first.',
        ],
        primaryLabel: ['Open privacy-first terminal', 'Launch private wealth ledger'],
      },
    };
    const b = banks[hook];
    return {
      hook,
      title: b.title[p],
      subtitle: b.subtitle[p],
      primaryLabel: b.primaryLabel[p],
    };
  }

  const banks: Record<
    BridgeSemanticHook,
    { title: [string, string]; subtitle: [string, string]; primaryLabel: [string, string] }
  > = {
    sovereign: {
      title: [
        'Sovereign-style control — chart this JSON in the Terminal.',
        'Turn sovereign-grade clarity into charts — open the Terminal.',
      ],
      subtitle: [
        'Local-first by default; you choose what leaves the device.',
        'No upload wall to start — expand sync only when you want it.',
      ],
      primaryLabel: ['Open Terminal', 'Continue to sovereign workspace'],
    },
    local_first: {
      title: [
        'Turn this JSON into charts instantly — open the Terminal.',
        'Local-first: chart this endpoint in the Terminal.',
      ],
      subtitle: [
        'Local-first. No uploads required to start.',
        'Your browser anchors the session — cloud stays optional glue.',
      ],
      primaryLabel: ['Open local-first tracker', 'Launch chart workspace'],
    },
    private_ledger: {
      title: [
        'Private ledger view — spin up the Terminal from this endpoint.',
        'Keep this JSON in a private analysis workspace — open the Terminal.',
      ],
      subtitle: [
        'Privacy-first path: visualize without a central copy of your book.',
        'Bounded flows — expand only with explicit sync you control.',
      ],
      primaryLabel: ['Open private analysis workspace', 'Open Terminal'],
    },
  };
  const b = banks[hook];
  return {
    hook,
    title: b.title[p],
    subtitle: b.subtitle[p],
    primaryLabel: b.primaryLabel[p],
  };
}

export function jsonApiDashboardFooterLink(symbol: string): { href: string; label: string; title: string } {
  const sym = symbol.replace(/-/g, '').toUpperCase();
  const symLower = sym.toLowerCase();
  const href = `/dashboard?utm_source=json_api&utm_medium=semantic_footer&utm_campaign=sovereign_positioning&utm_content=${encodeURIComponent(symLower)}`;
  const variants: { label: string; title: string }[] = [
    {
      label: `Open ${sym} in the local-first portfolio tracker`,
      title: 'Pocket Portfolio — local-first, privacy-first tracker',
    },
    {
      label: 'Continue in the privacy-first wealth ledger',
      title: 'Private investment terminal — bounded AI, your ledger stays local',
    },
    {
      label: 'Return to the sovereign portfolio workspace',
      title: 'Sovereign finance workspace — Pocket Portfolio',
    },
    {
      label: 'Analyze positions in a zero-warehouse workflow',
      title: 'No central warehousing of your raw broker files',
    },
    {
      label: 'Launch the private investment analysis workspace',
      title: 'Local-first portfolio analysis — Pocket Portfolio',
    },
    {
      label: 'Open the sovereign finance terminal',
      title: 'Sovereign terminal — local-first portfolio tracking',
    },
  ];
  const i = symbolDeterministicBucket(sym, variants.length);
  return { href, ...variants[i] };
}

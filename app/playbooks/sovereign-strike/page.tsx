import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { PlaybookGate } from './PlaybookGate';
import { SovereignStrikeMatrix } from './SovereignStrikeMatrix';

export const metadata: Metadata = {
  title: 'Sovereign Strike — Enterprise Objection Matrix',
  description: 'Internal sales enablement: enterprise objection handling.',
  robots: { index: false, follow: false },
};

export default async function SovereignStrikePlaybookPage() {
  const gateSecret = process.env.PLAYBOOK_GATE_SECRET?.trim();
  if (gateSecret) {
    const jar = await cookies();
    const ok = jar.get('pp_playbook_gate')?.value === 'verified';
    if (!ok) {
      return <PlaybookGate />;
    }
  }

  return <SovereignStrikeMatrix />;
}

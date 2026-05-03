'use client';

import React, { createContext, useContext, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { isPaidTier } from '@/app/lib/tier';
import { AskAIFab } from './AskAIFab';
import { AskAIModal } from './AskAIModal';

interface PocketAnalystContextValue {
  portfolioContext: string;
  setPortfolioContext: (s: string) => void;
  tier: string | null;
  setTier: (t: string | null) => void;
}

const PocketAnalystContext = createContext<PocketAnalystContextValue | null>(null);

export function usePocketAnalyst() {
  const ctx = useContext(PocketAnalystContext);
  return ctx ?? { portfolioContext: '', setPortfolioContext: () => {}, tier: null, setTier: () => {} };
}

export function PocketAnalystProvider({ children }: { children: React.ReactNode }) {
  const [portfolioContext, setPortfolioContext] = useState('');
  const [tier, setTier] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const isDashboardRoute =
    pathname === '/dashboard' || (pathname?.startsWith('/dashboard/') ?? false);
  const showAskAI = Boolean(user) || isDashboardRoute;

  const value = React.useMemo(
    () => ({
      portfolioContext,
      setPortfolioContext,
      tier,
      setTier,
    }),
    [portfolioContext, tier]
  );

  const isPaid = isPaidTier(tier);

  return (
    <PocketAnalystContext.Provider value={value}>
      {children}
      {showAskAI && (
        <>
          <AskAIFab onClick={() => setModalOpen(true)} />
          <AskAIModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            user={user}
            portfolioContext={portfolioContext}
            isPaid={isPaid}
          />
        </>
      )}
    </PocketAnalystContext.Provider>
  );
}

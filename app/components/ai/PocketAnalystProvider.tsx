'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
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
  const { user } = useAuth();

  const value = React.useMemo(
    () => ({
      portfolioContext,
      setPortfolioContext,
      tier,
      setTier,
    }),
    [portfolioContext, tier]
  );

  const isPaid = tier === 'foundersClub' || tier === 'corporateSponsor';

  return (
    <PocketAnalystContext.Provider value={value}>
      {children}
      {user && (
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

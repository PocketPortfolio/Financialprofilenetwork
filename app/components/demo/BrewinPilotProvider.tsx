'use client';

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import {
  BREWIN_PILOT_DATASET,
  buildBrewinPilotDisplayTrades,
  isBrewinPilotEmail,
  isBrewinPilotRequested,
} from '@/app/lib/demo/brewin-manchester-pilot';
import type { Trade } from '@/app/services/tradeService';

type BrewinPilotContextValue = {
  active: boolean;
  requested: boolean;
  allowed: boolean;
  overlayTrades: Trade[];
};

const BrewinPilotContext = createContext<BrewinPilotContextValue>({
  active: false,
  requested: false,
  allowed: false,
  overlayTrades: [],
});

export function useBrewinPilot() {
  return useContext(BrewinPilotContext);
}

export function BrewinPilotProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname() ?? '';
  const search = typeof window !== 'undefined' ? window.location.search : '';
  const requested = isBrewinPilotRequested(pathname, search);
  const allowed = isBrewinPilotEmail(user?.email);
  const active = requested && allowed;

  useEffect(() => {
    const root = document.documentElement;
    if (active) {
      root.setAttribute('data-enterprise-pilot', BREWIN_PILOT_DATASET);
    } else if (root.getAttribute('data-enterprise-pilot') === BREWIN_PILOT_DATASET) {
      root.removeAttribute('data-enterprise-pilot');
    }
    return () => {
      if (root.getAttribute('data-enterprise-pilot') === BREWIN_PILOT_DATASET) {
        root.removeAttribute('data-enterprise-pilot');
      }
    };
  }, [active]);

  const overlayTrades = useMemo(
    () => (active ? buildBrewinPilotDisplayTrades(user?.uid ?? 'brewin-pilot') : []),
    [active, user?.uid]
  );

  const value = useMemo(
    () => ({ active, requested, allowed, overlayTrades }),
    [active, requested, allowed, overlayTrades]
  );

  return <BrewinPilotContext.Provider value={value}>{children}</BrewinPilotContext.Provider>;
}

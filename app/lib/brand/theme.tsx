'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface BrandContextType {
  // Add any brand-related context here if needed
}

const BrandContext = createContext<BrandContextType>({});

export function BrandProvider({ children }: { children: ReactNode }) {
  return (
    <BrandContext.Provider value={{}}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
}


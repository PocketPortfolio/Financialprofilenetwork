'use client';

import { createContext, useContext } from 'react';

const SurfaceHostContext = createContext<string>('www.pocketportfolio.app');

/** Request host from the server layout — keeps cross-surface hrefs aligned on SSR + hydration. */
export function SurfaceHostProvider({
  host,
  children,
}: {
  host: string;
  children: React.ReactNode;
}) {
  return <SurfaceHostContext.Provider value={host}>{children}</SurfaceHostContext.Provider>;
}

export function useSurfaceHost(): string {
  return useContext(SurfaceHostContext);
}

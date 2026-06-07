'use client';

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'pp-desktop-nav-open';

export type DesktopNavContextValue = {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
};

const DesktopNavContext = createContext<DesktopNavContextValue | null>(null);

function readStoredOpen(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeStoredOpen(open: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, open ? 'true' : 'false');
  } catch {
    // localStorage unavailable — in-memory state only
  }
}

export function DesktopNavProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIsOpen(readStoredOpen());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: boolean) => {
    setIsOpen(next);
    writeStoredOpen(next);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      writeStoredOpen(next);
      return next;
    });
  }, []);

  const close = useCallback(() => persist(false), [persist]);
  const open = useCallback(() => persist(true), [persist]);

  const value = useMemo<DesktopNavContextValue>(
    () => ({
      isOpen: hydrated ? isOpen : false,
      toggle,
      close,
      open,
    }),
    [close, hydrated, isOpen, open, toggle]
  );

  return createElement(DesktopNavContext.Provider, { value }, children);
}

/** Returns null when rendered outside `DesktopNavProvider` (e.g. admin analytics). */
export function useDesktopNavOptional(): DesktopNavContextValue | null {
  return useContext(DesktopNavContext);
}

export function useDesktopNav(): DesktopNavContextValue {
  const ctx = useContext(DesktopNavContext);
  if (!ctx) {
    throw new Error('useDesktopNav must be used within DesktopNavProvider');
  }
  return ctx;
}

'use client';

import { useEffect, useRef, useState } from 'react';
import {
  CLIENT_BRIEFING_USER_MESSAGE,
  parseBriefingBullets,
} from '@/app/lib/ai/clientBriefingPrompt';

export type ClientBriefingState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; bullets: [string, string, string]; source: 'ai' }
  | { status: 'fallback'; bullets: string[]; source: 'offline' }
  | { status: 'error' };

function hashContext(ctx: string): string {
  let h = 0;
  for (let i = 0; i < ctx.length; i++) {
    h = (h << 5) - h + ctx.charCodeAt(i);
    h |= 0;
  }
  return String(h);
}

const SESSION_PREFIX = 'pp_client_brief_v2_';
const LOAD_TIMEOUT_MS = 22_000;

function bulletsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((line, i) => line === b[i]);
}

export function useClientBriefing(opts: {
  enabled: boolean;
  portfolioContext: string;
  analyticsContext?: string;
  getAuthToken: () => Promise<string | null>;
  buildFallbackBullets: () => string[];
}): ClientBriefingState {
  const { enabled, portfolioContext, analyticsContext } = opts;

  const [state, setState] = useState<ClientBriefingState>({ status: 'idle' });
  const completedHashRef = useRef<string | null>(null);
  const generationRef = useRef(0);
  const getTokenRef = useRef(opts.getAuthToken);
  const fallbackRef = useRef(opts.buildFallbackBullets);
  getTokenRef.current = opts.getAuthToken;
  fallbackRef.current = opts.buildFallbackBullets;

  const contextHash = hashContext(portfolioContext + (analyticsContext ?? ''));

  const applyFallback = (hash: string, checkGeneration: number) => {
    const bullets = fallbackRef.current();
    completedHashRef.current = hash;
    setState((prev) => {
      if (generationRef.current !== checkGeneration) return prev;
      if (prev.status === 'fallback' && bulletsEqual(prev.bullets, bullets)) {
        return prev;
      }
      return { status: 'fallback', bullets, source: 'offline' };
    });
  };

  useEffect(() => {
    if (!enabled || !portfolioContext.trim()) {
      completedHashRef.current = null;
      setState((prev) => (prev.status === 'idle' ? prev : { status: 'idle' }));
      return;
    }

    if (completedHashRef.current === contextHash) {
      return;
    }

    const cacheKey = `${SESSION_PREFIX}${contextHash}`;

    if (typeof sessionStorage !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as { bullets: string[] };
          if (parsed.bullets?.length >= 3) {
            const trio = parsed.bullets.slice(0, 3) as [string, string, string];
            completedHashRef.current = contextHash;
            setState((prev) => {
              if (
                prev.status === 'ready' &&
                prev.source === 'ai' &&
                bulletsEqual(prev.bullets, trio)
              ) {
                return prev;
              }
              return { status: 'ready', bullets: trio, source: 'ai' };
            });
            return;
          }
        }
      } catch {
        /* ignore */
      }
    }

    const gen = ++generationRef.current;
    let cancelled = false;

    setState((prev) => (prev.status === 'loading' ? prev : { status: 'loading' }));

    (async () => {
      try {
        const token = await getTokenRef.current();
        if (cancelled || generationRef.current !== gen) return;

        if (!token) {
          applyFallback(contextHash, gen);
          return;
        }

        const fullContext = [portfolioContext, analyticsContext].filter(Boolean).join('\n\n');

        const signal =
          typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
            ? (AbortSignal as unknown as { timeout: (ms: number) => AbortSignal }).timeout(20000)
            : undefined;

        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          signal,
          body: JSON.stringify({
            message: CLIENT_BRIEFING_USER_MESSAGE,
            context: fullContext,
          }),
        });

        if (cancelled || generationRef.current !== gen) return;

        if (!res.ok) {
          throw new Error(`briefing_${res.status}`);
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error('no_body');

        let full = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
        }

        if (cancelled || generationRef.current !== gen) return;

        const bullets = parseBriefingBullets(full);
        if (bullets.length >= 3) {
          const trio = bullets.slice(0, 3) as [string, string, string];
          completedHashRef.current = contextHash;
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify({ bullets: trio }));
          } catch {
            /* ignore */
          }
          setState((prev) => {
            if (generationRef.current !== gen) return prev;
            if (
              prev.status === 'ready' &&
              prev.source === 'ai' &&
              bulletsEqual(prev.bullets, trio)
            ) {
              return prev;
            }
            return { status: 'ready', bullets: trio, source: 'ai' };
          });
        } else {
          throw new Error('parse_failed');
        }
      } catch {
        if (!cancelled && generationRef.current === gen) {
          applyFallback(contextHash, gen);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, contextHash, portfolioContext, analyticsContext]);

  // Watchdog: never leave the card beaming empty indefinitely
  useEffect(() => {
    if (!enabled || state.status !== 'loading') return;

    const hashAtStart = contextHash;
    const timer = window.setTimeout(() => {
      if (completedHashRef.current === hashAtStart) return;
      applyFallback(hashAtStart, generationRef.current);
    }, LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [enabled, state.status, contextHash]);

  return state;
}

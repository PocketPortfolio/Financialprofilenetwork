// src/hooks/useLivePrices.ts
import { useEffect, useRef, useState } from 'react';
import { getQuotes, Quote } from '@/services/api';

export function useLivePrices(symbols: string[], intervalMs = 30_000) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const lastGood = useRef<Quote[]>([]);
  const backoff = useRef(0);

  useEffect(() => {
    let alive = true;
    let timer: number | undefined;

    function nextDelay() {
      const visPenalty = (typeof document !== 'undefined' && document.hidden) ? 2 : 1;
      const base = intervalMs * visPenalty;
      const bo = Math.min(4, backoff.current || 0); // cap 4x
      const jitter = Math.floor(Math.random() * 1000);
      return Math.floor(base * (1 + bo)) + jitter;
    }

    async function tick() {
      if (!symbols.length) { setQuotes([]); return schedule(); }
      setLoading(true);
      try {
        const q = await getQuotes(symbols);
        if (!alive) return;
        setQuotes(q);
        lastGood.current = q;
        backoff.current = 0; // reset on success
      } catch {
        if (!alive) return;
        // keep showing last known quotes
        if (lastGood.current.length) setQuotes(lastGood.current);
        backoff.current = (backoff.current || 1) * 2;
      } finally {
        if (alive) { setLoading(false); schedule(); }
      }
    }

    function schedule() {
      timer = setTimeout(tick, nextDelay()) as unknown as number;
    }

    tick();
    const visHandler = () => { if (!document.hidden) { clearTimeout(timer); tick(); } };
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', visHandler);

    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', visHandler);
    };
  }, [symbols.join(','), intervalMs]);

  return { quotes, loading };
}

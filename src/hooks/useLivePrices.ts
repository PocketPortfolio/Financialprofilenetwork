import { useEffect, useState } from 'react';
import { getQuotes, Quote } from '@services/api';

export function useLivePrices(symbols: string[], intervalMs = 30_000) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!symbols.length) { setQuotes([]); return; }
      setLoading(true);
      try {
        const q = await getQuotes(symbols);
        if (alive) setQuotes(q);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    const id = setInterval(load, intervalMs);
    return () => { alive = false; clearInterval(id); };
  }, [symbols.join(','), intervalMs]);

  return { quotes, loading };
}

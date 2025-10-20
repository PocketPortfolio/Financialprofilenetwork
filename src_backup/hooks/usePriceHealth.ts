import { useEffect, useRef, useState } from 'react';
import { getPriceHealth, type ProviderHealth } from '../services/api';

type State = { health: ProviderHealth[]; loading: boolean; error: string | null };

export function usePriceHealth(intervalMs = 30000): State {
  const [health, setHealth] = useState<ProviderHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  async function tick() {
    try {
      const data = await getPriceHealth();
      setHealth(data.providers || []);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    tick();
    timer.current = window.setInterval(tick, Math.max(5000, intervalMs));
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [intervalMs]);

  return { health, loading, error };
}

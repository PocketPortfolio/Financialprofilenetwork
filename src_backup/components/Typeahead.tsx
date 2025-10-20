import { useEffect, useMemo, useState } from 'react';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { searchAssets } from '@services/api';

type Props = {
  value: string;
  onSelect: (symbol: string, meta?: { type?: 'stock'|'crypto'; currency?: string }) => void;
  placeholder?: string;
};

export default function Typeahead({ value, onSelect, placeholder = 'Search stocks or crypto…' }: Props) {
  const [q, setQ] = useState(value);
  const debounced = useDebouncedValue(q, 300);
  const [results, setResults] = useState<Array<{ symbol: string; name: string; type: any; currency?: string }>>([]);

  useEffect(() => { setQ(value); }, [value]);

  useEffect(() => {
    let alive = true;
    async function run() {
      if (!debounced.trim()) { setResults([]); return; }
      const r = await searchAssets(debounced);
      if (alive) setResults(r);
    }
    run();
    return () => { alive = false; };
  }, [debounced]);

  return (
    <div className="typeahead">
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder={placeholder}
        aria-autocomplete="list"
      />
      {results.length > 0 && (
        <ul className="dropdown">
          {results.slice(0, 10).map(r => (
            <li key={r.symbol}>
              <button
                type="button"
                onClick={() => onSelect(r.symbol, { type: r.type, currency: r.currency })}
              >
                <strong>{r.symbol}</strong> — {r.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

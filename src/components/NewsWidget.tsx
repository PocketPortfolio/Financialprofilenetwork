// src/components/NewsWidget.tsx
import { useEffect, useMemo, useState } from 'react';
import { getNews } from '@services/api';

type NewsItem = { title: string; url: string; publisher?: string; published?: string; image?: string | null };

export default function NewsWidget({ tickers }: { tickers: string[] }) {
  const symbols = useMemo(
    () => [...new Set(tickers.map(t => t.trim().toUpperCase()).filter(Boolean))].slice(0, 8),
    [tickers.join(',')]
  );
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    async function run() {
      if (!symbols.length) { setItems([]); return; }
      setLoading(true);
      try {
        const n = await getNews(symbols, 20);
        if (alive) setItems(n);
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    const id = setInterval(run, 5 * 60_000);
    return () => { alive = false; clearInterval(id); };
  }, [symbols.join(',')]);

  if (!symbols.length) return <p className="muted">Add assets to see relevant news.</p>;

  return (
    <div className={`news-grid ${loading ? 'is-loading' : ''}`}>
      {items.map((n, i) => (
        <article key={`${n.url}-${i}`} className="news-card">
          {n.image ? <img className="news-thumb" src={n.image} alt="" loading="lazy" referrerPolicy="no-referrer" /> : null}
          <div className="news-body">
            <h4 title={n.title}><a href={n.url} target="_blank" rel="noreferrer">{n.title}</a></h4>
            <small>{n.publisher ?? new URL(n.url).hostname}{n.published ? ` • ${new Date(n.published).toLocaleString()}` : ''}</small>
          </div>
        </article>
      ))}
      {!loading && items.length === 0 && <p>No news found for {symbols.join(', ')} yet.</p>}
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { getNews } from '@services/api';

export default function NewsWidget({ tickers }: { tickers: string[] }) {
  const symbols = useMemo(() => [...new Set(tickers)].filter(Boolean).slice(0, 8), [tickers.join(',')]);
  const [items, setItems] = useState<Array<{ title: string; url: string; publisher?: string; published?: string; image?: string | null }>>([]);

  useEffect(() => {
    let alive = true;
    async function run() {
      if (!symbols.length) { setItems([]); return; }
      const n = await getNews(symbols, 20);
      if (alive) setItems(n);
    }
    run();
    const id = setInterval(run, 5 * 60_000);
    return () => { alive = false; clearInterval(id); };
  }, [symbols.join(',')]);

  return (
    <div className="news-grid">
      {items.map((n, i) => (
        <article key={`${n.url}-${i}`} className="news-card">
          {n.image ? <img className="news-thumb" src={n.image} alt="" loading="lazy" /> : null}
          <div className="news-body">
            <h4 title={n.title}><a href={n.url} target="_blank" rel="noreferrer">{n.title}</a></h4>
            <small>{n.publisher} {n.published ? `• ${new Date(n.published).toLocaleString()}` : ''}</small>
          </div>
        </article>
      ))}
      {items.length === 0 && <p>No news yet.</p>}
    </div>
  );
}

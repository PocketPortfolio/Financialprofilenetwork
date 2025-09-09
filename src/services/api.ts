export type Quote = { symbol: string; price: number | null; change?: number | null; currency?: string; name?: string };

export async function searchAssets(q: string) {
  if (!q.trim()) return [];
  const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  if (!r.ok) return [];
  return r.json() as Promise<Array<{ symbol: string; name: string; type: 'stock'|'crypto'; currency?: string }>>;
}

export async function getQuotes(symbols: string[]) {
  if (!symbols.length) return [];
  const r = await fetch(`/api/quote?symbols=${encodeURIComponent(symbols.join(','))}`);
  if (!r.ok) return [];
  return r.json() as Promise<Quote[]>;
}

export async function getNews(tickers: string[], limit = 20) {
  if (!tickers.length) return [];
  const r = await fetch(`/api/news?tickers=${encodeURIComponent(tickers.join(','))}&limit=${limit}`);
  if (!r.ok) return [];
  return r.json() as Promise<Array<{ title: string; url: string; publisher?: string; published?: string }>>;
}
export async function getNews(tickers: string[], limit = 20) {
  if (!tickers.length) return [];
  const r = await fetch(`/api/news?tickers=${encodeURIComponent(tickers.join(','))}&limit=${limit}`);
  if (!r.ok) return [];
  return r.json() as Promise<Array<{
    title: string; url: string; publisher?: string; published?: string; image?: string | null
  }>>;
}
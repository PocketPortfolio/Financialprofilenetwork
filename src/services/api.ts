// src/services/api.ts
export type Quote = { symbol: string; price: number | null; change?: number | null; currency?: string; name?: string };

function cleanTickers(tickers: string[]) {
  return [...new Set(tickers.map(t => t.trim().toUpperCase()).filter(Boolean))].slice(0, 8);
}

export async function searchAssets(q: string) {
  if (!q.trim()) return [];
  const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
  if (!r.ok) return [];
  return r.json() as Promise<Array<{ symbol: string; name: string; type: 'stock'|'crypto'; currency?: string }>>;
}

export async function getQuotes(symbols: string[]) {
  const list = cleanTickers(symbols);
  if (!list.length) return [];
  const r = await fetch(`/api/quote?symbols=${encodeURIComponent(list.join(','))}`, { cache: 'no-store' });
  if (!r.ok) return [];
  return r.json() as Promise<Quote[]>;
}

export async function getNews(tickers: string[], limit = 20) {
  const list = cleanTickers(tickers);
  if (!list.length) return [];
  const r = await fetch(`/api/news?tickers=${encodeURIComponent(list.join(','))}&limit=${Math.min(Math.max(limit,1),50)}`, { cache: 'no-store' });
  if (!r.ok) return [];
  return r.json() as Promise<Array<{ title: string; url: string; publisher?: string; published?: string; image?: string | null }>>;
}

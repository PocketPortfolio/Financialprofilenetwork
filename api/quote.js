// /api/quote.js — Edge runtime, robust change% computation
export const config = { runtime: 'edge' };

const JUA = { 'User-Agent': 'Mozilla/5.0 (PocketPortfolio)', 'Accept': 'application/json' };

// ---- Yahoo batch (fast path) ----
async function yahooBatch(symbols) {
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(','))}`;
  let r = await fetch(url, { headers: JUA });
  if (!r.ok) r = await fetch(url.replace('query1','query2'), { headers: JUA });
  if (!r.ok) throw new Error(`yahoo_${r.status}`);
  const j = await r.json();
  const rows = j?.quoteResponse?.result || [];
  return rows.map(x => ({
    symbol: (x.symbol || '').toUpperCase(),
    name: x.shortName || x.longName || x.symbol || '',
    currency: x.currency || null,
    price: x.regularMarketPrice ?? x.postMarketPrice ?? x.preMarketPrice ?? null,
    change: x.regularMarketChange ?? x.postMarketChange ?? x.preMarketChange ?? null,
    changePct: x.regularMarketChangePercent ?? x.postMarketChangePercent ?? x.preMarketChangePercent ?? null,
    source: 'yahoo'
  }));
}

// ---- Yahoo chart (get last & previous close) ----
async function yahooChart(sym) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=5d&interval=1d`;
  const r = await fetch(url, { headers: JUA });
  if (!r.ok) throw new Error(`yahoo_chart_${r.status}`);
  const j = await r.json();
  const res = j?.chart?.result?.[0];
  if (!res) throw new Error('yahoo_chart_empty');

  const closes = res?.indicators?.quote?.[0]?.close || [];
  const last = closes.filter(v => v != null).slice(-1)[0];
  const prev = closes.filter(v => v != null).slice(-2, -1)[0];
  const currency = res?.meta?.currency || null;

  let change = null, changePct = null, price = null;
  if (last != null) price = Number(last);
  if (price != null && prev != null && prev !== 0) {
    change = price - prev;
    changePct = (change / prev) * 100;
  }
  return { price, currency, change, changePct };
}

// ---- Stooq multi-day (get last & previous close) ----
async function stooqTwo(sym) {
  const candidates = [sym.toLowerCase(), `${sym.toLowerCase()}.us`];
  for (const s of candidates) {
    const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(s)}&i=d`;
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (PocketPortfolio)' } });
    if (!r.ok) continue;
    const lines = (await r.text()).trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 3) continue;
    const head = lines[0].split(',').map(x => x.toLowerCase());
    const idx = Object.fromEntries(head.map((h, i) => [h, i]));
    const last = lines[lines.length - 1].split(',');
    const prev = lines[lines.length - 2].split(',');
    const c1 = last[idx.close], c0 = prev[idx.close];
    if (c1 && c1 !== 'N/D' && c0 && c0 !== 'N/D') {
      const p1 = Number(c1), p0 = Number(c0);
      const change = p1 - p0;
      const changePct = p0 ? (change / p0) * 100 : null;
      return { price: p1, currency: null, change, changePct };
    }
  }
  return { price: null, currency: null, change: null, changePct: null };
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get('symbols') || searchParams.get('s') || '').trim();
  const symbols = [...new Set(raw.split(/[,\s]+/).map(s => s.trim().toUpperCase()).filter(Boolean))];

  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json', 'Cache-Control': 's-maxage=20, stale-while-revalidate=60' };
  if (!symbols.length) return new Response('[]', { headers });

  // 1) Try Yahoo batch
  let batch = [];
  try { batch = await yahooBatch(symbols); } catch {}

  const by = new Map(batch.map(r => [r.symbol, r]));
  const out = [];

  // 2) Per symbol, ensure change% exists; otherwise compute via chart or stooq
  for (const sym of symbols) {
    let rec = by.get(sym);
    if (!rec) rec = { symbol: sym, name: sym, currency: 'USD', price: null, change: null, changePct: null, source: 'none' };

    if (rec.changePct == null || rec.price == null) {
      try {
        const y = await yahooChart(sym);
        rec.price = rec.price ?? y.price;
        rec.currency = rec.currency ?? y.currency;
        rec.change = rec.change ?? y.change;
        rec.changePct = rec.changePct ?? y.changePct;
        rec.source = rec.source === 'yahoo' ? 'yahoo' : 'yahoo_chart';
      } catch {
        try {
          const s = await stooqTwo(sym);
          rec.price = rec.price ?? s.price;
          rec.change = rec.change ?? s.change;
          rec.changePct = rec.changePct ?? s.changePct;
          if (!rec.currency) rec.currency = s.currency;
          if (rec.source === 'none') rec.source = 'stooq';
        } catch {}
      }
    }
    out.push(rec);
  }

  return new Response(JSON.stringify(out), { headers });
}

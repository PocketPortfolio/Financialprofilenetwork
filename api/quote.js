// /api/quote.js — Edge runtime, robust change% computation + rate-limit + CORS allowlist
export const config = { runtime: 'edge' };

import { rateLimit } from './_rate-limit-edge.js';

const JUA = { 'User-Agent': 'Mozilla/5.0 (PocketPortfolio)', 'Accept': 'application/json' };
const ALLOWED = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const DEV_DEFAULTS = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'];
const ALLOWLIST = new Set([...DEV_DEFAULTS, ...ALLOWED]);

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
    price: typeof x.regularMarketPrice === 'number' ? x.regularMarketPrice : null,
    change: typeof x.regularMarketChange === 'number' ? x.regularMarketChange : null,
    changePct: typeof x.regularMarketChangePercent === 'number' ? x.regularMarketChangePercent : null,
    currency: x.currency || '',
    source: 'yahoo'
  }));
}

// ---- Yahoo chart (compute change%) ----
async function yahooChart(sym) {
  const u = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=1d&interval=1m`;
  const r = await fetch(u, { headers: JUA });
  if (!r.ok) throw new Error(`chart_${r.status}`);
  const j = await r.json();
  const res = j?.chart?.result?.[0];
  const px = (res?.indicators?.quote?.[0]?.close || []).filter(n => typeof n === 'number');
  if (!px.length) throw new Error('no_px');
  const last = px[px.length - 1];
  const first = px.find(n => typeof n === 'number');
  const change = last - first;
  const changePct = first ? (change / first) * 100 : null;
  return {
    price: last ?? null,
    change: Number.isFinite(change) ? change : null,
    changePct: Number.isFinite(changePct) ? changePct : null,
    currency: res?.meta?.currency || ''
  };
}

// ---- Stooq fallback ----
async function stooqTwo(sym) {
  const u = `https://stooq.com/q/l/?s=${encodeURIComponent(sym.toLowerCase())}&f=sd2t2ohlcv&h&e=csv`;
  const r = await fetch(u, { headers: { 'User-Agent': JUA['User-Agent'], 'Accept': 'text/csv' } });
  if (!r.ok) throw new Error(`stooq_${r.status}`);
  const t = await r.text();
  const [_, ...rows] = t.trim().split(/\r?\n/);
  if (!rows.length) throw new Error('stooq_empty');
  const cols = rows[0].split(',');
  const close = parseFloat(cols[6]); // Close
  const open  = parseFloat(cols[3]); // Open
  const change = Number.isFinite(close) && Number.isFinite(open) ? (close - open) : null;
  const changePct = (Number.isFinite(change) && open) ? (change / open) * 100 : null;
  return { price: Number.isFinite(close) ? close : null, change, changePct, currency: '' };
}

export default async function handler(req) {
  const url = new URL(req.url);
  const origin = req.headers.get('origin');
  const originOk = origin && ALLOWLIST.has(origin);
  const headers = {
    ...(originOk ? { 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin' } : {}),
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 's-maxage=20, stale-while-revalidate=60'
  };

  const rl = rateLimit(req, 'quote');
  headers['X-RateLimit-Limit'] = String(rl.limit);
  headers['X-RateLimit-Remaining'] = String(rl.remaining);
  headers['X-RateLimit-Reset'] = String(Math.floor(rl.reset / 1000));
  if (rl.limited) return new Response(JSON.stringify({ error: 'rate_limited' }), { status: 429, headers });

  const raw = (url.searchParams.get('symbols') || '').trim();
  const symbols = [...new Set(raw.split(/[,\s]+/).map(s => s.trim().toUpperCase()).filter(Boolean))].slice(0, 30);
  if (!symbols.length) return new Response('[]', { headers });

  // 1) Try Yahoo batch
  let batch = [];
  try { batch = await yahooBatch(symbols); } catch {}

  const by = new Map(batch.map(r => [r.symbol, r]));
  const out = [];

  // 2) Per symbol ensure we have price/change/changePct; compute via chart or stooq if missing
  for (const sym of symbols) {
    let rec = by.get(sym);
    if (!rec) rec = { symbol: sym, name: sym, price: null, change: null, changePct: null, currency: '', source: 'none' };

    if (rec.changePct == null || rec.price == null) {
      try {
        const c = await yahooChart(sym);
        rec.price = rec.price ?? c.price;
        rec.change = rec.change ?? c.change;
        rec.changePct = rec.changePct ?? c.changePct;
        if (!rec.currency) rec.currency = c.currency;
        if (rec.source === 'none') rec.source = 'yahoo_chart';
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

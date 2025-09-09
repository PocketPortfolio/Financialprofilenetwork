// /api/news.js — Edge runtime, symbol→topic expansion + fair interleave
export const config = { runtime: 'edge' };

const DOMAIN_CAP = 3;         // per-domain cap per ticker
const PER_TICKER_MAX = 6;     // up to this many per ticker before interleave
const UA = { 'User-Agent': 'Mozilla/5.0 (PocketPortfolio)', 'Accept': 'application/rss+xml,text/xml,*/*' };

// ---------- helpers ----------
function pick(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? m[1].replace(/<!\\[CDATA\\[|\\]\\]>/g, '').trim() : '';
}
function attr(xml, tag, a) {
  const m = xml.match(new RegExp(`<${tag}[^>]*\\b${a}="([^"]+)"[^>]*>`, 'i'));
  return m ? m[1] : null;
}
function firstImg(text) {
  return attr(text, 'media:content', 'url') || attr(text, 'enclosure', 'url') || (text.match(/<img[^>]+src="([^"]+)"/i)?.[1] ?? null);
}
function domainOf(u) { try { return new URL(u).hostname.replace(/^www\\./,''); } catch { return ''; } }

async function fetchText(url) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`fetch_${r.status}`);
  return r.text();
}

// Expand ticker into useful search queries
async function expandQueries(ticker) {
  const t = ticker.toUpperCase();

  // Basic set
  const q = new Set([t]);

  // Yahoo search for company / instrument name
  try {
    const sUrl = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(t)}`;
    const sRes = await fetch(sUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (PocketPortfolio)' } });
    if (sRes.ok) {
      const j = await sRes.json();
      const name = j?.quotes?.[0]?.shortname || j?.quotes?.[0]?.longname;
      if (name) q.add(name);
    }
  } catch {}

  // Crypto heuristics
  if (/-USD$/.test(t) || /^(BTC|ETH|SOL|ADA|DOGE|AVAX|XRP)\b/.test(t) || t === 'BTC' || t === 'ETH') {
    if (/BTC/.test(t)) q.add('Bitcoin');
    if (/ETH/.test(t)) q.add('Ethereum');
    if (/SOL/.test(t)) q.add('Solana');
  }

  // FX heuristics (Yahoo FX looks like EURUSD=X, USDJPY=X, or just XXX=X)
  if (/=X$/.test(t)) {
    const base = t.replace(/=X$/,'');
    q.add(`${base} currency`);
    q.add(`USD ${base} exchange rate`);
  }

  // ETF-ish safety: add “stock” keyword
  q.add(`${t} stock`);

  return [...q];
}

// Parse an RSS feed into items
function parseRss(xml, symbolTag) {
  const items = [];
  const parts = xml.split(/<item>/i).slice(1).map(x => x.split(/<\/item>/i)[0]);
  for (const it of parts) {
    const title = pick(it, 'title');
    let link = pick(it, 'link') || pick(it, 'guid');
    if (!title || !link) continue;

    if (link.includes('news.google.com/rss/articles/')) {
      try { const u = new URL(link); const direct = u.searchParams.get('url'); if (direct) link = direct; } catch {}
    }
    items.push({
      title,
      url: link,
      source: pick(it, 'source') || domainOf(link),
      publishedAt: (() => { const d = pick(it, 'pubDate') || pick(it, 'published'); return d ? new Date(d).toISOString() : null; })(),
      image: firstImg(it)
    });
  }
  return items;
}

// Fetch per-ticker with domain cap and per-ticker limit
async function fetchForTicker(ticker) {
  const queries = await expandQueries(ticker);
  const perDomain = new Map();
  const bag = [];

  // Pull a couple of feeds per query (Google News RSS)
  const feeds = await Promise.allSettled(queries.map(q =>
    fetchText(`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`)
  ));

  for (const fx of feeds) {
    if (fx.status !== 'fulfilled') continue;
    const items = parseRss(fx.value, ticker);

    for (const n of items) {
      const d = domainOf(n.url);
      const used = perDomain.get(d) || 0;
      if (used >= DOMAIN_CAP) continue;
      perDomain.set(d, used + 1);

      bag.push({ ...n, _ticker: ticker });
      if (bag.length >= PER_TICKER_MAX) break;
    }
    if (bag.length >= PER_TICKER_MAX) break;
  }

  // sort newest first
  bag.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
  return bag;
}

// Round-robin interleave to ensure all tickers appear
function interleave(arrays, limit) {
  const out = [];
  let i = 0;
  while (out.length < limit) {
    let added = false;
    for (const a of arrays) {
      if (i < a.length && out.length < limit) {
        // de-dupe by URL
        if (!out.some(x => x.url === a[i].url)) {
          out.push(a[i]);
          added = true;
        }
      }
    }
    if (!added) break;
    i++;
  }
  return out;
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get('tickers') || searchParams.get('q') || '').trim();
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 50);
  const tickers = [...new Set(raw.split(/[,\s]+/).map(s => s.trim()).filter(Boolean))].slice(0, 8);

  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json', 'Cache-Control': 's-maxage=180, stale-while-revalidate=600' };
  if (!tickers.length) return new Response('[]', { headers });

  const perTicker = await Promise.all(tickers.map(fetchForTicker));
  const merged = interleave(perTicker, limit);
  return new Response(JSON.stringify(merged), { headers });
}

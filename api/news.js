// /api/news.js — Edge runtime, returns fields your UI expects:
// { title, url, source, publishedAt, image }
export const config = { runtime: "edge" };

import { rateLimit } from "./_rate-limit-edge.js";

const DOMAIN_CAP = 3;
const PER_TICKER_MAX = 6;
const UA = {
  "User-Agent": "Mozilla/5.0 (PocketPortfolio)",
  Accept: "application/rss+xml,text/xml,*/*",
};

function J(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "s-maxage=180, stale-while-revalidate=600", ...headers },
  });
}

function pick(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "";
}
function attr(xml, tag, a) {
  const m = xml.match(new RegExp(`<${tag}[^>]*\\b${a}="([^"]+)"[^>]*>`, "i"));
  return m ? m[1] : null;
}
function domainOf(u) {
  try {
    return new URL(u).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}
function firstImg(xml) {
  return attr(xml, "media:content", "url") || attr(xml, "enclosure", "url") || null;
}
async function fetchText(url) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`fetch_${r.status}`);
  return r.text();
}

async function expandQueries(ticker) {
  const t = ticker.toUpperCase();
  const q = new Set([t, `${t} stock`]);
  try {
    const sUrl = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(t)}`;
    const s = await fetch(sUrl, { headers: { "User-Agent": UA["User-Agent"], Accept: "application/json" } });
    if (s.ok) {
      const j = await s.json();
      const name = j?.quotes?.[0]?.shortname || j?.quotes?.[0]?.longname;
      if (name) q.add(name);
    }
  } catch {}
  return [...q];
}

function parseRss(xml) {
  const items = [];
  const parts = xml.split(/<item>/i).slice(1).map((x) => x.split(/<\/item>/i)[0]);
  for (const it of parts) {
    const title = pick(it, "title");
    let link = pick(it, "link") || pick(it, "guid");
    if (!title || !link) continue;
    if (link.includes("news.google.com/rss/articles/")) {
      try {
        const u = new URL(link);
        const direct = u.searchParams.get("url");
        if (direct) link = direct;
      } catch {}
    }
    items.push({
      title,
      url: link,
      source: pick(it, "source") || domainOf(link),
      publishedAt: (() => {
        const d = pick(it, "pubDate") || pick(it, "published");
        return d ? new Date(d).toISOString() : "";
      })(),
      image: firstImg(it),
    });
  }
  return items;
}

async function fetchForTicker(ticker) {
  const queries = await expandQueries(ticker);
  const feeds = await Promise.allSettled(
    queries.map((q) =>
      fetchText(
        `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-GB&gl=GB&ceid=GB:en`
      )
    )
  );

  const perDomain = new Map();
  const bag = [];
  for (const fx of feeds) {
    if (fx.status !== "fulfilled") continue;
    const items = parseRss(fx.value);
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
  return bag;
}

function interleave(groups, limit) {
  const idx = new Array(groups.length).fill(0);
  const out = [];
  let added = true;
  while (out.length < limit && added) {
    added = false;
    for (let i = 0; i < groups.length && out.length < limit; i++) {
      const g = groups[i];
      const k = idx[i];
      if (k < g.length) {
        out.push(g[k]);
        idx[i] = k + 1;
        added = true;
      }
    }
  }
  return out.map(({ _ticker, ...rest }) => rest);
}

export default async function handler(req) {
  const rl = rateLimit(req, "news");
  const headers = {
    "X-RateLimit-Limit": String(rl.limit),
    "X-RateLimit-Remaining": String(rl.remaining),
    "X-RateLimit-Reset": String(Math.floor(rl.reset / 1000)),
  };
  if (rl.limited) return J({ error: "rate_limited" }, 429, headers);

  const url = new URL(req.url);
  const raw = (url.searchParams.get("tickers") || url.searchParams.get("q") || "").trim();
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "20", 10), 1), 50);
  const tickers = [...new Set(raw.split(/[,\s]+/).map((s) => s.trim().toUpperCase()).filter(Boolean))].slice(0, 8);
  if (!tickers.length) return J([], 200, headers);

  const perTicker = await Promise.all(tickers.map(fetchForTicker));
  const merged = interleave(perTicker, limit);

  return J(merged, 200, {
    ...headers,
    "X-Data-Source": "google-rss+publishers",
    "X-Data-Timestamp": new Date().toISOString(),
  });
}

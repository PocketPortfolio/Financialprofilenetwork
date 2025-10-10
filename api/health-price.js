// /api/health-price.js — GET: Price pipeline health snapshot (+ self-healing probe)
export const config = { runtime: "edge" };

import {
  getPriceHealth,
  recordProviderResult,
  shouldProbe,
  markProbed,
} from "./_health.js";

// Very small pings to each upstream. We only check r.ok; no heavy parsing required.
const JUA = {
  "User-Agent": "Mozilla/5.0 (PocketPortfolio)",
  Accept: "application/json",
};

async function pingYahooQuote() {
  try {
    const r = await fetch(
      "https://query1.finance.yahoo.com/v7/finance/quote?symbols=AAPL",
      { headers: JUA, cache: "no-store" }
    );
    if (!r.ok) throw new Error(String(r.status));
    await recordProviderResult("yahoo", true);
  } catch {
    await recordProviderResult("yahoo", false);
  }
}

async function pingYahooChart() {
  try {
    const r = await fetch(
      "https://query2.finance.yahoo.com/v8/finance/chart/AAPL?range=1d&interval=1m",
      { headers: JUA, cache: "no-store" }
    );
    if (!r.ok) throw new Error(String(r.status));
    await recordProviderResult("chart", true);
  } catch {
    await recordProviderResult("chart", false);
  }
}

async function pingStooq() {
  try {
    const r = await fetch(
      "https://stooq.com/q/l/?s=aapl&f=sd2t2ohlcv&h&e=csv",
      { headers: { "User-Agent": JUA["User-Agent"], Accept: "text/csv" }, cache: "no-store" }
    );
    if (!r.ok) throw new Error(String(r.status));
    await recordProviderResult("stooq", true);
  } catch {
    await recordProviderResult("stooq", false);
  }
}

function json(body, { status = 200, headers = {} } = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "s-maxage=5, stale-while-revalidate=20",
      ...headers,
    },
  });
}

export default async function handler() {
  // If the store is empty/stale (and not probed too recently), do a quick probe.
  if (await shouldProbe(30_000)) {
    await markProbed();
    await Promise.allSettled([pingYahooQuote(), pingYahooChart(), pingStooq()]);
    // fall through to return the now-updated snapshot
  }

  const data = await getPriceHealth();
  return json(data);
}

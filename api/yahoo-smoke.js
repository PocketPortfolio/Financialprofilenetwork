// /api/yahoo-smoke.js — server-side reachability probe for Yahoo + Stooq
export const config = { runtime: "edge" };

const JUA = {
  "User-Agent": "Mozilla/5.0 (PocketPortfolio Smoke)",
  "Accept": "application/json",
};

async function tryFetch(url, headers) {
  const started = Date.now();
  try {
    const r = await fetch(url, { headers, cache: "no-store", redirect: "follow" });
    const ms = Date.now() - started;
    let sample = "";
    try {
      // fetch a tiny sample without consuming full body
      const text = await r.text();
      sample = text.slice(0, 120);
    } catch {}
    return { url, ok: r.ok, status: r.status, ms, sample };
  } catch (e) {
    const ms = Date.now() - started;
    return { url, ok: false, status: -1, ms, error: String(e && e.message || e) };
  }
}

export default async function handler() {
  // 3 representative endpoints
  const targets = [
    {
      name: "yahoo_quote_query1",
      url: "https://query1.finance.yahoo.com/v7/finance/quote?symbols=AAPL",
      headers: JUA,
    },
    {
      name: "yahoo_quote_query2",
      url: "https://query2.finance.yahoo.com/v7/finance/quote?symbols=AAPL",
      headers: JUA,
    },
    {
      name: "yahoo_chart",
      url: "https://query2.finance.yahoo.com/v8/finance/chart/AAPL?range=1d&interval=1m",
      headers: JUA,
    },
    {
      name: "stooq_csv",
      url: "https://stooq.com/q/l/?s=aapl&f=sd2t2ohlcv&h&e=csv",
      headers: { "User-Agent": JUA["User-Agent"], Accept: "text/csv" },
    },
  ];

  const results = {};
  await Promise.all(targets.map(async (t) => {
    results[t.name] = await tryFetch(t.url, t.headers);
  }));

  const body = {
    region: (globalThis.process?.env?.VERCEL_REGION) || "local",
    timestamp: new Date().toISOString(),
    results,
  };

  return new Response(JSON.stringify(body, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

// /api/most-traded.js — Node runtime (Yahoo screener)
export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  // CORS (safe for local testing)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const fetchImpl = globalThis.fetch || (await import("node-fetch")).default;

    const count = Math.max(1, Math.min(parseInt(req.query.count || "15", 10), 25));
    const region = String(req.query.region || "US").toUpperCase();

    const url =
      `https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved` +
      `?scrIds=most_actives&count=${count}&start=0&lang=en-US&region=${encodeURIComponent(region)}`;

    const r = await fetchImpl(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36",
        accept: "application/json, text/plain, */*",
      },
    });

    if (!r.ok) {
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json([]);
    }

    const json = await r.json();
    const quotes = json?.finance?.result?.[0]?.quotes || json?.quotes || [];

    const out = quotes.slice(0, count).map((q, i) => ({
      rank: i + 1,
      symbol: q.symbol,
      price: q.regularMarketPrice ?? null,
      changePct: q.regularMarketChangePercent ?? null,
      volume: q.regularMarketVolume ?? q.volume ?? null,
      marketCap: q.marketCap ?? null,
      currency: q.currency ?? null,
    }));

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=30");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(200).json(out);
  } catch {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json([]);
  }
}

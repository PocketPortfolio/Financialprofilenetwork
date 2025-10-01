// /api/fx.js
import { withCors } from "./_cors.js";

export default withCors(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const base = url.searchParams.get("base") || "USD";
  const symbols = url.searchParams.get("symbols") || "GBP,EUR";

  try {
    const r = await fetch(
      `https://api.exchangerate.host/latest?base=${encodeURIComponent(base)}&symbols=${encodeURIComponent(symbols)}`
    );
    if (!r.ok) return res.status(200).json({});
    const j = await r.json();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(j?.rates || {});
  } catch {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({});
  }
});

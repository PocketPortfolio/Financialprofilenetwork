// /api/crypto.js
import { withCors } from "./_cors.js";

export default withCors(async (req, res) => {
  const { id } = req.query || {}; // e.g., "bitcoin,ethereum"
  if (!id) return res.status(400).json({ error: "id_required" });

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
    id
  )}&vs_currencies=usd,gbp,eur&include_24hr_change=true`;

  try {
    const r = await fetch(url);
    if (!r.ok) return res.status(r.status).json({ error: "upstream_crypto_failed" });
    const json = await r.json();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    return res.status(200).json(json);
  } catch {
    return res.status(502).json({ error: "upstream_crypto_failed" });
  }
});

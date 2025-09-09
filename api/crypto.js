import { withCors } from './_cors';

export default withCors(async (req, res) => {
  const { id } = req.query || {}; // e.g., "bitcoin,ethereum"
  if (!id) return res.status(400).json({ error: 'id_required' });

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
    id
  )}&vs_currencies=usd,gbp,eur&include_24hr_change=true`;

  const r = await fetch(url);
  if (!r.ok) return res.status(r.status).json({ error: 'upstream_crypto_failed' });

  const json = await r.json();
  res.json(json);
});

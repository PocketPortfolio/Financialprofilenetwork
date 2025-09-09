import { withCors } from './_cors.js';

export default withCors(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const base = url.searchParams.get('base') || 'USD';
  const symbols = url.searchParams.get('symbols') || 'GBP,EUR';
  const r = await fetch(`https://api.exchangerate.host/latest?base=${encodeURIComponent(base)}&symbols=${encodeURIComponent(symbols)}`);
  const j = await r.json();
  res.status(200).json(j?.rates || {});
});

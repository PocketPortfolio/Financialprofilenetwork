import { withCors } from './_cors.js';

export default withCors(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const q = (url.searchParams.get('q') || '').trim();
  if (!q) return res.status(200).json([]);

  const r = await fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0`);
  const j = await r.json();

  const results = (j?.quotes || [])
    .filter(q => q.symbol)
    .map(q => ({
      symbol: q.symbol,
      name: q.shortname || q.longname || q.symbol,
      type: q.quoteType === 'CRYPTOCURRENCY' ? 'crypto' : 'stock',
      currency: q.currency || 'USD'
    }));

  res.status(200).json(results);
});

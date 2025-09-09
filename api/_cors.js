// shared helper – import and use in each route
export function withCors(handler) {
  return async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

    if (req.method === 'OPTIONS') return res.status(204).end();

    try {
      return await handler(req, res);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'upstream_failed' });
    }
  };
}

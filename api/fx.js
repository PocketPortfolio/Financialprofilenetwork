module.exports = async (req, res) => {
  const { base = 'USD', target = 'EUR' } = req.query;
  const response = await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`);
  const data = await response.json();
  const rate = data.rates ? data.rates[target] : null;
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).json({ base, target, rate });
};

module.exports = async (req, res) => {
  const { q } = req.query;
  if (!q) {
    res.status(400).json({ error: 'Missing q parameter' });
    return;
  }
  const response = await fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}`);
  const data = await response.json();
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).json(data);
};

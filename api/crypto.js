module.exports = async (req, res) => {
  const { id = '' } = req.query;
  if (!id) {
    res.status(400).json({ error: 'Missing id parameter' });
    return;
  }
  const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=usd`);
  const data = await response.json();
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  res.status(200).json(data);
};

module.exports = async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) {
    res.status(400).json({ error: 'Missing symbol parameter' });
    return;
  }
  const response = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`);
  const data = await response.json();
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  res.status(200).json(data);
};

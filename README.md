# Pocket Portfolio

Pocket Portfolio is a lightweight web app for tracking investments across stocks, crypto and FX. Upload trade CSVs from your broker or experiment with mock trades to visualise your portfolio before committing capital.

## Features
- CSV trade import using [PapaParse](https://www.papaparse.com/)
- Manual trade entry with support for mock trades
- Basic metrics: total invested, trade count and open positions
- Google authentication with Firebase and sync to Firestore
- Live price proxies for Yahoo Finance, CoinGecko and open exchange rates via serverless functions
- Progressive Web App with offline caching

## Development
```bash
npm install
npm test          # currently prints placeholder output
```
Static files live in `public/` and serverless API routes in `api/`.

## Deployment
Deploy with Vercel:
```bash
vercel build
vercel deploy --prebuilt --prod --yes
```

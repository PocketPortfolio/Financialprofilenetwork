# Pocket Portfolio

Pocket Portfolio is a lightweight web app for tracking investments across stocks, crypto and FX. Upload trade CSVs from your broker or experiment with mock trades to visualise your portfolio before committing capital.

## Features
- CSV trade import using [PapaParse](https://www.papaparse.com/)
- Manual trade entry with support for mock trades
- Quick import/export of trades as JSON
- Basic metrics: total invested, trade count and open positions
- Google authentication with Firebase and sync to Firestore
- Live price proxies for Yahoo Finance, CoinGecko and open exchange rates via serverless functions
- Progressive Web App with offline caching

## Development
```bash
npm install
npm run dev      # start local dev server
npm test          # currently prints placeholder output
npm run build     # bundle static files to dist/
```
Source files live in `public/` and serverless API routes in `api/`.

### Environment variables
Create a `.env` file based on `.env.example` and provide your Firebase project keys:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

## Deployment
Deploy with Vercel:
```bash
vercel build
vercel deploy --prebuilt --prod --yes
```

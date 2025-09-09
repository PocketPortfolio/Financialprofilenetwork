// /api/config.js
// Returns Firebase web config from environment variables.
// No secrets in repo. Works on Vercel's Node runtime.

export default async function handler(req, res) {
  try {
    const {
      VITE_FIREBASE_API_KEY,
      VITE_FIREBASE_AUTH_DOMAIN,
      VITE_FIREBASE_PROJECT_ID,
    } = process.env;

    // allow only GET
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Basic CORS for your app origin(s). Adjust as needed.
    const origin = req.headers.origin || '';
    const allow =
      origin.endsWith('.vercel.app') ||
      origin === 'https://pocketportfolio.app' ||
      origin === 'http://localhost:5173' ||
      origin === 'http://localhost:3000';

    if (allow) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Cache-Control', 'no-store');

    // If envs are missing, return firebase: null (app will run in local mode gracefully)
    if (!VITE_FIREBASE_API_KEY || !VITE_FIREBASE_AUTH_DOMAIN || !VITE_FIREBASE_PROJECT_ID) {
      return res.status(200).json({ firebase: null });
    }

    return res.status(200).json({
      firebase: {
        apiKey: VITE_FIREBASE_API_KEY,
        authDomain: VITE_FIREBASE_AUTH_DOMAIN,
        projectId: VITE_FIREBASE_PROJECT_ID,
      },
    });
  } catch (err) {
    console.error('config endpoint error:', err);
    return res.status(500).json({ firebase: null });
  }
}

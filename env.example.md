# Environment Variables

Copy values to `.env.local` for local development. In Vercel, set these as environment variables.

## Client-Side (Vite exposed, prefix VITE_)

```bash
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## Server-Side (Vercel Functions Only)

```bash
# Redis (optional, for distributed health state)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=AX...

# Firebase Admin
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Feature Flags
DISABLE_YAHOO_QUOTE=0

# Security
ALLOWED_ORIGINS=https://pocketportfolio.app,http://localhost:5173
```


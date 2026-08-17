import crypto from 'crypto';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';

const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const GA4_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';

type CachedToken = { token: string; expiresAt: number };
let tokenCache: CachedToken | null = null;

function b64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString('base64').replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/** dotenv/JSON often leave `\\n` or `\\\\n`; leftover `\` before a newline breaks OpenSSL. */
export function normalizeGooglePrivateKey(raw: string): string {
  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  key = key.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  key = key.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n');
  // strip stray backslashes left by a single-pass `\\n` replace on `\\\\n`
  key = key.replace(/\\\n/g, '\n');
  return key;
}

export function growthSaConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_GROWTH_SA_CLIENT_EMAIL?.trim() &&
      (process.env.GOOGLE_GROWTH_SA_PRIVATE_KEY?.trim() ||
        process.env.FIREBASE_PRIVATE_KEY?.trim()),
  );
}

function pemSigns(key: string): boolean {
  try {
    const signer = crypto.createSign('RSA-SHA256');
    signer.update('pp-growth-probe');
    signer.sign(key);
    return true;
  } catch {
    return false;
  }
}

function resolveGrowthPrivateKey(): string {
  const growth = normalizeGooglePrivateKey(process.env.GOOGLE_GROWTH_SA_PRIVATE_KEY ?? '');
  const firebase = normalizeGooglePrivateKey(process.env.FIREBASE_PRIVATE_KEY ?? '');
  if (growth && pemSigns(growth)) return growth;
  if (firebase && pemSigns(firebase)) return firebase;
  return growth || firebase;
}

export function growthSaEmail(): string | undefined {
  const raw =
    process.env.GOOGLE_GROWTH_SA_CLIENT_EMAIL?.trim() || process.env.FIREBASE_CLIENT_EMAIL?.trim() || '';
  const email = raw.replace(/^["']|["']$/g, '').trim();
  return email || undefined;
}

export async function getGrowthGoogleAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.token;
  }

  const email = growthSaEmail();
  const privateKey = resolveGrowthPrivateKey();
  if (!email || !privateKey) {
    throw Object.assign(new Error('Google growth service account is not configured'), {
      code: 'MISSING_GROWTH_SA',
    });
  }

  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(
    JSON.stringify({
      iss: email,
      scope: `${GSC_SCOPE} ${GA4_SCOPE}`,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${claim}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  const jwt = `${unsigned}.${b64url(signer.sign(privateKey))}`;

  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt,
  });

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const json = (await res.json()) as { access_token?: string; expires_in?: number; error?: string };
  if (!res.ok || !json.access_token) {
    throw Object.assign(new Error(json.error || `Google token exchange ${res.status}`), {
      code: 'GROWTH_SA_TOKEN',
      status: res.status,
    });
  }

  const ttlMs = Math.max(60, (json.expires_in ?? 3600) - 120) * 1000;
  tokenCache = { token: json.access_token, expiresAt: Date.now() + ttlMs };
  return json.access_token;
}

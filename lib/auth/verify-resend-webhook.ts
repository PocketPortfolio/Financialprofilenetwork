import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Verify Resend (Svix) webhook signatures against the raw body.
 * @see https://resend.com/docs/webhooks/verify-webhooks-requests
 */
export function verifyResendWebhookSignature(opts: {
  payload: string;
  svixId: string | null;
  svixTimestamp: string | null;
  svixSignature: string | null;
  secret: string;
  toleranceSec?: number;
}): boolean {
  const { payload, svixId, svixTimestamp, svixSignature, secret } = opts;
  const toleranceSec = opts.toleranceSec ?? 300;

  if (!svixId || !svixTimestamp || !svixSignature || !secret) {
    return false;
  }

  const ts = Number.parseInt(svixTimestamp, 10);
  if (!Number.isFinite(ts)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > toleranceSec) return false;

  const secretKey = secret.startsWith('whsec_') ? secret.slice(6) : secret;
  let secretBytes: Buffer;
  try {
    secretBytes = Buffer.from(secretKey, 'base64');
  } catch {
    return false;
  }

  const signedContent = `${svixId}.${svixTimestamp}.${payload}`;
  const expected = createHmac('sha256', secretBytes).update(signedContent).digest('base64');

  const candidates = svixSignature
    .split(' ')
    .map((part) => (part.startsWith('v1,') ? part.slice(3) : null))
    .filter((v): v is string => Boolean(v));

  const expectedBuf = Buffer.from(expected);
  for (const candidate of candidates) {
    const got = Buffer.from(candidate);
    if (got.length === expectedBuf.length && timingSafeEqual(got, expectedBuf)) {
      return true;
    }
  }
  return false;
}

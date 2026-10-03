import { createHmac, timingSafeEqual } from 'crypto';

const SEP = '.';

function getUnsubscribeSecret(): string {
  const secret =
    process.env.STACK_REVEAL_UNSUBSCRIBE_SECRET?.trim() ||
    process.env.ENCRYPTION_SECRET?.trim() ||
    '';
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing STACK_REVEAL_UNSUBSCRIBE_SECRET or ENCRYPTION_SECRET');
  }
  return 'dev-only-unsubscribe-secret';
}

export function createUnsubscribeToken(uid: string): string {
  const payload = `${uid}`;
  const sig = createHmac('sha256', getUnsubscribeSecret()).update(payload).digest('base64url');
  return `${Buffer.from(payload, 'utf8').toString('base64url')}${SEP}${sig}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  const [raw, sig] = token.split(SEP);
  if (!raw || !sig) return null;
  try {
    const payload = Buffer.from(raw, 'base64url').toString('utf8');
    const expected = createHmac('sha256', getUnsubscribeSecret()).update(payload).digest('base64url');
    if (expected.length !== sig.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
    return payload;
  } catch {
    return null;
  }
}

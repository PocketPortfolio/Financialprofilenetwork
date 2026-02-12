import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.STACK_REVEAL_UNSUBSCRIBE_SECRET || process.env.ENCRYPTION_SECRET || 'stack-reveal-unsubscribe';
const SEP = '.';

export function createUnsubscribeToken(uid: string): string {
  const payload = `${uid}`;
  const sig = createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${Buffer.from(payload, 'utf8').toString('base64url')}${SEP}${sig}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  const [raw, sig] = token.split(SEP);
  if (!raw || !sig) return null;
  try {
    const payload = Buffer.from(raw, 'base64url').toString('utf8');
    const expected = createHmac('sha256', SECRET).update(payload).digest('base64url');
    if (expected.length !== sig.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
    return payload;
  } catch {
    return null;
  }
}

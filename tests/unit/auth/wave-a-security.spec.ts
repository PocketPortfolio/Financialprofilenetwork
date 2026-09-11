import { createHmac } from 'crypto';
import { afterEach, describe, expect, it } from 'vitest';
import { verifyResendWebhookSignature } from '@/lib/auth/verify-resend-webhook';
import { verifyVercelCron } from '@/lib/cron/verify-vercel-cron';

function signSvix(secret: string, id: string, timestamp: string, payload: string): string {
  const secretKey = secret.startsWith('whsec_') ? secret.slice(6) : secret;
  const secretBytes = Buffer.from(secretKey, 'base64');
  const signedContent = `${id}.${timestamp}.${payload}`;
  const expected = createHmac('sha256', secretBytes).update(signedContent).digest('base64');
  return `v1,${expected}`;
}

describe('verifyResendWebhookSignature', () => {
  const secret = `whsec_${Buffer.from('test-secret-bytes-32!!!!!!!!!!!!').toString('base64')}`;
  const payload = JSON.stringify({ type: 'email.sent', data: { id: 'msg_1' } });

  it('accepts a valid Svix signature', () => {
    const id = 'msg_test_1';
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = signSvix(secret, id, timestamp, payload);
    expect(
      verifyResendWebhookSignature({
        payload,
        svixId: id,
        svixTimestamp: timestamp,
        svixSignature: signature,
        secret,
      })
    ).toBe(true);
  });

  it('rejects forged signatures', () => {
    const id = 'msg_test_2';
    const timestamp = String(Math.floor(Date.now() / 1000));
    expect(
      verifyResendWebhookSignature({
        payload,
        svixId: id,
        svixTimestamp: timestamp,
        svixSignature: 'v1,not-a-real-signature',
        secret,
      })
    ).toBe(false);
  });

  it('rejects missing headers', () => {
    expect(
      verifyResendWebhookSignature({
        payload,
        svixId: null,
        svixTimestamp: String(Math.floor(Date.now() / 1000)),
        svixSignature: 'v1,abc',
        secret,
      })
    ).toBe(false);
  });
});

describe('verifyVercelCron (Wave B target)', () => {
  const original = process.env.CRON_SECRET;

  afterEach(() => {
    if (original === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = original;
  });

  it('accepts Bearer CRON_SECRET', () => {
    process.env.CRON_SECRET = 'test-cron-secret';
    const req = new Request('http://localhost/api/cron/x', {
      headers: { authorization: 'Bearer test-cron-secret' },
    });
    expect(verifyVercelCron(req).ok).toBe(true);
  });

  it('accepts x-vercel-cron equal to secret', () => {
    process.env.CRON_SECRET = 'test-cron-secret';
    const req = new Request('http://localhost/api/cron/x', {
      headers: { 'x-vercel-cron': 'test-cron-secret' },
    });
    expect(verifyVercelCron(req).ok).toBe(true);
  });

  it('rejects bare x-vercel-cron: 1', () => {
    process.env.CRON_SECRET = 'test-cron-secret';
    const req = new Request('http://localhost/api/cron/x', {
      headers: { 'x-vercel-cron': '1' },
    });
    expect(verifyVercelCron(req).ok).toBe(false);
  });
});

/**
 * Phase 1B — Inference boundary proof.
 * Asserts portfolio payload is ephemeral (LLM prompt only) and never persisted to Firestore.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

type FirestoreWrite = { op: 'add' | 'set'; collection: string; data: unknown; docId?: string };

const firestoreWrites: FirestoreWrite[] = [];

function deepSerialize(value: unknown): string {
  return JSON.stringify(value);
}

function assertNoSentinels(writes: FirestoreWrite[], ...sentinels: string[]) {
  const blob = deepSerialize(writes);
  for (const s of sentinels) {
    expect(blob).not.toContain(s);
  }
}

const mockCollection = vi.fn((name: string) => ({
  add: vi.fn(async (data: unknown) => {
    firestoreWrites.push({ op: 'add', collection: name, data });
    return { id: 'mock-doc-id' };
  }),
  doc: vi.fn((docId: string) => ({
    get: vi.fn(async () => ({ exists: false, data: () => null })),
    set: vi.fn(async (data: unknown, _opts?: unknown) => {
      firestoreWrites.push({ op: 'set', collection: name, data, docId });
    }),
  })),
}));

vi.mock('firebase-admin/app', () => ({
  getApps: vi.fn(() => [{ name: 'mock-app' }]),
  initializeApp: vi.fn(),
  cert: vi.fn(() => ({})),
}));

vi.mock('firebase-admin/auth', () => ({
  getAuth: vi.fn(() => ({
    verifyIdToken: vi.fn(async () => ({
      uid: 'diligence-test-uid',
      email: 'diligence@example.com',
    })),
  })),
}));

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({ collection: mockCollection })),
  Timestamp: {
    now: vi.fn(() => ({
      toDate: () => new Date(),
    })),
  },
}));

vi.mock('@/app/lib/tier/effectivePaid', () => ({
  getEffectivePaidTier: vi.fn(() => ({ tier: 'foundersClub', isPaid: true })),
}));

vi.mock('@/app/lib/server/stripe-paid-tier', () => ({
  resolvePaidTierFromStripeEmail: vi.fn(async () => ({ tier: null, isPaid: false })),
}));

vi.mock('@/app/lib/server/firestore-quota-circuit', () => ({
  shouldDegradeFirestoreReads: vi.fn(() => false),
  markFirestoreReadsDegraded: vi.fn(),
}));

describe('/api/ai/chat inference boundary (Phase 1B)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    firestoreWrites.length = 0;
    vi.clearAllMocks();
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-gemini-key';
    delete process.env.OPENAI_API_KEY;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    delete process.env.ADMIN_EMAIL_OVERRIDE;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('does not persist message, context, or attachedContent to Firestore (paid tier)', async () => {
    const SENTINEL_CTX = `DILIGENCE_CTX_${crypto.randomUUID()}`;
    const SENTINEL_MSG = `DILIGENCE_MSG_${crypto.randomUUID()}`;
    const SENTINEL_ATTACH = `DILIGENCE_ATTACH_${crypto.randomUUID()}`;

    let geminiRequestBody = '';

    global.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/api/quote')) {
        return new Response(JSON.stringify([]), { status: 200 });
      }
      if (url.includes('generativelanguage.googleapis.com')) {
        geminiRequestBody = typeof init?.body === 'string' ? init.body : '';
        const sse =
          'data: {"candidates":[{"content":{"parts":[{"text":"Boundary test response."}]}}]}\n\n';
        return new Response(sse, {
          status: 200,
          headers: { 'Content-Type': 'text/event-stream' },
        });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    }) as typeof fetch;

    const { POST } = await import('@/app/api/ai/chat/route');

    const req = new NextRequest('http://localhost:3001/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-id-token',
      },
      body: JSON.stringify({
        message: SENTINEL_MSG,
        context: SENTINEL_CTX,
        attachedContent: SENTINEL_ATTACH,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    assertNoSentinels(firestoreWrites, SENTINEL_CTX, SENTINEL_MSG, SENTINEL_ATTACH);

    const toolUsage = firestoreWrites.filter((w) => w.collection === 'toolUsage');
    expect(toolUsage.length).toBeGreaterThan(0);
    for (const w of toolUsage) {
      const row = w.data as Record<string, unknown>;
      expect(row.toolType).toBe('pocket_analyst');
      const meta = row.metadata as Record<string, unknown>;
      expect(meta.uid).toBe('diligence-test-uid');
      expect(meta.hadAttachment).toBe(true);
      assertNoSentinels([w], SENTINEL_CTX, SENTINEL_MSG, SENTINEL_ATTACH);
    }

    expect(geminiRequestBody).toContain(SENTINEL_CTX);
    expect(geminiRequestBody).toContain(SENTINEL_ATTACH);
    expect(geminiRequestBody).not.toContain('mock-id-token');
    expect(geminiRequestBody).not.toContain('Bearer');
  });

  it('free tier: aiUsage quota writes contain counters only, not portfolio payload', async () => {
    const { getEffectivePaidTier } = await import('@/app/lib/tier/effectivePaid');
    vi.mocked(getEffectivePaidTier).mockReturnValue({ tier: undefined, isPaid: false });

    const SENTINEL_CTX = `DILIGENCE_FREE_CTX_${crypto.randomUUID()}`;
    const SENTINEL_MSG = `DILIGENCE_FREE_MSG_${crypto.randomUUID()}`;

    global.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/api/quote')) {
        return new Response(JSON.stringify([]), { status: 200 });
      }
      if (url.includes('generativelanguage.googleapis.com')) {
        return new Response(
          'data: {"candidates":[{"content":{"parts":[{"text":"ok"}]}}]}\n\n',
          { status: 200, headers: { 'Content-Type': 'text/event-stream' } },
        );
      }
      throw new Error(`Unexpected fetch: ${url}`);
    }) as typeof fetch;

    const { POST } = await import('@/app/api/ai/chat/route');

    const req = new NextRequest('http://localhost:3001/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-id-token',
      },
      body: JSON.stringify({
        message: SENTINEL_MSG,
        context: SENTINEL_CTX,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    assertNoSentinels(firestoreWrites, SENTINEL_CTX, SENTINEL_MSG);

    const aiUsage = firestoreWrites.filter((w) => w.collection === 'aiUsage');
    expect(aiUsage.length).toBe(1);
    const quotaData = aiUsage[0].data as Record<string, unknown>;
    expect(typeof quotaData.usageCount).toBe('number');
    expect(quotaData.periodStart).toBeDefined();
    expect(quotaData.updatedAt).toBeDefined();
    assertNoSentinels(aiUsage, SENTINEL_CTX, SENTINEL_MSG);
  });
});

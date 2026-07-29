/**
 * POST /api/ai/map-csv — LLM mapping with Gemini → OpenAI → heuristic fallback.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const generateObjectMock = vi.fn();

vi.mock('ai', () => ({
  generateObject: (...args: unknown[]) => generateObjectMock(...args),
}));

vi.mock('@ai-sdk/openai', () => ({
  createOpenAI: vi.fn(() => (modelId: string) => ({ modelId })),
}));

describe('/api/ai/map-csv', () => {
  const originalFetch = global.fetch;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    generateObjectMock.mockReset();
    fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    delete process.env.ENABLE_LLM_IMPORT;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.ENABLE_LLM_IMPORT;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    delete process.env.OPENAI_API_KEY;
  });

  async function loadPost() {
    const mod = await import('@/app/api/ai/map-csv/route');
    return mod.POST;
  }

  it('returns 403 when ENABLE_LLM_IMPORT is not true', async () => {
    const POST = await loadPost();
    const res = await POST(
      new Request('http://localhost/api/ai/map-csv', {
        method: 'POST',
        body: JSON.stringify({ headers: ['Date', 'Symbol'] }),
      }),
    );
    expect(res.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(generateObjectMock).not.toHaveBeenCalled();
  });

  it('returns 400 when headers array is missing', async () => {
    process.env.ENABLE_LLM_IMPORT = 'true';
    const POST = await loadPost();
    const res = await POST(
      new Request('http://localhost/api/ai/map-csv', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    );
    expect(res.status).toBe(400);
  });

  it('uses Gemini mapping when valid and does not call OpenAI', async () => {
    process.env.ENABLE_LLM_IMPORT = 'true';
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-gemini';
    process.env.OPENAI_API_KEY = 'test-openai';

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    date: 'Date',
                    ticker: 'Symbol',
                    action: 'Side',
                    quantity: 'Qty',
                    price: 'Px',
                  }),
                },
              ],
            },
          },
        ],
      }),
    });

    const POST = await loadPost();
    const res = await POST(
      new Request('http://localhost/api/ai/map-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headers: ['Date', 'Symbol', 'Side', 'Qty', 'Px'],
          sampleRows: [{ Date: '2024-01-01', Symbol: 'AAPL', Side: 'BUY', Qty: '1', Px: '10' }],
        }),
      }),
    );

    expect(res.status).toBe(200);
    const json = (await res.json()) as { mapping: Record<string, string>; source: string };
    expect(json.source).toBe('llm');
    expect(json.mapping.date).toBe('Date');
    expect(json.mapping.ticker).toBe('Symbol');
    expect(generateObjectMock).not.toHaveBeenCalled();
  });

  it('falls back to OpenAI when Gemini fails', async () => {
    process.env.ENABLE_LLM_IMPORT = 'true';
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-gemini';
    process.env.OPENAI_API_KEY = 'test-openai';

    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'boom',
    });

    generateObjectMock.mockResolvedValue({
      object: {
        date: 'Trade Date',
        ticker: 'Instrument',
        action: 'Type',
        quantity: 'Shares',
        price: 'Price',
      },
    });

    const POST = await loadPost();
    const res = await POST(
      new Request('http://localhost/api/ai/map-csv', {
        method: 'POST',
        body: JSON.stringify({
          headers: ['Trade Date', 'Instrument', 'Type', 'Shares', 'Price'],
        }),
      }),
    );

    expect(res.status).toBe(200);
    const json = (await res.json()) as { mapping: Record<string, string>; source: string };
    expect(json.source).toBe('llm');
    expect(json.mapping.date).toBe('Trade Date');
    expect(generateObjectMock).toHaveBeenCalled();
  });

  it('falls back to heuristic when both LLMs fail', async () => {
    process.env.ENABLE_LLM_IMPORT = 'true';
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-gemini';
    process.env.OPENAI_API_KEY = 'test-openai';

    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'fail',
    });
    generateObjectMock.mockRejectedValue(new Error('openai down'));

    const POST = await loadPost();
    const res = await POST(
      new Request('http://localhost/api/ai/map-csv', {
        method: 'POST',
        body: JSON.stringify({
          headers: ['Date', 'Ticker', 'Action', 'Quantity', 'Price'],
        }),
      }),
    );

    expect(res.status).toBe(200);
    const json = (await res.json()) as { mapping: Record<string, string>; source: string };
    expect(json.source).toBe('heuristic');
    expect(json.mapping.date).toBe('Date');
    expect(json.mapping.ticker).toBe('Ticker');
  });

  it('strips LLM mapping values that are not exact headers', async () => {
    process.env.ENABLE_LLM_IMPORT = 'true';
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-gemini';

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    date: 'Date',
                    ticker: 'NOT_A_REAL_HEADER',
                    action: 'Action',
                    quantity: 'Quantity',
                    price: 'Price',
                  }),
                },
              ],
            },
          },
        ],
      }),
    });

    const POST = await loadPost();
    const res = await POST(
      new Request('http://localhost/api/ai/map-csv', {
        method: 'POST',
        body: JSON.stringify({
          headers: ['Date', 'Ticker', 'Action', 'Quantity', 'Price'],
        }),
      }),
    );

    expect(res.status).toBe(200);
    const json = (await res.json()) as { mapping: Record<string, string>; source: string };
    expect(json.mapping.date).toBe('Date');
    expect(json.mapping.ticker).toBeUndefined();
    expect(json.mapping.action).toBe('Action');
  });

  it('validateMappingAgainstHeaders drops invents and duplicates', async () => {
    process.env.ENABLE_LLM_IMPORT = 'true';
    const { validateMappingAgainstHeaders } = await import('@/app/api/ai/map-csv/route');
    const headers = ['Date', 'Symbol'];
    const out = validateMappingAgainstHeaders(
      { date: 'Date', ticker: 'Symbol', action: 'BUY', quantity: 'Date' },
      headers,
    );
    expect(out.date).toBe('Date');
    expect(out.ticker).toBe('Symbol');
    expect(out.action).toBeUndefined();
    expect(out.quantity).toBeUndefined(); // duplicate of Date already used
  });
});

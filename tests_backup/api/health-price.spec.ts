import { describe, it, expect } from 'vitest';

// We’ll call the endpoint as a pure function via the default export:
import healthHandler from '../..//api/health-price.js';

function mockRequest(method = 'GET', origin = 'http://localhost:5173') {
  return new Request('http://test/api/health-price', { method, headers: { origin } });
}

describe('health-price API', () => {
  it('returns providers array and rate-limit headers', async () => {
    const res = await healthHandler(mockRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.providers)).toBe(true);
    // headers
    expect(res.headers.get('Content-Type')).toContain('application/json');
    expect(res.headers.get('X-RateLimit-Limit')).toBeTruthy();
  });
});

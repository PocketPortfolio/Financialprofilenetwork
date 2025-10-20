import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../../../app/api/waitlist/route';

// Mock Firebase
vi.mock('../../../app/lib/firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'mock-collection'),
  query: vi.fn(() => 'mock-query'),
  where: vi.fn(() => 'mock-where'),
  limit: vi.fn(() => 'mock-limit'),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp')
}));

vi.mock('../../../app/lib/waitlist/normalize', () => ({
  validateWaitlistInput: vi.fn((input) => ({
    email_normalized: input.email.toLowerCase(),
    email_hash: 'mock-hash',
    name: input.name,
    region: input.region,
    role: input.role,
    source: input.source,
    user_agent: input.userAgent
  })),
  hashIP: vi.fn(() => 'mock-ip-hash')
}));

vi.mock('../../../app/lib/waitlist/rateLimit', () => ({
  checkRateLimit: vi.fn(),
  recordRateLimitAttempt: vi.fn()
}));

describe('waitlist API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ENCRYPTION_SECRET = 'test-secret';
    process.env.WAITLIST_DOUBLE_OPT_IN = 'false';
  });

  const createRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/waitlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
  };

  describe('POST /api/waitlist', () => {
    it('should successfully create waitlist entry', async () => {
      const { getDocs, addDoc } = await import('firebase/firestore');
      const { checkRateLimit, recordRateLimitAttempt } = await import('../../../app/lib/waitlist/rateLimit');
      
      // Mock no existing entries
      vi.mocked(getDocs).mockResolvedValue({ empty: true, docs: [] } as any);
      
      // Mock rate limit check passing
      vi.mocked(checkRateLimit).mockResolvedValue({
        allowed: true,
        remainingAttempts: 5,
        resetTime: new Date()
      });
      
      vi.mocked(addDoc).mockResolvedValue({} as any);
      vi.mocked(recordRateLimitAttempt).mockResolvedValue(undefined);

      const request = createRequest({
        email: 'test@example.com',
        name: 'Test User',
        source: 'web:join'
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.message).toContain('Thanks for joining');
      expect(addDoc).toHaveBeenCalledWith(
        'mock-collection',
        expect.objectContaining({
          email_normalized: 'test@example.com',
          email_hash: 'mock-hash',
          status: 'subscribed'
        })
      );
    });

    it('should return 409 for duplicate email', async () => {
      const { getDocs } = await import('firebase/firestore');
      
      // Mock existing entry found
      const mockDoc = { data: () => ({ email_hash: 'mock-hash' }) };
      vi.mocked(getDocs).mockResolvedValue({ empty: false, docs: [mockDoc] } as any);

      const request = createRequest({
        email: 'test@example.com',
        source: 'web:join'
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(409);
      expect(result.success).toBe(false);
      expect(result.duplicate).toBe(true);
      expect(result.message).toContain('already on our waitlist');
    });

    it('should return 429 for rate limited requests', async () => {
      const { getDocs } = await import('firebase/firestore');
      const { checkRateLimit } = await import('../../../app/lib/waitlist/rateLimit');
      
      // Mock no existing entries
      vi.mocked(getDocs).mockResolvedValue({ empty: true, docs: [] } as any);
      
      // Mock rate limit exceeded
      vi.mocked(checkRateLimit).mockResolvedValue({
        allowed: false,
        remainingAttempts: 0,
        resetTime: new Date(Date.now() + 3600000) // 1 hour from now
      });

      const request = createRequest({
        email: 'test@example.com',
        source: 'web:join'
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(429);
      expect(result.success).toBe(false);
      expect(result.rateLimited).toBe(true);
      expect(result.message).toContain('Too many requests');
    });

    it('should return 400 for invalid email', async () => {
      const request = createRequest({
        email: 'invalid-email',
        source: 'web:join'
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid input');
    });

    it('should return 400 for missing required fields', async () => {
      const request = createRequest({
        email: 'test@example.com'
        // Missing source
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
    });

    it('should return 500 when encryption secret is missing', async () => {
      delete process.env.ENCRYPTION_SECRET;

      const request = createRequest({
        email: 'test@example.com',
        source: 'web:join'
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Server configuration error');
    });

    it('should handle double opt-in configuration', async () => {
      process.env.WAITLIST_DOUBLE_OPT_IN = 'true';
      
      const { getDocs, addDoc } = await import('firebase/firestore');
      const { checkRateLimit, recordRateLimitAttempt } = await import('../../../app/lib/waitlist/rateLimit');
      
      vi.mocked(getDocs).mockResolvedValue({ empty: true, docs: [] } as any);
      vi.mocked(checkRateLimit).mockResolvedValue({
        allowed: true,
        remainingAttempts: 5,
        resetTime: new Date()
      });
      vi.mocked(addDoc).mockResolvedValue({} as any);
      vi.mocked(recordRateLimitAttempt).mockResolvedValue(undefined);

      const request = createRequest({
        email: 'test@example.com',
        source: 'web:join'
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.message).toContain('check your email to confirm');
      
      // Should create with 'unconfirmed' status
      expect(addDoc).toHaveBeenCalledWith(
        'mock-collection',
        expect.objectContaining({
          status: 'unconfirmed'
        })
      );
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json'
      });

      const response = await POST(request);
      
      expect(response.status).toBe(500);
    });
  });
});

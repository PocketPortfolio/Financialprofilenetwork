import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRateLimit, recordRateLimitAttempt } from '../../../app/lib/waitlist/rateLimit';

// Mock Firebase
vi.mock('../../../app/lib/firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'mock-collection'),
  query: vi.fn(() => 'mock-query'),
  where: vi.fn(() => 'mock-where'),
  orderBy: vi.fn(() => 'mock-orderBy'),
  limit: vi.fn(() => 'mock-limit'),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
  Timestamp: {
    fromDate: vi.fn((date) => ({ toDate: () => date, seconds: Math.floor(date.getTime() / 1000) }))
  }
}));

describe('waitlist rateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkRateLimit', () => {
    it('should allow requests when no rate limit exceeded', async () => {
      const { getDocs } = await import('firebase/firestore');
      
      // Mock empty results (no existing rate limits)
      vi.mocked(getDocs).mockResolvedValue({
        empty: true,
        docs: []
      } as any);

      const result = await checkRateLimit('test-hash');
      
      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(5);
    });

    it('should block requests when rate limit exceeded', async () => {
      const { getDocs } = await import('firebase/firestore');
      
      // Mock rate limit exceeded (5 attempts in current window)
      const mockDoc = {
        data: () => ({ count: 5, window_start: { toDate: () => new Date(Date.now() - 1000) } })
      };
      
      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: [mockDoc]
      } as any);

      const result = await checkRateLimit('test-hash');
      
      expect(result.allowed).toBe(false);
      expect(result.remainingAttempts).toBe(0);
    });

    it('should fail open on errors', async () => {
      const { getDocs } = await import('firebase/firestore');
      
      vi.mocked(getDocs).mockRejectedValue(new Error('Firebase error'));

      const result = await checkRateLimit('test-hash');
      
      // Should fail open and allow the request
      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(5);
    });

    it('should handle both email and IP rate limits', async () => {
      const { getDocs } = await import('firebase/firestore');
      
      // Mock some existing rate limits
      const mockDoc1 = {
        data: () => ({ count: 2, window_start: { toDate: () => new Date(Date.now() - 1000) } })
      };
      const mockDoc2 = {
        data: () => ({ count: 1, window_start: { toDate: () => new Date(Date.now() - 1000) } })
      };
      
      vi.mocked(getDocs)
        .mockResolvedValueOnce({ empty: false, docs: [mockDoc1] } as any) // Email hash
        .mockResolvedValueOnce({ empty: false, docs: [mockDoc2] } as any); // IP hash

      const result = await checkRateLimit('email-hash', 'ip-hash');
      
      // Total count should be 3 (2 + 1), which is less than 5
      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(2);
    });
  });

  describe('recordRateLimitAttempt', () => {
    it('should create new rate limit doc when none exists', async () => {
      const { getDocs, addDoc } = await import('firebase/firestore');
      
      vi.mocked(getDocs).mockResolvedValue({ empty: true, docs: [] } as any);
      vi.mocked(addDoc).mockResolvedValue({} as any);

      await recordRateLimitAttempt('test-hash');
      
      expect(addDoc).toHaveBeenCalledWith(
        'mock-collection',
        expect.objectContaining({
          identifier: 'test-hash',
          count: 1,
          created_at: 'mock-timestamp',
          updated_at: 'mock-timestamp'
        })
      );
    });

    it('should update existing rate limit doc', async () => {
      const { getDocs, updateDoc } = await import('firebase/firestore');
      
      const mockDoc = {
        ref: 'mock-doc-ref',
        data: () => ({ count: 2 })
      };
      
      vi.mocked(getDocs).mockResolvedValue({ empty: false, docs: [mockDoc] } as any);
      vi.mocked(updateDoc).mockResolvedValue({} as any);

      await recordRateLimitAttempt('test-hash');
      
      expect(updateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        {
          count: 3,
          updated_at: 'mock-timestamp'
        }
      );
    });

    it('should not throw on errors', async () => {
      const { getDocs } = await import('firebase/firestore');
      
      vi.mocked(getDocs).mockRejectedValue(new Error('Firebase error'));

      // Should not throw
      await expect(recordRateLimitAttempt('test-hash')).resolves.toBeUndefined();
    });

    it('should handle IP hash when provided', async () => {
      const { getDocs, addDoc } = await import('firebase/firestore');
      
      vi.mocked(getDocs)
        .mockResolvedValueOnce({ empty: true, docs: [] } as any) // Email hash
        .mockResolvedValueOnce({ empty: true, docs: [] } as any); // IP hash

      vi.mocked(addDoc).mockResolvedValue({} as any);

      await recordRateLimitAttempt('email-hash', 'ip-hash');
      
      // Should be called twice - once for email hash, once for IP hash
      expect(addDoc).toHaveBeenCalledTimes(2);
    });
  });
});

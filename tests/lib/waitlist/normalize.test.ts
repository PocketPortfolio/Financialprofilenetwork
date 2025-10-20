import { describe, it, expect } from 'vitest';
import { normalizeEmail, hashEmail, hashIP, validateWaitlistInput } from '../../../app/lib/waitlist/normalize';

describe('waitlist normalize', () => {
  describe('normalizeEmail', () => {
    it('should normalize email to lowercase and trim', () => {
      expect(normalizeEmail('  TEST@EXAMPLE.COM  ')).toBe('test@example.com');
    });

    it('should validate email format', () => {
      expect(() => normalizeEmail('invalid-email')).toThrow('Invalid email format');
      expect(() => normalizeEmail('test@')).toThrow('Invalid email format');
      expect(() => normalizeEmail('@example.com')).toThrow('Invalid email format');
    });

    it('should validate email length', () => {
      expect(() => normalizeEmail('ab@c.d')).toThrow('Email must be between 3 and 254 characters');
      expect(() => normalizeEmail('a@b.c')).not.toThrow();
    });

    it('should handle empty or invalid input', () => {
      expect(() => normalizeEmail('')).toThrow('Email is required and must be a string');
      expect(() => normalizeEmail(null as any)).toThrow('Email is required and must be a string');
    });
  });

  describe('hashEmail', () => {
    it('should create consistent hash for same email', () => {
      const email = 'test@example.com';
      const hash1 = hashEmail(email);
      const hash2 = hashEmail(email);
      expect(hash1).toBe(hash2);
    });

    it('should create different hashes for different emails', () => {
      const hash1 = hashEmail('test1@example.com');
      const hash2 = hashEmail('test2@example.com');
      expect(hash1).not.toBe(hash2);
    });

    it('should create SHA-256 hash', () => {
      const hash = hashEmail('test@example.com');
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('hashIP', () => {
    const secret = 'test-secret-key';

    it('should create consistent hash for same IP and secret', () => {
      const ip = '192.168.1.1';
      const hash1 = hashIP(ip, secret);
      const hash2 = hashIP(ip, secret);
      expect(hash1).toBe(hash2);
    });

    it('should create different hashes for different IPs', () => {
      const hash1 = hashIP('192.168.1.1', secret);
      const hash2 = hashIP('192.168.1.2', secret);
      expect(hash1).not.toBe(hash2);
    });

    it('should truncate to 16 characters', () => {
      const hash = hashIP('192.168.1.1', secret);
      expect(hash).toHaveLength(16);
    });

    it('should handle invalid input', () => {
      expect(() => hashIP('', secret)).toThrow('IP address is required for hashing');
      expect(() => hashIP('192.168.1.1', '')).toThrow('Encryption secret is required for IP hashing');
    });
  });

  describe('validateWaitlistInput', () => {
    it('should validate and normalize valid input', () => {
      const input = {
        email: '  TEST@EXAMPLE.COM  ',
        name: '  John Doe  ',
        region: '  United States  ',
        role: '  investor  ',
        source: 'web:join',
        userAgent: 'Mozilla/5.0...'
      };

      const result = validateWaitlistInput(input);
      
      expect(result.email_normalized).toBe('test@example.com');
      expect(result.email_hash).toMatch(/^[a-f0-9]{64}$/);
      expect(result.name).toBe('John Doe');
      expect(result.region).toBe('United States');
      expect(result.role).toBe('investor');
      expect(result.source).toBe('web:join');
      expect(result.user_agent).toBe('Mozilla/5.0...');
    });

    it('should handle missing optional fields', () => {
      const input = {
        email: 'test@example.com',
        source: 'web:footer'
      };

      const result = validateWaitlistInput(input);
      
      expect(result.email_normalized).toBe('test@example.com');
      expect(result.name).toBeUndefined();
      expect(result.region).toBeUndefined();
      expect(result.role).toBeUndefined();
    });

    it('should truncate long fields', () => {
      const input = {
        email: 'test@example.com',
        source: 'web:join',
        name: 'A'.repeat(150),
        region: 'B'.repeat(100),
        role: 'C'.repeat(100),
        userAgent: 'D'.repeat(1000)
      };

      const result = validateWaitlistInput(input);
      
      expect(result.name).toHaveLength(100);
      expect(result.region).toHaveLength(50);
      expect(result.role).toHaveLength(50);
      expect(result.user_agent).toHaveLength(500);
    });

    it('should require email and source', () => {
      expect(() => validateWaitlistInput({})).toThrow('Email is required');
      expect(() => validateWaitlistInput({ email: 'test@example.com' })).toThrow('Source is required');
    });

    it('should handle invalid input types', () => {
      expect(() => validateWaitlistInput(null)).toThrow('Input must be an object');
      expect(() => validateWaitlistInput('string')).toThrow('Input must be an object');
    });
  });
});

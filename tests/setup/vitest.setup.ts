import { vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';

// Set up fake timers for deterministic tests
beforeEach(() => {
  vi.useFakeTimers({ now: new Date('2025-01-15T12:00:00Z') });
});

afterEach(() => {
  vi.useRealTimers();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});



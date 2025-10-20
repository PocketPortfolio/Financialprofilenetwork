import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CircuitBreaker, CircuitState } from '../../src/lib/circuitBreaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 1000,
      monitoringPeriod: 5000,
    });
  });

  it('should start in CLOSED state', () => {
    expect(breaker.getState()).toBe(CircuitState.CLOSED);
  });

  it('should open after threshold failures', async () => {
    const failingFn = vi.fn().mockRejectedValue(new Error('fail'));

    // Fail 3 times to open circuit
    await expect(breaker.execute(failingFn)).rejects.toThrow();
    await expect(breaker.execute(failingFn)).rejects.toThrow();
    await expect(breaker.execute(failingFn)).rejects.toThrow();

    expect(breaker.getState()).toBe(CircuitState.OPEN);
    expect(breaker.getFailureCount()).toBe(3);
  });

  it('should reject immediately when OPEN', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));

    // Open the circuit
    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(fn)).rejects.toThrow();
    }

    expect(breaker.getState()).toBe(CircuitState.OPEN);

    // Should reject immediately without calling fn
    await expect(breaker.execute(fn)).rejects.toThrow('Circuit breaker is OPEN');
    expect(fn).toHaveBeenCalledTimes(3); // Not called the 4th time
  });

  it('should transition to HALF_OPEN after timeout', async () => {
    vi.useFakeTimers();
    const fn = vi.fn().mockRejectedValue(new Error('fail'));

    // Open circuit
    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(fn)).rejects.toThrow();
    }

    expect(breaker.getState()).toBe(CircuitState.OPEN);

    // Advance time past timeout
    vi.advanceTimersByTime(1001);

    // Next call should try HALF_OPEN
    const successFn = vi.fn().mockResolvedValue('success');
    await breaker.execute(successFn);

    expect(breaker.getState()).toBe(CircuitState.HALF_OPEN);

    vi.useRealTimers();
  });

  it('should close after successful calls in HALF_OPEN', async () => {
    vi.useFakeTimers();
    const failFn = vi.fn().mockRejectedValue(new Error('fail'));
    const successFn = vi.fn().mockResolvedValue('ok');

    // Open circuit
    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(failFn)).rejects.toThrow();
    }

    // Advance to HALF_OPEN
    vi.advanceTimersByTime(1001);

    // Succeed twice to close
    await breaker.execute(successFn);
    await breaker.execute(successFn);

    expect(breaker.getState()).toBe(CircuitState.CLOSED);
    expect(breaker.getFailureCount()).toBe(0);

    vi.useRealTimers();
  });

  it('should reset state', () => {
    breaker.reset();
    expect(breaker.getState()).toBe(CircuitState.CLOSED);
    expect(breaker.getFailureCount()).toBe(0);
  });
});


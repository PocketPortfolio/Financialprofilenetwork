/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by opening circuit after threshold failures
 */

export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Failing, reject immediately
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

export interface CircuitBreakerConfig {
  failureThreshold: number; // Failures before opening
  successThreshold: number; // Successes to close from half-open
  timeout: number; // Time to wait before half-open (ms)
  monitoringPeriod: number; // Rolling window for failures (ms)
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number[] = []; // Timestamps of failures
  private successes = 0;
  private nextAttempt = 0;
  private config: CircuitBreakerConfig;
  
  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: config.failureThreshold ?? 5,
      successThreshold: config.successThreshold ?? 2,
      timeout: config.timeout ?? 60000, // 1 min
      monitoringPeriod: config.monitoringPeriod ?? 120000, // 2 min
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      // Try half-open
      this.state = CircuitState.HALF_OPEN;
      this.successes = 0;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess(): void {
    this.failures = [];

    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successes = 0;
      }
    }
  }

  private onFailure(): void {
    const now = Date.now();
    this.failures.push(now);

    // Remove old failures outside monitoring period
    this.failures = this.failures.filter(
      ts => now - ts < this.config.monitoringPeriod
    );

    if (this.failures.length >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = now + this.config.timeout;
    }

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = now + this.config.timeout;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getFailureCount(): number {
    const now = Date.now();
    return this.failures.filter(ts => now - ts < this.config.monitoringPeriod).length;
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = [];
    this.successes = 0;
    this.nextAttempt = 0;
  }
}


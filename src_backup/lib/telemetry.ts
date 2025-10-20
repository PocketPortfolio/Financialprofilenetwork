/**
 * Privacy-first telemetry system
 * - No PII collected
 * - User consent required
 * - Anonymous aggregation
 * - Opt-out anytime
 */
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/services/firebase';
import { telemetryEventSchema, type TelemetryEvent } from '@/types/schemas';
import { userPrefsStorage } from './secureStorage';

export interface TelemetryConfig {
  enabled: boolean;
  endpoint?: string;
  batchSize?: number;
  flushInterval?: number;
}

class TelemetryService {
  private config: TelemetryConfig;
  private queue: TelemetryEvent[] = [];
  private sessionId: string;
  private flushTimer: number | null = null;

  constructor(config: Partial<TelemetryConfig> = {}) {
    this.config = {
      enabled: userPrefsStorage.get('telemetry_enabled', true) as boolean,
      batchSize: config.batchSize ?? 10,
      flushInterval: config.flushInterval ?? 30000, // 30s
      ...config,
    };

    this.sessionId = this.generateSessionId();
    this.startFlushTimer();
  }

  /**
   * Check if user has consented to telemetry
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Enable telemetry (user consent)
   */
  enable(): void {
    this.config.enabled = true;
    userPrefsStorage.set('telemetry_enabled', true);
  }

  /**
   * Disable telemetry (opt-out)
   */
  disable(): void {
    this.config.enabled = false;
    userPrefsStorage.set('telemetry_enabled', false);
    this.queue = [];
  }

  /**
   * Track an event
   */
  track(
    eventType: TelemetryEvent['eventType'],
    metadata?: Record<string, unknown>
  ): void {
    if (!this.config.enabled) return;

    const userId = auth.currentUser?.uid || 'anonymous';

    const event: TelemetryEvent = {
      userId,
      eventType,
      timestamp: new Date(),
      metadata: this.sanitizeMetadata(metadata),
      sessionId: this.sessionId,
    };

    // Validate
    const validated = telemetryEventSchema.safeParse(event);
    if (!validated.success) {
      console.warn('Invalid telemetry event:', validated.error);
      return;
    }

    this.queue.push(validated.data);

    // Flush if batch size reached
    if (this.queue.length >= (this.config.batchSize ?? 10)) {
      void this.flush();
    }
  }

  /**
   * Remove PII from metadata
   */
  private sanitizeMetadata(
    metadata?: Record<string, unknown>
  ): Record<string, unknown> | undefined {
    if (!metadata) return undefined;

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(metadata)) {
      // Skip sensitive keys
      if (
        key.toLowerCase().includes('password') ||
        key.toLowerCase().includes('secret') ||
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('email')
      ) {
        continue;
      }

      // Truncate long strings
      if (typeof value === 'string' && value.length > 200) {
        sanitized[key] = value.substring(0, 200) + '...';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Flush events to Firestore
   */
  async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];

    try {
      // Send to Firestore
      const promises = batch.map(event =>
        addDoc(collection(db, 'telemetry'), {
          ...event,
          timestamp: Timestamp.fromDate(event.timestamp),
        })
      );

      await Promise.allSettled(promises);
    } catch (err) {
      console.error('Failed to flush telemetry:', err);
      // Don't throw - telemetry failures should not break app
    }
  }

  /**
   * Start periodic flush
   */
  private startFlushTimer(): void {
    if (this.flushTimer) return;

    this.flushTimer = window.setInterval(() => {
      void this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Stop flush timer
   */
  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    void this.flush();
  }

  /**
   * Generate anonymous session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}

// Singleton instance
export const telemetry = new TelemetryService();

// Convenience functions
export function trackEvent(
  eventType: TelemetryEvent['eventType'],
  metadata?: Record<string, unknown>
): void {
  telemetry.track(eventType, metadata);
}

export function trackCsvImport(success: boolean, rowCount?: number, errorCount?: number): void {
  telemetry.track(success ? 'csv_import_success' : 'csv_import_error', {
    rowCount,
    errorCount,
  });
}

export function trackPriceFetch(success: boolean, provider?: string, latency?: number): void {
  telemetry.track(success ? 'price_fetch_success' : 'price_fetch_error', {
    provider,
    latency,
  });
}

export function trackPageView(page: string): void {
  telemetry.track('page_view', { page });
}

// Flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    void telemetry.flush();
  });
}


/**
 * Process-wide Firestore read circuit breaker.
 * All routes that touch Firestore should consult this so one quota incident
 * does not trigger parallel "retry storms" across different handlers.
 */

const DEFAULT_DEGRADE_MS = 15 * 60 * 1000; // 15 minutes

let firestoreDegradedUntil = 0;

export function shouldDegradeFirestoreReads(): boolean {
  return Date.now() < firestoreDegradedUntil;
}

/** Open circuit for Firestore reads (does not affect Stripe/HTTP-only paths). */
export function markFirestoreReadsDegraded(ms: number = DEFAULT_DEGRADE_MS): void {
  firestoreDegradedUntil = Date.now() + ms;
}

/** Close circuit after a successful Firestore read so dashboards recover when quota resets. */
export function clearFirestoreReadsDegraded(): void {
  firestoreDegradedUntil = 0;
}

export function isFirestoreResourceExhausted(error: unknown): boolean {
  const e = error as { code?: number; message?: string };
  return (
    e?.code === 8 ||
    (typeof e?.message === 'string' &&
      (e.message.includes('RESOURCE_EXHAUSTED') || e.message.includes('Quota exceeded')))
  );
}

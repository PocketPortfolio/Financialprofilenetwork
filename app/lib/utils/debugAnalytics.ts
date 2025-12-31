/**
 * Debug Analytics Utility
 * Conditionally sends debug analytics to local server
 * Only enabled when ENABLE_DEBUG_ANALYTICS env var is set
 */

const DEBUG_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEBUG_ANALYTICS === 'true';
const DEBUG_ENDPOINT = 'http://127.0.0.1:43110/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0';

export function debugLog(location: string, message: string, data?: any): void {
  if (!DEBUG_ENABLED || typeof window === 'undefined') {
    return;
  }

  try {
    fetch(DEBUG_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location,
        message,
        data,
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'production',
      }),
    }).catch(() => {
      // Silently fail - debug endpoint may not be available
    });
  } catch (error) {
    // Silently fail
  }
}


/**
 * Fetch wrapper with timeout, retry, and exponential backoff
 */

export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  retryOn?: number[]; // HTTP status codes to retry on
  onRetry?: (attempt: number, error: Error) => void;
}

export class FetchTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FetchTimeoutError';
  }
}

export class FetchRetryError extends Error {
  constructor(message: string, public attempts: number) {
    super(message);
    this.name = 'FetchRetryError';
  }
}

/**
 * Fetch with timeout
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    timeout = 10000,
    retries = 0,
    retryDelay = 1000,
    retryOn = [408, 429, 500, 502, 503, 504],
    onRetry,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Check if we should retry on this status
        if (attempt < retries && retryOn.includes(response.status)) {
          throw new Error(`HTTP ${response.status}`);
        }

        return response;
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (lastError.name === 'AbortError') {
        lastError = new FetchTimeoutError(`Request timeout after ${timeout}ms`);
      }

      if (attempt < retries) {
        // Exponential backoff with jitter
        const delay = retryDelay * Math.pow(2, attempt) + Math.random() * 1000;
        onRetry?.(attempt + 1, lastError);
        await sleep(delay);
        continue;
      }

      throw new FetchRetryError(
        `Failed after ${attempt + 1} attempts: ${lastError.message}`,
        attempt + 1
      );
    }
  }

  throw lastError ?? new Error('Unknown error');
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch JSON with parsing and validation
 */
export async function fetchJSON<T = unknown>(
  url: string,
  options: FetchOptions = {},
  validator?: (data: unknown) => T
): Promise<T> {
  const response = await fetchWithTimeout(url, options);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    throw new Error(`Expected JSON, got ${contentType}`);
  }

  const data = await response.json();

  if (validator) {
    return validator(data);
  }

  return data as T;
}


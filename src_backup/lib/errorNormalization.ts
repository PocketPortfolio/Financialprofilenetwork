/**
 * Error normalization for consistent error handling across the app
 */

export enum ErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMITED = 'RATE_LIMITED',
  
  // API errors
  API_ERROR = 'API_ERROR',
  PROVIDER_UNAVAILABLE = 'PROVIDER_UNAVAILABLE',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  
  // Auth errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  
  // Data errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  
  // Client errors
  INVALID_INPUT = 'INVALID_INPUT',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  
  // Unknown
  UNKNOWN = 'UNKNOWN',
}

export interface NormalizedError {
  code: ErrorCode;
  message: string;
  originalError?: unknown;
  metadata?: Record<string, unknown>;
  timestamp: number;
  retryable: boolean;
}

/**
 * Normalize any error to a consistent format
 */
export function normalizeError(error: unknown, context?: Record<string, unknown>): NormalizedError {
  const timestamp = Date.now();
  
  // Handle Error instances
  if (error instanceof Error) {
    // Timeout errors
    if (error.name === 'FetchTimeoutError' || error.name === 'AbortError') {
      return {
        code: ErrorCode.TIMEOUT,
        message: 'Request timed out',
        originalError: error,
        metadata: context,
        timestamp,
        retryable: true,
      };
    }
    
    // Network errors
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      return {
        code: ErrorCode.NETWORK_ERROR,
        message: 'Network connection failed',
        originalError: error,
        metadata: context,
        timestamp,
        retryable: true,
      };
    }
    
    // Validation errors
    if (error.name === 'ZodError' || error.message.includes('validation')) {
      return {
        code: ErrorCode.VALIDATION_ERROR,
        message: error.message,
        originalError: error,
        metadata: context,
        timestamp,
        retryable: false,
      };
    }
  }
  
  // Handle HTTP responses
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status: number }).status;
    
    if (status === 401) {
      return {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication required',
        originalError: error,
        metadata: { ...context, status },
        timestamp,
        retryable: false,
      };
    }
    
    if (status === 403) {
      return {
        code: ErrorCode.FORBIDDEN,
        message: 'Access forbidden',
        originalError: error,
        metadata: { ...context, status },
        timestamp,
        retryable: false,
      };
    }
    
    if (status === 404) {
      return {
        code: ErrorCode.NOT_FOUND,
        message: 'Resource not found',
        originalError: error,
        metadata: { ...context, status },
        timestamp,
        retryable: false,
      };
    }
    
    if (status === 429) {
      return {
        code: ErrorCode.RATE_LIMITED,
        message: 'Rate limit exceeded',
        originalError: error,
        metadata: { ...context, status },
        timestamp,
        retryable: true,
      };
    }
    
    if (status >= 500) {
      return {
        code: ErrorCode.API_ERROR,
        message: 'Server error',
        originalError: error,
        metadata: { ...context, status },
        timestamp,
        retryable: true,
      };
    }
  }
  
  // Fallback: unknown error
  return {
    code: ErrorCode.UNKNOWN,
    message: error instanceof Error ? error.message : String(error),
    originalError: error,
    metadata: context,
    timestamp,
    retryable: false,
  };
}

/**
 * Check if error is retryable
 */
export function isRetryable(error: NormalizedError): boolean {
  return error.retryable;
}

/**
 * Get user-friendly error message
 */
export function getUserMessage(error: NormalizedError): string {
  const messages: Record<ErrorCode, string> = {
    [ErrorCode.NETWORK_ERROR]: 'Unable to connect. Please check your internet connection.',
    [ErrorCode.TIMEOUT]: 'Request took too long. Please try again.',
    [ErrorCode.RATE_LIMITED]: 'Too many requests. Please wait a moment.',
    [ErrorCode.API_ERROR]: 'Service temporarily unavailable. Please try again later.',
    [ErrorCode.PROVIDER_UNAVAILABLE]: 'Data provider is currently unavailable.',
    [ErrorCode.INVALID_RESPONSE]: 'Received unexpected data. Please try again.',
    [ErrorCode.UNAUTHORIZED]: 'Please sign in to continue.',
    [ErrorCode.FORBIDDEN]: 'You do not have permission to access this resource.',
    [ErrorCode.VALIDATION_ERROR]: 'Invalid data provided.',
    [ErrorCode.NOT_FOUND]: 'Requested resource not found.',
    [ErrorCode.INVALID_INPUT]: 'Please check your input and try again.',
    [ErrorCode.QUOTA_EXCEEDED]: 'Usage limit exceeded.',
    [ErrorCode.UNKNOWN]: 'Something went wrong. Please try again.',
  };
  
  return messages[error.code] || error.message;
}

/**
 * Log error with context (for telemetry)
 */
export function logError(error: NormalizedError, additionalContext?: Record<string, unknown>): void {
  console.error('[Error]', {
    code: error.code,
    message: error.message,
    timestamp: new Date(error.timestamp).toISOString(),
    retryable: error.retryable,
    metadata: error.metadata,
    ...additionalContext,
  });
  
  // In production, send to error tracking service (Sentry, etc.)
  // if (window.errorTracker) {
  //   window.errorTracker.captureException(error.originalError, {
  //     extra: { ...error.metadata, ...additionalContext },
  //   });
  // }
}


/**
 * Retry database operations with exponential backoff
 * Handles connection pool exhaustion gracefully
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a connection pool error
      const isPoolError = error.message?.includes('MaxClientsInSessionMode') || 
                         error.message?.includes('max clients reached');
      
      if (isPoolError && attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`Connection pool exhausted, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Not a retryable error or max retries reached
      throw error;
    }
  }
  
  throw lastError || new Error('Operation failed after retries');
}


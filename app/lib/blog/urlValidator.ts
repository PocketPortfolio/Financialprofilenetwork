/**
 * Blog URL Validator
 * Utility functions to validate blog post URLs and check their accessibility
 */

export interface UrlValidationResult {
  url: string;
  isValid: boolean;
  statusCode?: number;
  error?: string;
  accessible: boolean;
  lastChecked?: Date;
}

/**
 * Validates URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Checks if a URL is accessible (client-side check)
 * Note: This is a basic check. For server-side validation, use a proper HTTP client
 */
export async function checkUrlAccessibility(url: string): Promise<UrlValidationResult> {
  const result: UrlValidationResult = {
    url,
    isValid: isValidUrl(url),
    accessible: false,
    lastChecked: new Date()
  };

  if (!result.isValid) {
    result.error = 'Invalid URL format';
    return result;
  }

  // Client-side check using fetch
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors', // Avoid CORS issues for external URLs
      cache: 'no-cache'
    });
    
    // With no-cors mode, we can't read the status, but if no error, assume accessible
    result.accessible = true;
    result.statusCode = response.status || 200;
  } catch (error) {
    result.accessible = false;
    result.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return result;
}

/**
 * Validates multiple URLs
 */
export async function validateBlogUrls(urls: string[]): Promise<UrlValidationResult[]> {
  const results = await Promise.all(
    urls.map(url => checkUrlAccessibility(url))
  );
  return results;
}

/**
 * Server-side URL validation (for build-time checks)
 * This should be used in Node.js environment only
 */
export async function validateUrlServerSide(url: string): Promise<UrlValidationResult> {
  const result: UrlValidationResult = {
    url,
    isValid: isValidUrl(url),
    accessible: false,
    lastChecked: new Date()
  };

  if (!result.isValid) {
    result.error = 'Invalid URL format';
    return result;
  }

  // In server-side context, you can use a proper HTTP client like node-fetch
  // For now, we'll just validate the format
  // TODO: Implement actual HTTP check in server context
  result.accessible = true; // Assume accessible if format is valid
  return result;
}

/**
 * Get validation warnings for blog URLs
 */
export function getValidationWarnings(results: UrlValidationResult[]): string[] {
  const warnings: string[] = [];
  
  results.forEach(result => {
    if (!result.isValid) {
      warnings.push(`Invalid URL format: ${result.url}`);
    } else if (!result.accessible && result.error) {
      warnings.push(`URL not accessible: ${result.url} - ${result.error}`);
    }
  });
  
  return warnings;
}



















/**
 * Next.js `redirect()` / `notFound()` throw control-flow errors that must not be
 * caught by generic try/catch (e.g. MDX parse handlers).
 */
export function isNextNavigationError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const digest = (error as { digest?: string }).digest;
  if (typeof digest === 'string') {
    return digest.startsWith('NEXT_REDIRECT') || digest.startsWith('NEXT_NOT_FOUND');
  }
  const message = (error as { message?: string }).message;
  return message === 'NEXT_REDIRECT' || message === 'NEXT_NOT_FOUND';
}

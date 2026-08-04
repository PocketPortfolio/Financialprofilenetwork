import { LOCAL_CONTEXT_MAX_CHARS } from './types';

const TRUNCATION_MARKER = '\n\n[Context truncated for local model VRAM limits.]';

/**
 * Hard-cap portfolio context for process-local (Ollama) inference.
 * Cloud path continues to send full buildPortfolioContext() output.
 */
export function truncatePortfolioContextForLocal(
  context: string,
  maxChars: number = LOCAL_CONTEXT_MAX_CHARS
): string {
  if (!context) return '';
  if (context.length <= maxChars) return context;
  const budget = Math.max(0, maxChars - TRUNCATION_MARKER.length);
  return context.slice(0, budget) + TRUNCATION_MARKER;
}

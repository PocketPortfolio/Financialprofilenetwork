/**
 * Operation Stack Reveal: cohort and UTM constants
 */

export const COHORT_DATE = new Date('2025-10-27T00:00:00Z');
export const UTM_SOURCE = 'weekly_stack_reveal';
export const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pocketportfolio.app';

export function appendUtm(path: string): string {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}utm_source=${UTM_SOURCE}&utm_medium=email&utm_campaign=stack_reveal`;
}

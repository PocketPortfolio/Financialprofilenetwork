/**
 * Currency Formatting Utilities
 * Smart currency formatters for charts and displays
 */

/**
 * Format currency value for Y-axis labels
 * Adapts format based on value size:
 * - < $1,000: Shows as dollars ($500)
 * - >= $1,000: Shows as thousands ($1.5k)
 * - >= $1,000,000: Shows as millions ($1.5M)
 */
export function formatCurrencyAxis(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  } else {
    return `$${Math.round(value)}`;
  }
}

/**
 * Format currency for tooltips and detailed displays
 * Always shows full precision with commas
 */
export function formatCurrencyDetailed(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format currency for compact displays
 * Shows abbreviated format when appropriate
 */
export function formatCurrencyCompact(value: number): string {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  } else if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}k`;
  } else {
    return `$${value.toFixed(2)}`;
  }
}












/** Sovereign terminal palette — advisor client reports (print + PDF). No fintech blue. */
export const SOVEREIGN_REPORT = {
  bg: '#09090b',
  surface: '#18181b',
  surfaceElevated: '#0c0c0e',
  text: '#f4f4f5',
  muted: '#a1a1aa',
  amber: '#f59e0b',
  border: '#3f3f46',
  borderSubtle: '#27272a',
} as const;

export const SOVEREIGN_REPORT_RGB = {
  bg: [9, 9, 11] as [number, number, number],
  surface: [24, 24, 27] as [number, number, number],
  amber: [245, 158, 11] as [number, number, number],
  text: [244, 244, 245] as [number, number, number],
  muted: [161, 161, 170] as [number, number, number],
  border: [63, 63, 70] as [number, number, number],
};

export function formatReportCurrency(value: number, currency: string = 'GBP'): string {
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      maximumFractionDigits: value >= 1000 ? 0 : 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString('en-GB')}`;
  }
}

export function formatReportDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

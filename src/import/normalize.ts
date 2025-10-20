import { createHash } from 'crypto';

export function toISO(value: string, locale: string): string {
  // Try strict ISO first
  const maybeISO = new Date(value);
  if (!isNaN(+maybeISO)) return maybeISO.toISOString();

  // Locale-aware: dd/mm/yyyy or mm/dd/yyyy with time optional
  const v = value.trim();
  const m = v.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})(?:[ T](\d{1,2}:\d{2}(:\d{2})?)?)?$/);
  if (m) {
    const [ , a, b, y, t ] = m;
    const ddmmyyLocales = ['en-GB','de-DE','fr-FR','es-ES'];
    const dayFirst = ddmmyyLocales.some(l => locale?.startsWith(l));
    const d = dayFirst ? Number(a) : Number(b);
    const mo = dayFirst ? Number(b) : Number(a);
    const year = Number(y.length === 2 ? '20'+y : y);
    const iso = new Date(`${year}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}T${t ?? '00:00:00'}Z`);
    return iso.toISOString();
  }
  throw new Error(`Unrecognized date: ${value}`);
}

export function toNumber(value: string | number, locale: string): number {
  if (typeof value === 'number') return value;
  const v = (value ?? '').toString().trim();
  if (!v) return NaN;
  // Detect decimal comma vs point
  const hasComma = v.includes(',');
  const hasDot = v.includes('.');
  let n = v;
  if (hasComma && hasDot) {
    // Assume thousands separator is the first occurring symbol
    if (v.indexOf(',') < v.indexOf('.')) n = v.replace(/,/g,'');
    else n = v.replace(/\./g,'').replace(',','.');
  } else if (hasComma && !hasDot) {
    n = v.replace(',','.');
  } else {
    n = v;
  }
  const out = Number(n);
  if (isNaN(out)) throw new Error(`NaN for number: ${value}`);
  return out;
}

export function toTicker(value: string): string {
  if (!value) throw new Error('Missing ticker');
  const trimmed = value.trim();
  // If description like "Apple Inc. AAPL" → last token
  if (/\s/.test(trimmed) && !/^[A-Z0-9.\-]+$/.test(trimmed)) {
    const parts = trimmed.split(/\s+/);
    return parts[parts.length - 1].replace(/[()]/g,'').toUpperCase();
  }
  return trimmed.toUpperCase();
}

export function hashRow(obj: Record<string,unknown>): string {
  const json = JSON.stringify(sortObject(obj));
  return createHash('sha256').update(json).digest('hex');
}

function sortObject(input: any): any {
  if (Array.isArray(input)) return input.map(sortObject);
  if (input && typeof input === 'object') {
    const out: Record<string, any> = {};
    Object.keys(input).sort().forEach(k => out[k] = sortObject(input[k]));
    return out;
  }
  return input;
}

export function inferCurrency(row: Record<string, any>, fallback: string) {
  return row['Currency'] || row['CCY'] || fallback;
}



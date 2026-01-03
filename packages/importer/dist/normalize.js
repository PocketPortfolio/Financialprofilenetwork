"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toISO = toISO;
exports.toNumber = toNumber;
exports.toTicker = toTicker;
exports.hashRow = hashRow;
exports.inferCurrency = inferCurrency;
const crypto_1 = require("crypto");
function toISO(value, locale) {
    if (!value || !value.trim())
        throw new Error(`Empty date value`);
    const v = value.trim();
    // Try strict ISO first (handles ISO timestamps like "2024-01-15T10:30:00Z")
    const maybeISO = new Date(v);
    if (!isNaN(+maybeISO) && maybeISO.getFullYear() > 1900) {
        return maybeISO.toISOString();
    }
    // Locale-aware: dd/mm/yyyy or mm/dd/yyyy with time optional
    // Enhanced pattern to handle "15/01/2024 10:30:00" format
    const m = v.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
    if (m) {
        const [, a, b, y, h, min, sec] = m;
        const ddmmyyLocales = ['en-GB', 'de-DE', 'fr-FR', 'es-ES'];
        const dayFirst = ddmmyyLocales.some(l => locale?.startsWith(l));
        const d = dayFirst ? Number(a) : Number(b);
        const mo = dayFirst ? Number(b) : Number(a);
        const year = Number(y.length === 2 ? '20' + y : y);
        const timeStr = h ? `${String(h).padStart(2, '0')}:${String(min || '00').padStart(2, '0')}:${String(sec || '00').padStart(2, '0')}` : '00:00:00';
        const iso = new Date(`${year}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}T${timeStr}Z`);
        if (isNaN(+iso))
            throw new Error(`Invalid date: ${value}`);
        return iso.toISOString();
    }
    // Try YYYY-MM-DD format
    const ymdMatch = v.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
    if (ymdMatch) {
        const [, year, month, day] = ymdMatch;
        const iso = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00Z`);
        if (!isNaN(+iso))
            return iso.toISOString();
    }
    throw new Error(`Unrecognized date: ${value}`);
}
function toNumber(value, locale) {
    if (typeof value === 'number')
        return value;
    const v = (value ?? '').toString().trim();
    if (!v)
        return NaN;
    // Remove currency prefixes (e.g., "USD 111.97" -> "111.97")
    let cleaned = v.replace(/^[A-Z]{3}\s+/i, '');
    // Detect decimal comma vs point
    const hasComma = cleaned.includes(',');
    const hasDot = cleaned.includes('.');
    let n = cleaned;
    if (hasComma && hasDot) {
        // Assume thousands separator is the first occurring symbol
        if (cleaned.indexOf(',') < cleaned.indexOf('.'))
            n = cleaned.replace(/,/g, '');
        else
            n = cleaned.replace(/\./g, '').replace(',', '.');
    }
    else if (hasComma && !hasDot) {
        n = cleaned.replace(',', '.');
    }
    else {
        n = cleaned;
    }
    const out = Number(n);
    if (isNaN(out))
        throw new Error(`NaN for number: ${value}`);
    return out;
}
function toTicker(value) {
    if (!value)
        throw new Error('Missing ticker');
    const trimmed = value.trim();
    // Handle exchange suffixes like "AAPL:US" -> extract ticker before colon
    if (/^[A-Z0-9]+:[A-Z0-9]+$/i.test(trimmed)) {
        return trimmed.split(':')[0].toUpperCase();
    }
    // Handle trading pairs like "BTC/USDT" or "BTC-USDT" -> extract base currency
    if (/^[A-Z0-9]+\/[A-Z0-9]+$/i.test(trimmed)) {
        return trimmed.split('/')[0].toUpperCase();
    }
    if (/^[A-Z0-9]+\-[A-Z0-9]+$/i.test(trimmed)) {
        return trimmed.split('-')[0].toUpperCase();
    }
    // If description like "Apple Inc. AAPL" → last token
    if (/\s/.test(trimmed) && !/^[A-Z0-9.\-]+$/.test(trimmed)) {
        const parts = trimmed.split(/\s+/);
        return parts[parts.length - 1].replace(/[()]/g, '').toUpperCase();
    }
    return trimmed.toUpperCase();
}
function hashRow(obj) {
    const json = JSON.stringify(sortObject(obj));
    return (0, crypto_1.createHash)('sha256').update(json).digest('hex');
}
function sortObject(input) {
    if (Array.isArray(input))
        return input.map(sortObject);
    if (input && typeof input === 'object') {
        const out = {};
        Object.keys(input).sort().forEach(k => out[k] = sortObject(input[k]));
        return out;
    }
    return input;
}
function inferCurrency(row, fallback) {
    return row['Currency'] || row['CCY'] || fallback;
}

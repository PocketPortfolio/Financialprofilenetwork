/**
 * POST /api/ai/map-csv — CSV column mapping for universal import.
 *
 * Contract: accepts { headers: string[], sampleRows?: Record<string,string>[] }.
 * Returns { mapping: Record<string, string> } (header name → standard field).
 *
 * Implementation note: This route currently performs heuristic mapping only
 * (synonym-based match on headers). The API and request/response contract are
 * designed for optional LLM-based mapping when ENABLE_LLM_IMPORT is true
 * (constructive reduction to practice). Client sends at most headers + a small
 * sample of rows; full CSV never leaves the client. See docs/IP-TECHNICAL-MECHANISMS.md.
 */
import { NextResponse } from 'next/server';

const ENABLE_LLM_IMPORT = process.env.ENABLE_LLM_IMPORT === 'true';

const STANDARD_FIELDS = ['date', 'ticker', 'action', 'quantity', 'price'] as const;
const HEADER_SYNONYMS: Record<string, string[]> = {
  date: ['date', 'trade date', 'time', 'timestamp', 'transaction date', 'settlement date', 'run date', 'deal date', 'execution date', 'purchase date', 'date sold', 'koinly date'],
  ticker: ['symbol', 'ticker', 'instrument', 'product', 'stock', 'asset', 'instrument code', 'security', 'epic', 'details'],
  action: ['action', 'type', 'transaction type', 'operation', 'buy/sell', 'label', 'transaction', 'transaction kind', 'order type'],
  quantity: ['quantity', 'qty', 'shares', 'amount', 'units', 'volume', 'no. of shares', 'number of shares'],
  price: ['price', 'trade price', 'execution price', 'rate', 'open rate', 'price per share', 'cost basis', 'spot price at transaction', 'price at transaction'],
};

function sanitizeForMapping(input: string, maxLen = 120): string {
  const s = (input || '')
    .replace(/^\uFEFF/, '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/[\u200B-\u200F\u2060\uFEFF]/g, '')
    .trim();
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

function heuristicMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const lower = headers.map((h) => h.toLowerCase().trim());
  for (const field of STANDARD_FIELDS) {
    const synonyms = HEADER_SYNONYMS[field];
    for (const syn of synonyms) {
      const idx = lower.findIndex((h) => h === syn || h.includes(syn) || syn.includes(h));
      if (idx >= 0 && !Object.values(mapping).includes(headers[idx])) {
        mapping[field] = headers[idx];
        break;
      }
    }
  }
  return mapping;
}

export async function POST(req: Request) {
  if (!ENABLE_LLM_IMPORT) {
    return NextResponse.json({ error: 'LLM import disabled' }, { status: 403 });
  }
  let body: { headers?: string[]; sampleRows?: Record<string, string>[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const { headers, sampleRows } = body;
  if (!Array.isArray(headers) || headers.length === 0) {
    return NextResponse.json({ error: 'headers array required' }, { status: 400 });
  }
  // Sanitize to reduce prompt-injection surface (even though we do heuristic-only today).
  const safeHeaders = headers.map((h) => sanitizeForMapping(String(h)));

  // Optional: call OpenAI when OPENAI_API_KEY is set for improved mapping
  // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // const completion = await openai.chat.completions.create({ ... });
  const mapping = heuristicMapping(safeHeaders);
  return NextResponse.json({ mapping });
}

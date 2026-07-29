/**
 * POST /api/ai/map-csv — CSV column mapping for universal import.
 *
 * Contract: accepts { headers: string[], sampleRows?: Record<string,string>[] }.
 * Returns { mapping: Record<string, string>, source?: 'llm'|'heuristic' }
 * (header name → standard field values are exact input header strings).
 *
 * When ENABLE_LLM_IMPORT=true: Gemini first, OpenAI generateObject fallback,
 * then synonym heuristic. Client sends at most headers + a small sample of rows;
 * full CSV never leaves the client. No auth (guest Smart Import); cost control
 * is the feature flag + truncated payload. See docs/IP-TECHNICAL-MECHANISMS.md.
 */
import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

const ENABLE_LLM_IMPORT = process.env.ENABLE_LLM_IMPORT === 'true';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = 'gemini-1.5-flash';

const STANDARD_FIELDS = [
  'date',
  'ticker',
  'action',
  'quantity',
  'price',
  'currency',
  'fees',
] as const;

type StandardField = (typeof STANDARD_FIELDS)[number];
type Mapping = Partial<Record<StandardField, string>>;

const HEADER_SYNONYMS: Record<string, string[]> = {
  date: [
    'date',
    'trade date',
    'time',
    'timestamp',
    'transaction date',
    'settlement date',
    'run date',
    'deal date',
    'execution date',
    'purchase date',
    'date sold',
    'koinly date',
  ],
  ticker: [
    'symbol',
    'ticker',
    'instrument',
    'product',
    'stock',
    'asset',
    'instrument code',
    'security',
    'epic',
    'details',
  ],
  action: [
    'action',
    'type',
    'transaction type',
    'operation',
    'buy/sell',
    'label',
    'transaction',
    'transaction kind',
    'order type',
  ],
  quantity: [
    'quantity',
    'qty',
    'shares',
    'amount',
    'units',
    'volume',
    'no. of shares',
    'number of shares',
  ],
  price: [
    'price',
    'trade price',
    'execution price',
    'rate',
    'open rate',
    'price per share',
    'cost basis',
    'spot price at transaction',
    'price at transaction',
  ],
  currency: ['currency', 'ccy', 'curr'],
  fees: ['fees', 'fee', 'commission', 'charges'],
};

const MappingSchema = z.object({
  date: z.string().optional(),
  ticker: z.string().optional(),
  action: z.string().optional(),
  quantity: z.string().optional(),
  price: z.string().optional(),
  currency: z.string().optional(),
  fees: z.string().optional(),
});

function sanitizeForMapping(input: string, maxLen = 120): string {
  const s = (input || '')
    .replace(/^\uFEFF/, '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/[\u200B-\u200F\u2060\uFEFF]/g, '')
    .trim();
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

function sanitizeCell(input: string, maxLen = 512): string {
  return sanitizeForMapping(input, maxLen);
}

function heuristicMapping(headers: string[]): Mapping {
  const mapping: Mapping = {};
  const lower = headers.map((h) => h.toLowerCase().trim());
  for (const field of STANDARD_FIELDS) {
    const synonyms = HEADER_SYNONYMS[field];
    if (!synonyms) continue;
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

/** Keep only standard fields whose values are exact headers; one header per field. */
export function validateMappingAgainstHeaders(
  mapping: Record<string, unknown> | null | undefined,
  headers: string[],
): Mapping {
  if (!mapping || typeof mapping !== 'object') return {};
  const headerSet = new Set(headers);
  const out: Mapping = {};
  const used = new Set<string>();
  for (const field of STANDARD_FIELDS) {
    const v = mapping[field];
    if (typeof v !== 'string' || !v) continue;
    if (!headerSet.has(v)) continue;
    if (used.has(v)) continue;
    out[field] = v;
    used.add(v);
  }
  return out;
}

function buildPrompt(headers: string[], sampleRows: Record<string, string>[]): string {
  return [
    'Map CSV column headers to standard portfolio trade fields.',
    'Standard fields: date, ticker, action, quantity, price, currency, fees.',
    'Return a JSON object only. Keys are standard fields; values MUST be exact header strings from the Headers list.',
    'Omit a field if no header clearly maps to it. Do not invent headers or values.',
    '',
    `Headers: ${JSON.stringify(headers)}`,
    `Sample rows (up to 3): ${JSON.stringify(sampleRows)}`,
  ].join('\n');
}

async function mapWithGemini(
  headers: string[],
  sampleRows: Record<string, string>[],
  apiKey: string,
): Promise<Mapping | null> {
  const url = `${GEMINI_BASE}/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const prompt = buildPrompt(headers, sampleRows);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0,
        responseMimeType: 'application/json',
      },
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error('[map-csv] Gemini error:', res.status, errText.slice(0, 400));
    return null;
  }
  const body = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = body?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== 'string' || !text.trim()) return null;
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const validated = validateMappingAgainstHeaders(parsed, headers);
    return Object.keys(validated).length > 0 ? validated : null;
  } catch {
    return null;
  }
}

async function mapWithOpenAI(
  headers: string[],
  sampleRows: Record<string, string>[],
  apiKey: string,
): Promise<Mapping | null> {
  const openai = createOpenAI({ apiKey });
  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: MappingSchema,
    prompt: buildPrompt(headers, sampleRows),
    temperature: 0,
  });
  const validated = validateMappingAgainstHeaders(object as Record<string, unknown>, headers);
  return Object.keys(validated).length > 0 ? validated : null;
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

  const safeHeaders = headers.map((h) => sanitizeForMapping(String(h)));
  const rawRows = Array.isArray(sampleRows) ? sampleRows.slice(0, 3) : [];
  const safeRows = rawRows.map((row) => {
    const out: Record<string, string> = {};
    if (!row || typeof row !== 'object') return out;
    for (const [k, v] of Object.entries(row)) {
      out[sanitizeForMapping(String(k))] = sanitizeCell(String(v ?? ''));
    }
    return out;
  });

  const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    try {
      const geminiMap = await mapWithGemini(safeHeaders, safeRows, geminiKey);
      if (geminiMap && Object.keys(geminiMap).length > 0) {
        return NextResponse.json({ mapping: geminiMap, source: 'llm' as const });
      }
    } catch (e) {
      console.error('[map-csv] Gemini threw:', e);
    }
  }

  if (openaiKey) {
    try {
      const openaiMap = await mapWithOpenAI(safeHeaders, safeRows, openaiKey);
      if (openaiMap && Object.keys(openaiMap).length > 0) {
        return NextResponse.json({ mapping: openaiMap, source: 'llm' as const });
      }
    } catch (e) {
      console.error('[map-csv] OpenAI threw:', e);
    }
  }

  const mapping = heuristicMapping(safeHeaders);
  return NextResponse.json({ mapping, source: 'heuristic' as const });
}

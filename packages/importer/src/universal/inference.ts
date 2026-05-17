/**
 * Universal pipeline: infer column mapping.
 * Level 1: Heuristics (SYNONYMS). Level 2: LLM (feature-flagged).
 */

import type { UniversalMapping } from './types';
import { inferColumnMapping, type InferResult } from './inferColumnMapping';
import { sanitizeHeaders, sanitizeSampleRows } from './sanitize';
import { detectAdversarialSchema } from './adversarial';
import type { StandardField } from './types';
import { REQUIRED_FIELDS } from './types';

const HEURISTIC_CONFIDENCE_THRESHOLD = 0.9;

function isLLMImportEnabled(): boolean {
  if (typeof process !== 'undefined' && process.env?.ENABLE_LLM_IMPORT === 'true') return true;
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_ENABLE_LLM_IMPORT === 'true') return true;
  return false;
}

export interface InferMappingInput {
  headers: string[];
  sampleRows: Record<string, string>[];
}

export interface InferMappingOutput {
  mapping: UniversalMapping;
  confidence: number;
  source: 'heuristic' | 'llm';
}

/**
 * Infer column mapping: heuristics first, then optional LLM if confidence low.
 */
export async function inferMapping(input: InferMappingInput): Promise<InferMappingOutput> {
  const { headers, sampleRows } = input;
  const sanitizedHeaders = sanitizeHeaders(headers);
  const sanitizedRows = sanitizeSampleRows(sampleRows, { maxRows: 5 });
  const adversarial = detectAdversarialSchema(sanitizedHeaders, sanitizedRows);
  const heuristicClean: InferResult = inferColumnMapping(sanitizedHeaders.headers, sanitizedRows.rows);
  const heuristic: InferResult = {
    mapping: translateMappingToRawHeaders(heuristicClean.mapping, sanitizedHeaders),
    confidence: heuristicClean.confidence,
  };

  if (heuristic.confidence >= HEURISTIC_CONFIDENCE_THRESHOLD) {
    return {
      mapping: heuristic.mapping,
      confidence: heuristic.confidence,
      source: 'heuristic',
    };
  }

  const allowLLM =
    isLLMImportEnabled() && !(adversarial.isAdversarial && adversarial.severity === 'high');

  if (allowLLM) {
    try {
      const llmMapping = await fetchLLMMapping(sanitizedHeaders.headers, sanitizedRows.rows);
      const validated = llmMapping
        ? validateLLMMapping(llmMapping, sanitizedHeaders.headers)
        : null;
      if (validated && Object.keys(validated).length > 0) {
        return {
          mapping: translateMappingToRawHeaders(validated, sanitizedHeaders),
          confidence: 0.85,
          source: 'llm',
        };
      }
    } catch (e) {
      console.warn('[universal] LLM mapping failed, using heuristic', e);
    }
  }

  return {
    mapping: heuristic.mapping,
    confidence: heuristic.confidence,
    source: 'heuristic',
  };
}

async function fetchLLMMapping(
  headers: string[],
  sampleRows: Record<string, string>[]
): Promise<UniversalMapping | null> {
  const res = await fetch('/api/ai/map-csv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      headers,
      sampleRows: sampleRows.slice(0, 3),
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { mapping?: UniversalMapping };
  if (data?.mapping && typeof data.mapping === 'object') {
    return data.mapping;
  }
  return null;
}

function validateLLMMapping(
  mapping: UniversalMapping,
  headers: string[]
): UniversalMapping | null {
  if (!mapping || typeof mapping !== 'object') return null;
  const headerSet = new Set(headers);
  const out: UniversalMapping = {};
  const used = new Set<string>();
  const allowed = new Set<StandardField>([
    'date',
    'ticker',
    'action',
    'quantity',
    'price',
    'currency',
    'fees',
  ]);

  for (const [k, v] of Object.entries(mapping)) {
    const key = k as StandardField;
    if (!allowed.has(key)) continue;
    if (typeof v !== 'string') continue;
    if (!headerSet.has(v)) continue;
    if (used.has(v)) continue;
    out[key] = v;
    used.add(v);
  }

  const requiredMapped = REQUIRED_FIELDS.filter((f) => out[f]).length;
  if (requiredMapped === 0) return null;
  return out;
}

function translateMappingToRawHeaders(
  mapping: UniversalMapping,
  sanitizedHeaders: ReturnType<typeof sanitizeHeaders>
): UniversalMapping {
  // `genericParse()` must receive a mapping whose values are the *actual CSV headers* (raw),
  // not sanitized variants used only for matching.
  const out: UniversalMapping = {};
  const usedRaw = new Set<string>();
  for (const [field, cleanHeader] of Object.entries(mapping)) {
    if (typeof cleanHeader !== 'string' || !cleanHeader) continue;
    const idx = sanitizedHeaders.headers.findIndex((h) => h === cleanHeader);
    if (idx < 0) continue;
    const raw = sanitizedHeaders.meta.rawByIndex[idx];
    if (!raw || usedRaw.has(raw)) continue;
    out[field as StandardField] = raw;
    usedRaw.add(raw);
  }
  return out;
}

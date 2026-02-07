/**
 * Universal pipeline: infer column mapping.
 * Level 1: Heuristics (SYNONYMS). Level 2: LLM (feature-flagged).
 */

import type { UniversalMapping } from './types';
import { inferColumnMapping, type InferResult } from './inferColumnMapping';

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
  const heuristic: InferResult = inferColumnMapping(headers, sampleRows);

  if (heuristic.confidence >= HEURISTIC_CONFIDENCE_THRESHOLD) {
    return {
      mapping: heuristic.mapping,
      confidence: heuristic.confidence,
      source: 'heuristic',
    };
  }

  if (isLLMImportEnabled()) {
    try {
      const llmMapping = await fetchLLMMapping(headers, sampleRows);
      if (llmMapping && Object.keys(llmMapping).length > 0) {
        return {
          mapping: llmMapping,
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

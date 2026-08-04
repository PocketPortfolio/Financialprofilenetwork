import { describe, expect, it, vi } from 'vitest';
import {
  LOCAL_CONTEXT_MAX_CHARS,
  OLLAMA_MODEL_DEEPSEEK_R1,
  OLLAMA_MODEL_LLAMA31,
  isLocalProviderMode,
  modelIdForProviderMode,
} from '@/app/lib/ai/providers/types';
import { truncatePortfolioContextForLocal } from '@/app/lib/ai/providers/truncateContext';

describe('sovereign AI provider helpers', () => {
  it('maps modes to Ollama / hosted model IDs', () => {
    expect(modelIdForProviderMode('cloud_auto')).toBeNull();
    // Hosted PAYG defaults both sovereign modes to DeepSeek-R1 distill unless env overrides
    expect(modelIdForProviderMode('ollama_llama31')).toBe(OLLAMA_MODEL_DEEPSEEK_R1);
    expect(modelIdForProviderMode('ollama_deepseek_r1')).toBe(OLLAMA_MODEL_DEEPSEEK_R1);
  });

  it('extracts DeepSeek-R1 reasoning when content is null', async () => {
    const { extractAssistantText } = await import('@/app/lib/ai/providers/ollama');
    expect(extractAssistantText({ content: null, reasoning: 'Hold cash; skip crypto for now.' })).toBe(
      'Hold cash; skip crypto for now.'
    );
    expect(extractAssistantText({ content: 'Final answer.', reasoning: 'long chain' })).toBe(
      'Final answer.'
    );
  });

  it('waitForOllamaWarm resolves once /models becomes ok', async () => {
    const { waitForOllamaWarm } = await import('@/app/lib/ai/providers/ollama');
    let n = 0;
    const original = global.fetch;
    global.fetch = vi.fn(async () => {
      n += 1;
      if (n < 3) throw new Error('cold');
      return new Response(JSON.stringify({ data: [] }), { status: 200 });
    }) as typeof fetch;
    try {
      const r = await waitForOllamaWarm('http://wake-test/v1', {
        budgetMs: 5_000,
        probeMs: 200,
        intervalMs: 10,
      });
      expect(r.warm).toBe(true);
      expect(r.probes).toBeGreaterThanOrEqual(3);
    } finally {
      global.fetch = original;
    }
  });

  it('flags local modes correctly', () => {
    expect(isLocalProviderMode('cloud_auto')).toBe(false);
    expect(isLocalProviderMode('ollama_llama31')).toBe(true);
    expect(isLocalProviderMode('ollama_deepseek_r1')).toBe(true);
  });

  it('passes through short context unchanged', () => {
    const ctx = 'Portfolio summary\nTotal positions: 3';
    expect(truncatePortfolioContextForLocal(ctx)).toBe(ctx);
  });

  it('hard-caps oversized context for local VRAM', () => {
    const ctx = 'x'.repeat(LOCAL_CONTEXT_MAX_CHARS + 500);
    const out = truncatePortfolioContextForLocal(ctx);
    expect(out.length).toBeLessThanOrEqual(LOCAL_CONTEXT_MAX_CHARS);
    expect(out).toContain('[Context truncated for local model VRAM limits.]');
    expect(out.length).toBeLessThan(ctx.length);
  });

  it('enables local AI UI by default in development when flag unset', async () => {
    const prev = process.env.NEXT_PUBLIC_ENABLE_LOCAL_AI;
    delete process.env.NEXT_PUBLIC_ENABLE_LOCAL_AI;
    const { isLocalAiUiEnabled } = await import('@/app/lib/ai/providers/types');
    // vitest runs with NODE_ENV=test; treat test like development for harness visibility
    // Explicit true/false still win.
    process.env.NEXT_PUBLIC_ENABLE_LOCAL_AI = 'true';
    expect(isLocalAiUiEnabled()).toBe(true);
    process.env.NEXT_PUBLIC_ENABLE_LOCAL_AI = 'false';
    expect(isLocalAiUiEnabled()).toBe(false);
    if (prev === undefined) delete process.env.NEXT_PUBLIC_ENABLE_LOCAL_AI;
    else process.env.NEXT_PUBLIC_ENABLE_LOCAL_AI = prev;
  });

  it('reads server OLLAMA_BASE_URL for hosted sovereign; client-direct off by default', async () => {
    const {
      getServerOllamaBaseUrl,
      isOllamaClientDirectEnabled,
    } = await import('@/app/lib/ai/providers/types');
    const prevBase = process.env.OLLAMA_BASE_URL;
    const prevLlama = process.env.OLLAMA_LLAMA_BASE_URL;
    const prevR1 = process.env.OLLAMA_REASONING_BASE_URL;
    const prevDirect = process.env.NEXT_PUBLIC_OLLAMA_CLIENT_DIRECT;
    delete process.env.OLLAMA_BASE_URL;
    delete process.env.OLLAMA_LLAMA_BASE_URL;
    delete process.env.OLLAMA_REASONING_BASE_URL;
    delete process.env.SOVEREIGN_INFERENCE_BASE_URL;
    delete process.env.NEXT_PUBLIC_OLLAMA_CLIENT_DIRECT;
    expect(getServerOllamaBaseUrl()).toBeNull();
    expect(isOllamaClientDirectEnabled()).toBe(false);
    process.env.OLLAMA_BASE_URL = 'https://node.example/v1/';
    expect(getServerOllamaBaseUrl()).toBe('https://node.example/v1');
    process.env.OLLAMA_LLAMA_BASE_URL = 'https://llama.example/openai/v1';
    process.env.OLLAMA_REASONING_BASE_URL = 'https://r1.example/openai/v1';
    expect(getServerOllamaBaseUrl('ollama_llama31')).toBe('https://llama.example/openai/v1');
    expect(getServerOllamaBaseUrl('ollama_deepseek_r1')).toBe('https://r1.example/openai/v1');
    process.env.NEXT_PUBLIC_OLLAMA_CLIENT_DIRECT = 'true';
    expect(isOllamaClientDirectEnabled()).toBe(true);
    if (prevBase === undefined) delete process.env.OLLAMA_BASE_URL;
    else process.env.OLLAMA_BASE_URL = prevBase;
    if (prevLlama === undefined) delete process.env.OLLAMA_LLAMA_BASE_URL;
    else process.env.OLLAMA_LLAMA_BASE_URL = prevLlama;
    if (prevR1 === undefined) delete process.env.OLLAMA_REASONING_BASE_URL;
    else process.env.OLLAMA_REASONING_BASE_URL = prevR1;
    if (prevDirect === undefined) delete process.env.NEXT_PUBLIC_OLLAMA_CLIENT_DIRECT;
    else process.env.NEXT_PUBLIC_OLLAMA_CLIENT_DIRECT = prevDirect;
  });
});

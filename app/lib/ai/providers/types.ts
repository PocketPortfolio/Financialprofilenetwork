/**
 * Ask AI provider modes — Sovereign AI Adversarial Harness.
 * @see docs/architecture/sovereign-ai-harness-plan-2026-08-04.md
 */

export type AskAiProviderMode =
  | 'cloud_auto'
  | 'ollama_llama31'
  | 'ollama_deepseek_r1';

export const OLLAMA_MODEL_LLAMA31 = 'llama3.1:8b-instruct-q4_K_M';
export const OLLAMA_MODEL_DEEPSEEK_R1 = 'deepseek-r1:7b-qwen-distill-q4_K_M';
export const OLLAMA_MODEL_QWEN_CODER = 'qwen2.5-coder:7b-instruct-q4_K_M';

/** Hard cap for local VRAM safety (~1.5–2k tokens of summary text). */
export const LOCAL_CONTEXT_MAX_CHARS = 6000;

export const PROVIDER_MODE_LABELS: Record<AskAiProviderMode, string> = {
  cloud_auto: 'Cloud Auto (Gemini / OpenAI)',
  ollama_llama31: 'Sovereign Instruct (hosted)',
  ollama_deepseek_r1: 'Sovereign Reasoning (DeepSeek-R1)',
};

/** Short badge label (header chip). */
export const PROVIDER_MODE_BADGE: Record<AskAiProviderMode, string> = {
  cloud_auto: 'Cloud Auto',
  ollama_llama31: 'Sovereign Instruct',
  ollama_deepseek_r1: 'DeepSeek-R1',
};

export function isLocalProviderMode(mode: AskAiProviderMode): boolean {
  return mode === 'ollama_llama31' || mode === 'ollama_deepseek_r1';
}

export function modelIdForProviderMode(mode: AskAiProviderMode): string | null {
  if (mode === 'ollama_llama31') {
    return (
      process.env.OLLAMA_DEFAULT_MODEL?.trim() ||
      process.env.NEXT_PUBLIC_OLLAMA_DEFAULT_MODEL?.trim() ||
      process.env.OLLAMA_REASONING_MODEL?.trim() ||
      OLLAMA_MODEL_DEEPSEEK_R1
    );
  }
  if (mode === 'ollama_deepseek_r1') {
    return (
      process.env.OLLAMA_REASONING_MODEL?.trim() ||
      process.env.NEXT_PUBLIC_OLLAMA_REASONING_MODEL?.trim() ||
      OLLAMA_MODEL_DEEPSEEK_R1
    );
  }
  return null;
}

/** Browser BYO Ollama (optional power-user path). */
export function getOllamaBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_OLLAMA_BASE_URL?.trim() || 'http://localhost:11434/v1';
  return raw.replace(/\/$/, '');
}

/**
 * Server-hosted sovereign inference node (prod path).
 * Prefer per-mode serverless URLs (PAYG scale-to-zero); fall back to OLLAMA_BASE_URL.
 */
export function getServerOllamaBaseUrl(mode?: AskAiProviderMode): string | null {
  const pick = (...vals: Array<string | undefined>) => {
    for (const v of vals) {
      const t = v?.trim();
      if (t) return t.replace(/\/$/, '');
    }
    return null;
  };
  if (mode === 'ollama_llama31') {
    return pick(
      process.env.OLLAMA_LLAMA_BASE_URL,
      process.env.OLLAMA_BASE_URL,
      process.env.SOVEREIGN_INFERENCE_BASE_URL
    );
  }
  if (mode === 'ollama_deepseek_r1') {
    return pick(
      process.env.OLLAMA_REASONING_BASE_URL,
      process.env.OLLAMA_BASE_URL,
      process.env.SOVEREIGN_INFERENCE_BASE_URL
    );
  }
  return pick(process.env.OLLAMA_BASE_URL, process.env.SOVEREIGN_INFERENCE_BASE_URL);
}

/**
 * Sovereign UI is ON when:
 * - NEXT_PUBLIC_ENABLE_LOCAL_AI=true (prod Aug 10 launch), or
 * - unset and (development or test),
 * and OFF only when explicitly false.
 */
export function isLocalAiUiEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_ENABLE_LOCAL_AI?.trim().toLowerCase();
  if (flag === 'false' || flag === '0') return false;
  if (flag === 'true' || flag === '1') return true;
  return (
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
  );
}

/** Optional laptop BYO path; prod default is hosted via /api/ai/chat. */
export function isOllamaClientDirectEnabled(): boolean {
  return process.env.NEXT_PUBLIC_OLLAMA_CLIENT_DIRECT === 'true';
}

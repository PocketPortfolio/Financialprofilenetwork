/**
 * Ollama / OpenAI-compatible client (browser BYO + server hosted sovereign node).
 */

function authHeaders(): Record<string, string> {
  const key =
    process.env.OLLAMA_API_KEY?.trim() ||
    process.env.SOVEREIGN_INFERENCE_API_KEY?.trim() ||
    '';
  const headers: Record<string, string> = {
    // Free tunnel interstitials (Pinggy / localtunnel) — ignored by real nodes.
    'X-Pinggy-No-Screen': '1',
    'bypass-tunnel-reminder': '1',
    'User-Agent': 'pocket-portfolio-sovereign/1.0',
  };
  if (key) headers.Authorization = `Bearer ${key}`;
  return headers;
}

export async function checkOllamaHealth(baseUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/models`, {
      method: 'GET',
      headers: authHeaders(),
      signal:
        typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
          ? // Cold PAYG nodes hang here — fail fast so Ask AI can use Cloud Auto.
            (AbortSignal as unknown as { timeout: (ms: number) => AbortSignal }).timeout(3000)
          : undefined,
    });
    return res.ok;
  } catch {
    return false;
  }
}

export type OllamaStreamParams = {
  baseUrl: string;
  model: string;
  system: string;
  user: string;
  signal?: AbortSignal;
  /** Cap completion length (R1 burns tokens on reasoning). Default 1024. */
  maxTokens?: number;
};

type ChatMessageShape = {
  content?: string | null;
  reasoning?: string | null;
  reasoning_content?: string | null;
};

/** DeepSeek-R1 via vLLM often puts the usable text in reasoning* with content null. */
export function extractAssistantText(message: ChatMessageShape | null | undefined): string {
  if (!message) return '';
  const content = typeof message.content === 'string' ? message.content.trim() : '';
  const reasoning =
    (typeof message.reasoning === 'string' && message.reasoning.trim()) ||
    (typeof message.reasoning_content === 'string' && message.reasoning_content.trim()) ||
    '';
  if (content && reasoning) {
    // Prefer the final answer when both exist; fall back to reasoning if content is tiny.
    return content.length >= 8 ? content : `${reasoning}\n\n${content}`.trim();
  }
  return content || reasoning;
}

function parseSseDelta(payload: string): string {
  try {
    const obj = JSON.parse(payload) as {
      choices?: Array<{
        delta?: ChatMessageShape;
        message?: ChatMessageShape;
      }>;
    };
    const choice = obj.choices?.[0];
    return extractAssistantText(choice?.delta) || extractAssistantText(choice?.message);
  } catch {
    return '';
  }
}

/**
 * Non-stream completion — preferred for RunPod Serverless through Vercel
 * (avoids SSE stall + empty content from R1 reasoning_parser).
 */
export async function completeOllamaChat(params: OllamaStreamParams): Promise<string> {
  const base = params.baseUrl.replace(/\/$/, '');
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    signal: params.signal,
    body: JSON.stringify({
      model: params.model,
      stream: false,
      max_tokens: params.maxTokens ?? 1024,
      messages: [
        { role: 'system', content: params.system },
        { role: 'user', content: params.user },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(
      errText || `Sovereign inference failed (${res.status}). Node: ${base}`
    );
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: ChatMessageShape }>;
  };
  const text = extractAssistantText(json.choices?.[0]?.message);
  if (!text) {
    throw new Error('Sovereign node returned an empty completion (no content/reasoning).');
  }
  return text;
}

/**
 * Stream assistant text deltas from /chat/completions (SSE). BYO / optional path.
 */
export async function streamOllamaChat(
  params: OllamaStreamParams,
  onDelta: (text: string) => void
): Promise<void> {
  const base = params.baseUrl.replace(/\/$/, '');
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    signal: params.signal,
    body: JSON.stringify({
      model: params.model,
      stream: true,
      max_tokens: params.maxTokens ?? 1024,
      messages: [
        { role: 'system', content: params.system },
        { role: 'user', content: params.user },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(
      errText || `Sovereign inference failed (${res.status}). Node: ${base}`
    );
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body from sovereign inference node');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      const delta = parseSseDelta(payload);
      if (delta) onDelta(delta);
    }
  }
}

/**
 * Server-side plain text response for /api/ai/chat.
 * Uses non-stream completion for RunPod reliability, then emits as a single chunk stream
 * so the existing Ask AI client reader still works.
 */
export function createOllamaPlainTextStream(params: OllamaStreamParams): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        const signal =
          params.signal ??
          (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
            ? (AbortSignal as unknown as { timeout: (ms: number) => AbortSignal }).timeout(280_000)
            : undefined);
        const text = await completeOllamaChat({ ...params, signal });
        controller.enqueue(encoder.encode(text));
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });
}

/** Pocket Analyst system preamble for sovereign path (no live quotes / attachments in Phase 1). */
export const LOCAL_ASK_AI_SYSTEM_PREAMBLE = `You are Pocket Analyst, a helpful portfolio assistant.
Use only the portfolio context provided. Do not invent holdings, account IDs, or PII.
If the answer is not in the context, say so briefly.
Be concise and practical (under 150 words). Put the user-facing answer last.`;

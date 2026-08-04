/**
 * Ollama OpenAI-compatible client (browser BYO + server hosted sovereign node).
 */

function authHeaders(): Record<string, string> {
  const key =
    process.env.OLLAMA_API_KEY?.trim() ||
    process.env.SOVEREIGN_INFERENCE_API_KEY?.trim() ||
    '';
  /** @type {Record<string, string>} */
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
          ? (AbortSignal as unknown as { timeout: (ms: number) => AbortSignal }).timeout(2500)
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
};

function parseSseDelta(payload: string): string {
  try {
    const obj = JSON.parse(payload) as {
      choices?: Array<{ delta?: { content?: string }; message?: { content?: string } }>;
    };
    return obj.choices?.[0]?.delta?.content ?? obj.choices?.[0]?.message?.content ?? '';
  } catch {
    return '';
  }
}

/**
 * Stream assistant text deltas from Ollama /chat/completions (SSE).
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
      messages: [
        { role: 'system', content: params.system },
        { role: 'user', content: params.user },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(
      errText ||
        `Sovereign inference failed (${res.status}). Node: ${base}`
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

/** Server-side: ReadableStream of plain text chunks for /api/ai/chat. */
export function createOllamaPlainTextStream(params: OllamaStreamParams): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        await streamOllamaChat(params, (delta) => {
          controller.enqueue(encoder.encode(delta));
        });
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
Be concise and practical.`;

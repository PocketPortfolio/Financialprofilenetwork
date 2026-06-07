export const CLIENT_BRIEFING_USER_MESSAGE = `Generate exactly 3 bullet points for a wealth manager client email update.

Rules:
- Output ONLY a markdown unordered list with exactly 3 lines, each starting with "- "
- No title, intro, outro, code fences, or other text
- Do NOT wrap the list in \`\`\`markdown or any code block
- Bullet 1: performance vs benchmark (use context numbers when available)
- Bullet 2: top driver positions or sectors
- Bullet 3: risk (drawdown, beta, or concentration)

Tone: professional, concise, suitable to paste into a client email.`;

const FENCE_LINE = /^```/;

/** Strip LLM code-fence wrappers (e.g. \`\`\`markdown) before parsing bullets. */
export function stripBriefingMarkdownFences(raw: string): string {
  let text = raw.trim();
  text = text.replace(/^```(?:markdown|md)?\s*\r?\n?/i, '');
  text = text.replace(/\r?\n?```\s*$/i, '');
  return text.trim();
}

function isBriefingNoiseLine(line: string): boolean {
  const t = line.trim();
  if (!t) return true;
  if (FENCE_LINE.test(t)) return true;
  if (/^#{1,6}\s/.test(t)) return true;
  return false;
}

export function parseBriefingBullets(raw: string): string[] {
  const normalized = stripBriefingMarkdownFences(raw);
  const lines = normalized
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => !isBriefingNoiseLine(l));

  const bullets: string[] = [];
  for (const line of lines) {
    const m = line.match(/^[-*•]\s+(.+)$/);
    if (m?.[1]) {
      const text = m[1].trim();
      if (text && !isBriefingNoiseLine(text)) bullets.push(text);
    } else if (line.length > 10 && bullets.length < 3 && !isBriefingNoiseLine(line)) {
      bullets.push(line);
    }
    if (bullets.length >= 3) break;
  }

  if (bullets.length >= 3) return bullets.slice(0, 3);

  const sentences = normalized
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && !isBriefingNoiseLine(s));
  return [...bullets, ...sentences].slice(0, 3);
}

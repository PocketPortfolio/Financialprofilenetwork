export const CLIENT_BRIEFING_USER_MESSAGE = `Generate exactly 3 bullet points for a wealth manager client email update.

Rules:
- Output ONLY a markdown unordered list with exactly 3 lines, each starting with "- "
- No title, intro, outro, or other text
- Bullet 1: performance vs benchmark (use context numbers when available)
- Bullet 2: top driver positions or sectors
- Bullet 3: risk (drawdown, beta, or concentration)

Tone: professional, concise, suitable to paste into a client email.`;

export function parseBriefingBullets(raw: string): string[] {
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const bullets: string[] = [];
  for (const line of lines) {
    const m = line.match(/^[-*•]\s+(.+)$/);
    if (m?.[1]) bullets.push(m[1].trim());
    else if (line.length > 10 && bullets.length < 3) bullets.push(line);
    if (bullets.length >= 3) break;
  }

  if (bullets.length >= 3) return bullets.slice(0, 3);

  const sentences = raw
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
  return [...bullets, ...sentences].slice(0, 3);
}

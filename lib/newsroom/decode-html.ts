/**
 * Decode HTML entities in RSS titles/snippets — feeds often ship &#8217; etc.
 */

const NAMED_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&#038;': '&',
  '&nbsp;': ' ',
};

export function decodeHtmlEntities(text: string): string {
  if (!text) return '';

  let s = text.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '');

  s = s.replace(/&#(\d+);/g, (_, digits: string) => {
    const code = Number.parseInt(digits, 10);
    if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return _;
    try {
      return String.fromCodePoint(code);
    } catch {
      return _;
    }
  });

  s = s.replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => {
    const code = Number.parseInt(hex, 16);
    if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return _;
    try {
      return String.fromCodePoint(code);
    } catch {
      return _;
    }
  });

  for (const [entity, char] of Object.entries(NAMED_ENTITIES)) {
    s = s.split(entity).join(char);
  }

  // RSS often uses typographic punctuation — normalize for terminal-style cards
  return s
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u201c/g, '"')
    .replace(/\u201d/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
}

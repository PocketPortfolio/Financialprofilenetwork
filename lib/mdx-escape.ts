/**
 * Escape angle brackets in prose so MDX does not parse them as JSX.
 * e.g. "latency < 1ms" or "> 100ms" cause "Unexpected character `1` before name".
 * Only escape outside code blocks (between ```).
 * Do not remove this—required for all blog MDX (cron generator + app/blog/[slug]/page.tsx).
 */
export function escapeAngleBracketsInProse(content: string): string {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return parts
    .map((part) => {
      if (part.startsWith('```') && part.endsWith('```')) return part;
      return part
        .replace(/<\s*(\d)/g, "{'<'}$1")
        .replace(/>\s*(\d)/g, "{'>'}$1");
    })
    .join('');
}

/**
 * Returns true if prose (outside code blocks) still contains < or > immediately before a digit.
 * Used by cron generator to reject content that would break MDX before push.
 */
export function hasUnescapedAngleBracketsBeforeDigits(content: string): boolean {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return parts.some((part) => {
    if (part.startsWith('```') && part.endsWith('```')) return false;
    return /<\s*\d|>\s*\d/.test(part);
  });
}

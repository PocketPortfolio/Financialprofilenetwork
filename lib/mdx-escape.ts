/**
 * Escape angle brackets in prose so MDX does not parse them as JSX.
 * e.g. "latency < 1ms" or "> 100ms" cause "Unexpected character `1` before name".
 * Only escape outside code blocks (between ```).
 */
export function escapeAngleBracketsInProse(content: string): string {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return parts
    .map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) return part;
      return part
        .replace(/<\s*(\d)/g, "{'<'}$1")
        .replace(/>\s*(\d)/g, "{'>'}$1");
    })
    .join('');
}

/**
 * Strips common AI artifacts from MDX body text (after file-level gray-matter is removed).
 * Models sometimes wrap the "example" post in ```mdx … ``` with duplicate frontmatter inside;
 * that renders as one giant code block on the blog. Used by cron, generate script, and blog page.
 */
import matter from 'gray-matter';

function classifyFenceLine(line: string): 'open' | 'close' | 'none' {
  const t = line.trim();
  if (!t.startsWith('```')) return 'none';
  const rest = t.slice(3).trim();
  if (rest === '') return 'close';
  // Opening fence: optional language/info (bash, javascript, plaintext, …)
  if (/^[\w.+-]+$/.test(rest)) return 'open';
  return 'none';
}

/**
 * If the body starts with ```mdx or ```markdown, removes that outer fence using a depth counter
 * so nested ```bash / ```javascript blocks stay intact.
 */
export function unwrapLeadingMdxOrMarkdownFence(body: string): string {
  const lines = body.replace(/^\uFEFF/, '').split('\n');
  let i = 0;
  while (i < lines.length && lines[i].trim() === '') i++;
  if (i >= lines.length) return body;

  const first = lines[i].trim().toLowerCase();
  if (first !== '```mdx' && first !== '```markdown') return body;

  let depth = 1;
  for (let j = i + 1; j < lines.length; j++) {
    const kind = classifyFenceLine(lines[j]);
    if (kind === 'none') continue;
    if (kind === 'close') {
      depth--;
      if (depth === 0) {
        const inner = lines.slice(i + 1, j).join('\n');
        const tail = lines.slice(j + 1).join('\n');
        const combined = tail.length > 0 ? `${inner}\n${tail}` : inner;
        return combined.trim();
      }
    } else {
      depth++;
    }
  }
  return body;
}

/**
 * When the model duplicated frontmatter inside the fence, remove the inner --- block.
 */
export function stripLeadingDuplicateFrontmatterBlock(body: string): string {
  const t = body.trimStart();
  if (!t.startsWith('---')) return body;
  try {
    const m = matter(body);
    return m.content.trimStart();
  } catch {
    return body;
  }
}

/** Apply after gray-matter splits file frontmatter from `content`. */
export function sanitizeMdxBodyAfterFrontmatter(body: string): string {
  let b = unwrapLeadingMdxOrMarkdownFence(body);
  b = stripLeadingDuplicateFrontmatterBlock(b);
  return b;
}

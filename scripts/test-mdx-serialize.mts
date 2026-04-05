/**
 * Verify blog MDX compiles the same way as app/blog/[slug]/page.tsx (serialize + remark-gfm + angle-bracket escape).
 * Usage: npx tsx scripts/test-mdx-serialize.mts <slug>
 *        npx tsx scripts/test-mdx-serialize.mts --all-sovereign
 */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';

function escapeAngleBracketsInProse(content: string): string {
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

async function runOne(slug: string): Promise<boolean> {
  const filePath = path.join(process.cwd(), 'content', 'posts', `${slug}.mdx`);
  const file = fs.readFileSync(filePath, 'utf8');
  const { content } = matter(file);
  const safe = escapeAngleBracketsInProse(content);
  try {
    await serialize(safe, { mdxOptions: { remarkPlugins: [remarkGfm] } });
    console.log('OK:', slug);
    return true;
  } catch (e: unknown) {
    const err = e as Error;
    console.error('FAIL:', slug, err.message);
    return false;
  }
}

const arg1 = process.argv[2] || 'sovereign-engineering-serial-04-viral-scale';

if (arg1 === '--all-sovereign') {
  const dir = path.join(process.cwd(), 'content', 'posts');
  const files = fs.readdirSync(dir).filter((f) => f.startsWith('sovereign-engineering') && f.endsWith('.mdx'));
  let bad = 0;
  for (const f of files.sort()) {
    const slug = f.replace(/\.mdx$/, '');
    const ok = await runOne(slug);
    if (!ok) bad++;
  }
  process.exit(bad > 0 ? 1 : 0);
}

const ok = await runOne(arg1);
process.exit(ok ? 0 : 1);

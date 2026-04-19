/**
 * Blog Generator for Vercel Cron
 * Fetches calendars from GitHub, determines due posts, generates content and image.
 * Used by /api/cron/generate-blog when GitHub Actions is suspended.
 * Output must match gold standard: docs/BLOG-POST-GOLD-STANDARD.md (100+ deployed posts).
 */

import OpenAI from 'openai';
import matter from 'gray-matter';
import { escapeAngleBracketsInProse, hasUnescapedAngleBracketsBeforeDigits } from '@/lib/mdx-escape';
import { sanitizeMdxBodyAfterFrontmatter } from '@/lib/mdx-sanitize-body';

async function fetchRelevantVideo(topic: string, keywords: string[]): Promise<{ videoId: string; title: string; channelTitle: string } | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;
  try {
    const q = `${topic} ${keywords.slice(0, 3).join(' ')}`.trim();
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&maxResults=1&key=${key}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const item = data.items?.[0];
    if (!item?.id?.videoId) return null;
    return { videoId: item.id.videoId, title: item.snippet.title, channelTitle: item.snippet.channelTitle };
  } catch {
    return null;
  }
}

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/PocketPortfolio/Financialprofilenetwork/main';
const REPO_OWNER = 'PocketPortfolio';
const REPO_NAME = 'Financialprofilenetwork';

export interface BlogPost {
  id: string;
  date: string;
  scheduledTime?: string;
  title: string;
  slug: string;
  status: 'pending' | 'published' | 'failed';
  pillar: 'philosophy' | 'technical' | 'market' | 'product';
  category?: 'how-to-in-tech' | 'deep-dive' | 'research';
  videoId?: string;
  keywords: string[];
  publishedAt?: string;
}

function parseScheduledTime(scheduledTime: string | undefined): { hour: number; minute: number; valid: boolean } {
  if (!scheduledTime || typeof scheduledTime !== 'string') return { hour: 0, minute: 0, valid: false };
  const trimmed = scheduledTime.trim();
  const parts = trimmed.split(':');
  if (parts.length !== 2) return { hour: 0, minute: 0, valid: false };
  const hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);
  if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return { hour: 0, minute: 0, valid: false };
  }
  return { hour, minute, valid: true };
}

/** Unwrap content if AI wrapped entire response in ```mdx or ``` code block */
function unwrapCodeBlock(content: string): string {
  const trimmed = content.trim();
  const match = trimmed.match(/^```(?:mdx?)?\s*\n([\s\S]*?)\n```\s*$/);
  if (match) return match[1].trim();
  return content;
}

function sanitizeMDXContent(content: string): string {
  let cleaned = unwrapCodeBlock(content);
  cleaned = cleaned.replace(/````+/g, '```');
  const codeBlockMatches = cleaned.match(/```/g);
  if (codeBlockMatches && codeBlockMatches.length % 2 !== 0 && !cleaned.trim().endsWith('```')) {
    cleaned = cleaned.trim() + '\n```';
  }
  cleaned = cleaned.replace(/````+(\w+)?/g, '```$1');
  cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n');
  // Remove Video component - blog template renders video from frontmatter videoId
  cleaned = cleaned.replace(/\n*import Video from ['"].*['"];?\s*\n?/g, '\n');
  cleaned = cleaned.replace(/\n*<Video\s+id=\{[^}]+\}\s*\/>\s*\n?/g, '\n');
  // MDX parses < and > as JSX; "latency < 1ms" causes "Unexpected character `1` before name"
  cleaned = escapeAngleBracketsInProse(cleaned);
  return cleaned;
}

export async function fetchCalendarsFromGitHub(): Promise<BlogPost[]> {
  // raw.githubusercontent.com is CDN-cached; without bust, the next cron run can still see
  // status "pending" after a publish and regenerate the same post (duplicate commits + cost).
  const bust = Date.now();
  const fetchOpts: RequestInit = { cache: 'no-store' };
  const [blogRes, howToRes, researchRes] = await Promise.all([
    fetch(`${GITHUB_RAW_BASE}/content/blog-calendar.json?cb=${bust}`, fetchOpts),
    fetch(`${GITHUB_RAW_BASE}/content/how-to-tech-calendar.json?cb=${bust}`, fetchOpts),
    fetch(`${GITHUB_RAW_BASE}/content/research-calendar.json?cb=${bust}`, fetchOpts),
  ]);

  const blog: BlogPost[] = blogRes.ok ? await blogRes.json() : [];
  const howTo: BlogPost[] = howToRes.ok ? await howToRes.json() : [];
  const research: BlogPost[] = researchRes.ok ? await researchRes.json() : [];

  const merged: BlogPost[] = [
    ...blog.map((p) => ({ ...p, category: (p.category || 'deep-dive') as BlogPost['category'] })),
    ...howTo.map((p) => ({ ...p, category: 'how-to-in-tech' as const })),
    ...research.map((p) => ({ ...p, category: 'research' as const })),
  ];

  const postMap = new Map<string, BlogPost>();
  for (const post of merged) {
    const key = post.category === 'research' && post.id ? post.id : post.slug || post.id || `unknown-${Math.random()}`;
    if (!postMap.has(key)) postMap.set(key, post);
  }
  return Array.from(postMap.values());
}

export function getDuePosts(calendar: BlogPost[], now: Date): BlogPost[] {
  const today = now.toISOString().split('T')[0];
  const currentHour = now.getUTCHours();
  const currentMinute = now.getUTCMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  return calendar.filter((post) => {
    if (post.status !== 'pending') return false;
    const postDate = new Date(post.date + 'T00:00:00Z');
    const todayDate = new Date(today + 'T00:00:00Z');
    if (postDate < todayDate) return true;
    if (postDate > todayDate) return false;
    if (post.scheduledTime) {
      const parsed = parseScheduledTime(post.scheduledTime);
      if (!parsed.valid) return true;
      const scheduledMinutes = parsed.hour * 60 + parsed.minute;
      return currentTimeMinutes >= scheduledMinutes;
    }
    return true;
  });
}

export async function generatePostForCron(post: BlogPost): Promise<{ mdxContent: string; imageBuffer: Buffer }> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const isHowTo = post.category === 'how-to-in-tech';
  const isResearch = post.category === 'research';

  const homepageAnchors = [
    { text: 'Sovereign Financial Tracking', route: '/' },
    { text: 'Google Drive Portfolio Sync', route: '/features/google-drive-sync' },
    { text: 'JSON-based Investment Tracker', route: '/' },
  ];
  const selected = homepageAnchors[Math.floor(Math.random() * homepageAnchors.length)];
  let crossLink = '';
  if (post.keywords.some((k) => k.toLowerCase().includes('privacy'))) crossLink = '/features/privacy';
  else if (post.pillar === 'product') crossLink = '/features';
  else if (post.pillar === 'market') crossLink = '/dashboard';

  let videoResult: { videoId: string; title: string; channelTitle: string } | null = null;
  if (isResearch) {
    const video = await fetchRelevantVideo(post.title, post.keywords);
    if (video) videoResult = { videoId: video.videoId, title: video.title, channelTitle: video.channelTitle };
  }

  const systemPrompt = isResearch
    ? `You are a Lead Technical Researcher. Match our gold-standard research format (100+ deployed posts). Min 1500 words, max 2500. Use plain text for formulas (e.g. \`V_f\`). MUST include link with anchor "${selected.text}" to "${selected.route}" in Verdict. CRITICAL: (1) Output raw MDX only - NO \`\`\`mdx or \`\`\` code block wrapper. NO import statements. NO Video component. (2) Section order exactly: Abstract, Methodology, Key Findings, [Video Reference if video], References, Future Trends, Verdict. (3) References: bullet list only, each line "- [Source Title](https://real-url) - one sentence description." At least 3 entries with real, clickable URLs. No plain-text citations without links. (4) MDX-safe prose: never use raw < or > for comparisons (e.g. write "less than 1 ms" or "under 100 ms", not "< 1 ms"); raw angle brackets before numbers break the renderer.`
    : isHowTo
      ? `You are a CTO. Write a concise technical guide (300-500 words). MDX format with frontmatter. Code-first. CRITICAL: Output raw MDX only—NO \`\`\`mdx or \`\`\` wrapper around the full post. Never use raw < or > for comparisons in prose—use "less than", "under", "greater than" so MDX does not break.`
      : `You are a CTO. Write comprehensive blog post (1200-2000 words). MDX with frontmatter. MUST include "Sovereign Sync" in Key Takeaways. Link "${selected.text}" to "${selected.route}". Never use raw < or > for comparisons in prose—use "less than", "under", "greater than" so MDX does not break.`;

  const videoRefSection = videoResult
    ? `, ## Video Reference (mention ${videoResult.title} by ${videoResult.channelTitle})`
    : '';
  const videoIdFm = videoResult ? `, videoId: "${videoResult.videoId}"` : '';
  const userPrompt = isResearch
    ? `Research report: "${post.title}". Pillar: ${post.pillar}. Keywords: ${post.keywords.join(', ')}. Use EXACT section order (do not deviate from our deployed posts): ## Abstract, ## Methodology, ## Key Findings${videoRefSection}, ## References, ## Future Trends, ## Verdict. References: bullet list with "- [Exact Source Title](https://real-url) - one sentence." At least 3 entries, real docs/whitepapers/official blogs only. For any numeric comparisons use words (e.g. "less than 1 ms", "under 100 ms", "greater than 50")—never raw < or > in prose. Output ONLY raw MDX: --- frontmatter --- then body. Frontmatter: title, date: "${post.date}", description (150-160 chars), tags, author: "Pocket Portfolio Team", image: "/images/blog/${post.slug}.png", pillar, category: "research"${videoIdFm}. No code block wrapper.`
    : isHowTo
      ? `How-to guide: "${post.title}". Keywords: ${post.keywords.join(', ')}. Structure: problem, solution with code, key concepts. Output ONLY: --- frontmatter --- then markdown body. No code fence around the file. MDX frontmatter: title, date: "${post.date}", description, tags, author: "Pocket Portfolio Team", image: "/images/blog/${post.slug}.png", pillar, category: "how-to-in-tech".`
      : `Blog post: "${post.title}". Pillar: ${post.pillar}. Keywords: ${post.keywords.join(', ')}. Structure: Hook, Problem, Deep dive, Solution, Key Takeaways (include Sovereign Sync), Verdict. MDX frontmatter: title, date: "${post.date}", description, tags, author: "Pocket Portfolio Team", image: "/images/blog/${post.slug}.png", pillar.`;

  // gpt-4o: flagship model for gold-standard output (BLOG-POST-GOLD-STANDARD.md); migrated from gpt-4-turbo-preview Mar 2026
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  let content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('No content from OpenAI');

  content = sanitizeMDXContent(content);
  const parsed = matter(content);
  parsed.content = sanitizeMdxBodyAfterFrontmatter(parsed.content);
  const fm = parsed.data;
  fm.title = fm.title || post.title;
  fm.date = fm.date || post.date;
  fm.description = fm.description || `${post.title} - ${post.keywords.slice(0, 3).join(', ')}`.slice(0, 160);
  fm.tags = fm.tags || post.keywords;
  fm.author = fm.author || 'Pocket Portfolio Team';
  fm.image = `/images/blog/${post.slug}.png`;
  fm.pillar = fm.pillar || post.pillar;
  if (isHowTo) fm.category = 'how-to-in-tech';
  if (isResearch) {
    fm.category = 'research';
    if (videoResult) fm.videoId = videoResult.videoId;
  }
  content = matter.stringify(parsed.content, fm);

  // SEO/AEO/GEO: Research posts must have clickable reference links so users can verify sources
  if (isResearch) {
    const referenceLinkMatches = content.match(/\[[^\]]+\]\(https?:\/\/[^)]+\)/g);
    const refLinkCount = referenceLinkMatches?.length ?? 0;
    if (refLinkCount < 3) {
      throw new Error(
        `Research post must have at least 3 reference hyperlinks (found ${refLinkCount}). References must use [Title](URL) format for SEO and source verification.`
      );
    }
  }

  // MDX-safe: refuse to push if prose still has <digit or >digit (would cause "Unexpected character `1` before name")
  if (hasUnescapedAngleBracketsBeforeDigits(content)) {
    throw new Error(
      'Post content contains unescaped < or > before numbers in prose, which breaks MDX. Use "less than" / "greater than" or ensure escapeAngleBracketsInProse is applied.'
    );
  }

  const imagePrompt = isHowTo
    ? `Minimalist terminal, dark mode, green on black, no text. Theme: ${post.title}.`
    : isResearch
      ? `Academic data viz, blue/grey, charts, no text. Theme: ${post.title}.`
      : `Abstract FinTech viz, orange/slate, charts, no text. Theme: ${post.title}.`;

  const imageRes = await openai.images.generate({
    model: 'dall-e-3',
    prompt: imagePrompt,
    size: '1024x1024',
    quality: 'standard',
  });
  const imageUrl = imageRes.data?.[0]?.url;
  if (!imageUrl) throw new Error('No image from DALL-E');

  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Failed to download image: ${imgRes.status}`);
  const imageBuffer = Buffer.from(await imgRes.arrayBuffer());

  return { mdxContent: content, imageBuffer };
}

export function getCalendarFilePath(post: BlogPost): string {
  if (post.category === 'how-to-in-tech') return 'content/how-to-tech-calendar.json';
  if (post.category === 'research') return 'content/research-calendar.json';
  return 'content/blog-calendar.json';
}

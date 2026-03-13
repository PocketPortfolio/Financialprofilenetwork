import { NextResponse } from 'next/server';
import {
  fetchCalendarsFromGitHub,
  getDuePosts,
  generatePostForCron,
  getCalendarFilePath,
  type BlogPost,
} from '@/lib/blog-generator-cron';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 min for OpenAI + DALL-E

const REPO_OWNER = 'PocketPortfolio';
const REPO_NAME = 'Financialprofilenetwork';

async function githubRequest(path: string, options: RequestInit = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN not set');
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text}`);
  }
  return res;
}

async function getFileSha(path: string): Promise<string | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN not set');
  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );
  if (res.status === 404) return null; // file doesn't exist yet (new post)
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.sha ?? null;
}

async function createOrUpdateFile(path: string, content: string, message: string): Promise<void> {
  const sha = await getFileSha(path);
  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(content, 'utf-8').toString('base64'),
  };
  if (sha) body.sha = sha;
  await githubRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

async function createOrUpdateFileBinary(path: string, buffer: Buffer, message: string): Promise<void> {
  const sha = await getFileSha(path);
  const body: Record<string, unknown> = {
    message,
    content: buffer.toString('base64'),
  };
  if (sha) body.sha = sha;
  await githubRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

async function getFileContent(path: string): Promise<string> {
  const res = await githubRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`);
  const data = await res.json();
  if (data.content) {
    return Buffer.from(data.content, 'base64').toString('utf-8');
  }
  throw new Error(`No content for ${path}`);
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const vercelCronHeader = request.headers.get('x-vercel-cron');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }

  const isAuthorized =
    authHeader === `Bearer ${cronSecret}` ||
    vercelCronHeader === cronSecret ||
    vercelCronHeader === '1';

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not set' }, { status: 500 });
    }
    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json({ error: 'GITHUB_TOKEN not set' }, { status: 500 });
    }

    const calendar = await fetchCalendarsFromGitHub();
    const now = new Date();
    const duePosts = getDuePosts(calendar, now);

    if (duePosts.length === 0) {
      return NextResponse.json({
        success: true,
        generated: 0,
        message: 'No posts due for generation',
        timestamp: now.toISOString(),
      });
    }

    const post = duePosts[0];
    const { mdxContent, imageBuffer } = await generatePostForCron(post);

    const mdxPath = `content/posts/${post.slug}.mdx`;
    const imagePath = `public/images/blog/${post.slug}.png`;
    const calendarPath = getCalendarFilePath(post);

    const msg = `🤖 Auto-generate blog post (Vercel Cron) - ${post.title}`;

    await createOrUpdateFile(mdxPath, mdxContent, msg);
    await createOrUpdateFileBinary(imagePath, imageBuffer, msg);

    const calendarJson = await getFileContent(calendarPath);
    const calendarData: BlogPost[] = JSON.parse(calendarJson);
    let idx = calendarData.findIndex(
      (p) => (p.category === 'research' ? p.id === post.id : p.slug === post.slug)
    );
    if (idx < 0 && post.category === 'research') {
      idx = calendarData.findIndex((p) => p.slug === post.slug);
    }
    if (idx < 0) {
      throw new Error(
        `[CRON] Calendar update required but entry not found. Post id=${post.id} slug=${post.slug} category=${post.category}. ` +
          `Calendar ${calendarPath} has ${calendarData.length} entries. Refusing to leave repo inconsistent (content pushed, calendar still pending).`
      );
    }
    calendarData[idx].status = 'published';
    calendarData[idx].publishedAt = new Date().toISOString();
    await createOrUpdateFile(calendarPath, JSON.stringify(calendarData, null, 2), msg);

    // Trigger Vercel production deploy (needed when GitHub → Vercel auto-deploy is broken)
    let deployTriggered = false;
    const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
    if (deployHookUrl) {
      try {
        const hookRes = await fetch(deployHookUrl, { method: 'POST' });
        deployTriggered = hookRes.ok;
      } catch (e) {
        console.warn('[CRON] Deploy hook failed:', e);
      }
    }

    return NextResponse.json({
      success: true,
      generated: 1,
      slug: post.slug,
      title: post.title,
      deployTriggered: deployTriggered || undefined,
      message: deployTriggered
        ? 'Post pushed to GitHub and production deploy triggered.'
        : 'Post pushed to GitHub. Set VERCEL_DEPLOY_HOOK_URL to trigger deploy when GitHub→Vercel is broken.',
      timestamp: now.toISOString(),
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[CRON] generate-blog error:', err);
    return NextResponse.json(
      { success: false, error: err.message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

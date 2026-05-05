import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const REPO_OWNER = 'PocketPortfolio';
const REPO_NAME = 'Financialprofilenetwork';
const WORKFLOW_FILE = 'publish-importer.yml';
const REF = 'main';

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
    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json({ error: 'GITHUB_TOKEN not set' }, { status: 500 });
    }

    // Triggers the GitHub Actions workflow. This keeps publishing in CI (npm is available there),
    // while Vercel cron just orchestrates.
    await githubRequest(
      `/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: REF }),
      }
    );

    return NextResponse.json({
      success: true,
      message: `Dispatched ${WORKFLOW_FILE} on ${REF}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[CRON] publish-importer error:', error);
    return NextResponse.json(
      { success: false, error: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}


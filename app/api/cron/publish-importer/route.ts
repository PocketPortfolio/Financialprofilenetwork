import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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
    const runnerUrl = process.env.NPM_PUBLISH_RUNNER_URL;
    const runnerSecret = process.env.NPM_PUBLISH_RUNNER_SECRET;
    if (!runnerUrl || !runnerSecret) {
      return NextResponse.json(
        { error: 'NPM_PUBLISH_RUNNER_URL / NPM_PUBLISH_RUNNER_SECRET not configured' },
        { status: 500 }
      );
    }

    // Orchestrate publish on an external runner (no GitHub Actions).
    // Runner is expected to authenticate this request and execute publish logic server-side.
    const res = await fetch(runnerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Runner-Secret': runnerSecret,
      },
      body: JSON.stringify({
        package: 'importer',
        version: '1.1.2',
        source: 'vercel-cron',
        timestamp: new Date().toISOString(),
      }),
    });
    const text = await res.text().catch(() => '');
    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Runner ${res.status}: ${text}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Publish request dispatched to runner`,
      runnerStatus: res.status,
      runnerResponse: text ? text.slice(0, 500) : '',
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


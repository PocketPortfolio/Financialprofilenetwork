import { NextResponse } from 'next/server';
import { verifyVercelCron } from '@/lib/cron/verify-vercel-cron';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  const auth = verifyVercelCron(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
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


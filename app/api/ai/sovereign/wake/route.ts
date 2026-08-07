/**
 * POST /api/ai/sovereign/wake — wake-on-ask for OP-Hosted Sovereign PAYG.
 * Idle soft-launch: workersMin=1 keeps one warm worker; still PAYG beyond that.
 * This only spins additional capacity when the user selects Sovereign or is about to send.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import {
  getServerOllamaBaseUrl,
  isLocalProviderMode,
  waitForOllamaWarm,
  SOVEREIGN_WAKE_BUDGET_MS,
  type AskAiProviderMode,
} from '@/app/lib/ai/providers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
/** Soft-launch: wake budget is short; Cloud Auto safety net is the UX contract. */
export const maxDuration = 45;

function initializeFirebaseAdmin() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  initializeFirebaseAdmin();
  try {
    await getAuth().verifyIdToken(authHeader.slice(7));
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let provider: AskAiProviderMode = 'ollama_deepseek_r1';
  let budgetMs = SOVEREIGN_WAKE_BUDGET_MS;
  try {
    const body = (await request.json()) as { provider?: string; budgetMs?: number };
    if (body.provider && isLocalProviderMode(body.provider as AskAiProviderMode)) {
      provider = body.provider as AskAiProviderMode;
    }
    if (typeof body.budgetMs === 'number' && body.budgetMs >= 5_000 && body.budgetMs <= 60_000) {
      budgetMs = Math.floor(body.budgetMs);
    }
  } catch {
    /* empty body ok */
  }

  const baseUrl = getServerOllamaBaseUrl(provider);
  if (!baseUrl) {
    return NextResponse.json({ error: 'Sovereign node not configured.' }, { status: 503 });
  }

  const result = await waitForOllamaWarm(baseUrl, { budgetMs });
  return NextResponse.json(
    {
      warm: result.warm,
      waitedMs: result.waitedMs,
      probes: result.probes,
      provider,
      idlePolicy: 'soft_launch_workersMin=1_workersMax=5',
    },
    {
      status: result.warm ? 200 : 503,
      headers: {
        'X-Pocket-Sovereign-Wake': result.warm ? 'ready' : 'timeout',
        'X-Pocket-Sovereign-Waited-Ms': String(result.waitedMs),
      },
    }
  );
}

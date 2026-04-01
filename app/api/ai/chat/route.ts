/**
 * POST /api/ai/chat — Pocket Analyst inference.
 *
 * Stateless: request payload (message, context, attachedContent) is used only
 * to build the LLM prompt and stream the response. No database write or cache
 * of the payload; only analytics/quota metadata are persisted. See docs/IP-TECHNICAL-MECHANISMS.md.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { getEffectivePaidTier } from '@/app/lib/tier/effectivePaid';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

// Pocket Analyst: Gemini tried first when GOOGLE_GENERATIVE_AI_API_KEY is set (gemini-1.5-flash free, gemini-1.5-pro paid); OpenAI fallback when key set or Gemini fails.
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

const FREE_TIER_MONTHLY_LIMIT = 20; // Free: quota enforced; paid (foundersClub/corporateSponsor): no quota, unlimited.
const PERIOD_DAYS = 30;
const MAX_ATTACHED_CONTENT_LENGTH = 60_000; // Server-side cap for prod (frontend caps at 50k)

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

function getDb() {
  initializeFirebaseAdmin();
  return getFirestore();
}

/** Log Pocket Analyst event to Firestore toolUsage for /admin/analytics. Fire-and-forget for success; await for errors so log is persisted. */
async function logPocketAnalystEvent(
  db: ReturnType<typeof getFirestore>,
  payload: {
    action: 'question' | 'error';
    uid: string;
    tier?: string;
    isPaid?: boolean;
    hadAttachment?: boolean;
    provider?: string;
    status?: number;
    errorCode?: string;
  }
) {
  try {
    await db.collection('toolUsage').add({
      toolType: 'pocket_analyst',
      action: payload.action,
      metadata: {
        uid: payload.uid,
        tier: payload.tier ?? null,
        isPaid: payload.isPaid ?? false,
        hadAttachment: payload.hadAttachment ?? false,
        provider: payload.provider ?? null,
        status: payload.status ?? null,
        errorCode: payload.errorCode ?? null,
      },
      timestamp: Timestamp.now(),
    });
  } catch (e) {
    console.error('[Pocket Analyst] analytics log failed:', e);
  }
}

const SYSTEM_PROMPT = `You are the Pocket Portfolio Financial Analyst. You answer questions strictly related to Finance, Investing, Markets, Economic Data, and Technology.
If a user asks about non-finance topics (e.g., cooking, politics), politely decline and pivot back to their portfolio or markets.
You have access to the user's portfolio context provided below. Use it to personalize your answers when relevant.
When "Current quote data" is provided below, use it to answer price and quote questions with the actual numbers; do not say you lack live access.
When a section "File the user included (use this):" appears below, the user has included a file and its full text is there. You CAN and MUST use it to answer. Users usually refer to it implicitly (e.g. "this", "it", "these", "my holdings", "what I shared") without saying "attachment"—always treat their message as referring to this file when one is provided; answer using the file content and do not ask them to specify which asset or to share again.
When helpful, include reference links in Markdown format (e.g. [anchor text](https://...)) to official or authoritative sources (e.g. company IR, regulator, exchange, or trusted financial news) so users can verify; keep answers concise and add 1–3 links only when they add clear value.`;

// Map common company/crypto names (lowercase) to tickers for quote lookup. Crypto symbols (e.g. BTC) are normalized to *-USD by /api/quote.
const NAME_TO_TICKER: Record<string, string> = {
  apple: 'AAPL', microsoft: 'MSFT', tesla: 'TSLA', nvidia: 'NVDA', amazon: 'AMZN',
  meta: 'META', google: 'GOOGL', alphabet: 'GOOGL', netflix: 'NFLX', amd: 'AMD',
  intel: 'INTC', disney: 'DIS', visa: 'V', jpmorgan: 'JPM', jpm: 'JPM',
  coke: 'KO', 'coca cola': 'KO', pepsi: 'PEP', pfizer: 'PFE', merck: 'MRK',
  mastercard: 'MA', berkshire: 'BRK.B', tsm: 'TSM',
  btc: 'BTC', bitcoin: 'BTC', eth: 'ETH', ethereum: 'ETH', sol: 'SOL', solana: 'SOL',
  xrp: 'XRP', doge: 'DOGE', dogecoin: 'DOGE', ada: 'ADA', cardano: 'ADA',
  avax: 'AVAX', avalanche: 'AVAX', link: 'LINK', chainlink: 'LINK', dot: 'DOT', polkadot: 'DOT',
  matic: 'MATIC', polygon: 'MATIC', ltc: 'LTC', litecoin: 'LTC', bnb: 'BNB', uni: 'UNI', uniswap: 'UNI',
};

/** Extract possible ticker symbols from the user message for quote lookup. */
function extractSymbolHints(message: string): string[] {
  const lower = message.toLowerCase().trim();
  const out = new Set<string>();
  // 1) Known company names (whole-word or at word boundary)
  for (const [name, ticker] of Object.entries(NAME_TO_TICKER)) {
    const re = new RegExp(`\\b${name.replace(/\s+/g, '\\s+')}\\b`, 'i');
    if (re.test(message)) out.add(ticker);
  }
  // 2) Ticker-like tokens (2–5 uppercase letters, optional . or -)
  const tickerRe = /\b([A-Z]{2,5}(?:\.[A-Z])?)\b/g;
  let m: RegExpExecArray | null;
  while ((m = tickerRe.exec(message)) !== null) out.add(m[1]);
  return [...out].slice(0, 10); // cap at 10 symbols
}

type ChatBody = {
  message?: string;
  context?: string;
  attachedContent?: string;
};

export async function POST(request: NextRequest) {
  const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!geminiKey && !openaiKey) {
    return NextResponse.json(
      { error: 'AI service not configured. Set GOOGLE_GENERATIVE_AI_API_KEY or OPENAI_API_KEY in environment.' },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const idToken = authHeader.slice(7);

  let uid: string;
  let email: string;
  try {
    initializeFirebaseAdmin();
    const decoded = await getAuth().verifyIdToken(idToken);
    uid = decoded.uid;
    email = (decoded.email ?? '').trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  let body: ChatBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }

  const context = typeof body.context === 'string' ? body.context : '';
  const rawAttached = typeof body.attachedContent === 'string' ? body.attachedContent.trim() : '';
  const attachedContent = rawAttached.length > MAX_ATTACHED_CONTENT_LENGTH ? rawAttached.slice(0, MAX_ATTACHED_CONTENT_LENGTH) : rawAttached;

  // Fetch live quotes for symbols mentioned in the message so the model can answer price questions
  let quoteBlock = '';
  const symbolHints = extractSymbolHints(message);
  if (symbolHints.length > 0) {
    try {
      const origin = request.nextUrl?.origin ?? process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
      const quoteRes = await fetch(`${origin}/api/quote?symbols=${symbolHints.join(',')}`, { cache: 'no-store' });
      if (quoteRes.ok) {
        const quotes = (await quoteRes.json()) as Array<{ symbol: string; name?: string; price: number | null; change?: number | null; changePct?: number | null; currency?: string }>;
        const withPrice = quotes.filter((q) => q.price != null);
        if (withPrice.length > 0) {
          quoteBlock = '\n\nCurrent quote data (use this to answer price/quote questions):\n' + withPrice.map((q) => `${q.symbol}: ${q.currency || 'USD'} ${q.price}${q.changePct != null ? ` (${q.changePct >= 0 ? '+' : ''}${q.changePct.toFixed(2)}%)` : ''}`).join('\n');
        }
      }
    } catch {
      // ignore quote fetch errors; model will answer without live data
    }
  }

  const db = getDb();

  // Resolve tier from apiKeysByEmail (time-bound trials respect expiresAt)
  const apiKeyDoc = await db.collection('apiKeysByEmail').doc(email).get();
  const apiKeyData = apiKeyDoc.exists ? apiKeyDoc.data() : null;
  const effective = getEffectivePaidTier(apiKeyData);
  const tier = effective.tier ?? undefined;
  const isPaid = effective.isPaid;

  if (attachedContent && !isPaid) {
    await logPocketAnalystEvent(db, {
      action: 'error',
      uid,
      tier,
      isPaid: false,
      hadAttachment: true,
      status: 403,
      errorCode: 'attachment_forbidden',
    });
    return NextResponse.json(
      { error: 'File attachments are available on Founder\'s Club or Corporate tier' },
      { status: 403 }
    );
  }

  if (!isPaid) {
    const usageRef = db.collection('aiUsage').doc(uid);
    const usageSnap = await usageRef.get();
    const now = new Date();
    const data = usageSnap.exists ? usageSnap.data() : null;
    let usageCount = typeof data?.usageCount === 'number' ? data.usageCount : 0;
    let periodStart = data?.periodStart;

    if (periodStart && periodStart.toDate) {
      const start = periodStart.toDate();
      const daysSince = (now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000);
      if (daysSince >= PERIOD_DAYS) {
        usageCount = 0;
        periodStart = Timestamp.now();
      }
    } else {
      periodStart = Timestamp.now();
    }

    if (usageCount >= FREE_TIER_MONTHLY_LIMIT) {
      await logPocketAnalystEvent(db, {
        action: 'error',
        uid,
        tier,
        isPaid: false,
        hadAttachment: !!attachedContent,
        status: 429,
        errorCode: 'quota_exceeded',
      });
      return NextResponse.json(
        { error: `You've used ${FREE_TIER_MONTHLY_LIMIT} questions this month. Upgrade to Founder's Club for unlimited questions.` },
        { status: 429 }
      );
    }

    await usageRef.set(
      {
        usageCount: usageCount + 1,
        periodStart,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
  }

  const contextBlock = context
    ? `\n\nPortfolio context:\n${context}`
    : '\n\n(No portfolio context provided.)';
  const attachedBlock = attachedContent
    ? `\n\nFile the user included (use this):\n${attachedContent}`
    : '';
  const systemPrompt = SYSTEM_PROMPT + contextBlock + quoteBlock + attachedBlock;
  // When user included a file, prefix so the model treats "this"/"it" as referring to it (users rarely say "attachment")
  const userText = attachedContent
    ? `[The user has included a file above; their message refers to it.] ${message}`
    : message;

  // Try Gemini first if key is set
  if (geminiKey) {
    const modelId = isPaid ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
    const url = `${GEMINI_BASE}/models/${modelId}:streamGenerateContent?alt=sse&key=${encodeURIComponent(geminiKey)}`;
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userText }] }],
      }),
    });

    if (geminiRes.ok) {
      const reader = geminiRes.body?.getReader();
      if (reader) {
        logPocketAnalystEvent(db, {
          action: 'question',
          uid,
          tier,
          isPaid,
          hadAttachment: !!attachedContent,
          provider: 'gemini',
        }).catch(() => {});
        const decoder = new TextDecoder();
        let buffer = '';
        const stream = new ReadableStream({
          async start(controller) {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';
                for (const line of lines) {
                  const dataMatch = line.startsWith('data:') ? line.slice(5).trim() : null;
                  if (!dataMatch || dataMatch === '[DONE]') continue;
                  try {
                    const obj = JSON.parse(dataMatch);
                    const text = obj?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (typeof text === 'string' && text) {
                      controller.enqueue(new TextEncoder().encode(text));
                    }
                  } catch {
                    // ignore
                  }
                }
              }
              controller.close();
            } catch (e) {
              controller.error(e);
            }
          },
        });
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        });
      }
    } else {
      const errText = await geminiRes.text().catch(() => '');
      console.error('[Pocket Analyst] Gemini API error:', geminiRes.status, errText);
    }
  }

  // Fallback to OpenAI if key is set
  if (openaiKey) {
    try {
      logPocketAnalystEvent(db, {
        action: 'question',
        uid,
        tier,
        isPaid,
        hadAttachment: !!attachedContent,
        provider: 'openai',
      }).catch(() => {});
      const openai = createOpenAI({ apiKey: openaiKey });
      const model = openai(isPaid ? 'gpt-4o' : 'gpt-4o-mini');
      const result = streamText({
        model: model as Parameters<typeof streamText>[0]['model'],
        system: systemPrompt,
        prompt: userText,
      });
      return result.toTextStreamResponse();
    } catch (e) {
      console.error('[Pocket Analyst] OpenAI fallback error:', e);
    }
  }

  await logPocketAnalystEvent(db, {
    action: 'error',
    uid,
    tier,
    isPaid,
    hadAttachment: !!attachedContent,
    status: 502,
    errorCode: 'ai_error',
  });
  return NextResponse.json(
    { error: 'AI service error. Please try again.' },
    { status: 502 }
  );
}

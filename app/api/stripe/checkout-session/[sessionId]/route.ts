import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * Minimal Checkout Session payload for GA4 purchase (client-side).
 * Requires STRIPE_SECRET_KEY; session must be paid.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await context.params;
  if (!sessionId || typeof sessionId !== 'string' || sessionId.length < 10) {
    return NextResponse.json({ error: 'invalid_session' }, { status: 400 });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: 'stripe_not_configured' }, { status: 503 });
  }

  const stripe = new Stripe(secret, { apiVersion: '2025-11-17.clover' });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'not_paid', payment_status: session.payment_status },
        { status: 402 }
      );
    }

    const amountTotal = session.amount_total ?? 0;
    const currency = (session.currency || 'gbp').toUpperCase();
    const valueMajor = amountTotal / 100;

    const lineItems = session.line_items?.data ?? [];
    let items = lineItems.map((line, index) => {
      const qty = line.quantity ?? 1;
      const lineAmount = line.amount_total ?? 0;
      const unitMajor = qty > 0 ? lineAmount / 100 / qty : 0;
      const priceId = line.price && typeof line.price === 'object' && 'id' in line.price ? line.price.id : `line_${index}`;
      const name =
        line.description ||
        (line.price && typeof line.price === 'object' && 'nickname' in line.price && line.price.nickname
          ? String(line.price.nickname)
          : priceId);
      return {
        item_id: priceId,
        item_name: name.slice(0, 120),
        price: Math.round(unitMajor * 100) / 100,
        quantity: qty,
      };
    });

    if (items.length === 0) {
      items = [
        {
          item_id: 'checkout',
          item_name: 'Pocket Portfolio checkout',
          price: Math.round(valueMajor * 100) / 100,
          quantity: 1,
        },
      ];
    }

    return NextResponse.json(
      {
        transaction_id: session.id,
        value: Math.round(valueMajor * 100) / 100,
        currency,
        items,
      },
      {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      }
    );
  } catch (e) {
    console.error('[checkout-session]', e);
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
}

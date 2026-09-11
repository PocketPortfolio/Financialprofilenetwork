import { NextRequest, NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import {
  authErrorResponse,
  requireUserRequest,
} from '@/lib/auth/require-user-request';

const configuration = new Configuration({
  basePath: process.env.PLAID_ENV === 'production'
    ? PlaidEnvironments.production
    : PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
      'PLAID-SECRET': process.env.PLAID_SECRET!,
    },
  },
});

const client = new PlaidApi(configuration);

/**
 * Exchange Plaid public_token. Requires Firebase auth.
 * Does NOT return the long-lived access_token to the browser (Wave B / M6).
 * Returns item_id only until a server-side vault exists.
 */
export async function POST(request: NextRequest) {
  try {
    try {
      await requireUserRequest(request);
    } catch (e) {
      return authErrorResponse(e) as NextResponse;
    }

    const { public_token } = await request.json();

    if (!public_token) {
      return NextResponse.json(
        { error: 'public_token is required' },
        { status: 400 }
      );
    }

    const response = await client.itemPublicTokenExchange({
      public_token,
    });

    // Do not return access_token to the client. Persist server-side when vault lands.
    void response.data.access_token;

    return NextResponse.json({
      success: true,
      item_id: response.data.item_id,
    });
  } catch (error: any) {
    console.error('Plaid token exchange error:', error);
    return NextResponse.json(
      { error: error.response?.data?.error_message || 'Failed to exchange token' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

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

export async function POST(request: NextRequest) {
  try {
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

    // TODO: Store access_token in database for user
    // TODO: Fetch investments data using access_token

    return NextResponse.json({ 
      access_token: response.data.access_token,
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


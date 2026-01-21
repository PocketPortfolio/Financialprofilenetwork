import { NextRequest, NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

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
    const { userId } = await request.json();

    const response = await client.linkTokenCreate({
      user: {
        client_user_id: userId || 'anonymous',
      },
      client_name: 'Pocket Portfolio',
      products: [Products.Investments],
      country_codes: [CountryCode.Us],
      language: 'en',
    });

    return NextResponse.json({ link_token: response.data.link_token });
  } catch (error: any) {
    console.error('Plaid link token creation error:', error);
    return NextResponse.json(
      { error: error.response?.data?.error_message || 'Failed to create link token' },
      { status: 500 }
    );
  }
}


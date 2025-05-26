// app/api/customer/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const query = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const response = await fetch(`${process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ENDPOINT}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!,
    },
    body: JSON.stringify({
      query,
      variables: { input: { email, password } },
    }),
  });

  const json = await response.json();
  const tokenData = json.data.customerAccessTokenCreate;

  if (tokenData.customerAccessToken) {
    return NextResponse.json({
      customerAccessToken: tokenData.customerAccessToken.accessToken,
    });
  } else {
    return NextResponse.json(
      { error: tokenData.userErrors?.[0]?.message || 'ログイン失敗' },
      { status: 401 },
    );
  }
}

  
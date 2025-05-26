// app/api/customer/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'メールアドレスとパスワードが必要です' }, { status: 400 });
    }

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

    const res = await fetch(`${process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ENDPOINT}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || '',
      },
      body: JSON.stringify({
        query,
        variables: {
          input: { email, password },
        },
      }),
    });

    const json = await res.json();

    if (!json || !json.data?.customerAccessTokenCreate) {
      return NextResponse.json({ error: '不正なレスポンス' }, { status: 500 });
    }

    const result = json.data.customerAccessTokenCreate;

    if (result.customerAccessToken) {
      return NextResponse.json({
        customerAccessToken: result.customerAccessToken.accessToken,
      });
    }

    const errorMessage = result.userErrors?.[0]?.message || 'ログインに失敗しました';
    return NextResponse.json({ error: errorMessage }, { status: 401 });
  } catch (err: any) {
    console.error('API ERROR:', err);
    return NextResponse.json({ error: 'サーバーエラー: ' + err?.message }, { status: 500 });
  }
}

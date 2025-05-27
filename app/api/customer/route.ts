import { NextRequest, NextResponse } from 'next/server';
import { callShopifyCart } from '../../_libs/shopify';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'メールアドレスとパスワードが必要です' }, { status: 400 });
    }

    const json = await callShopifyCart(
      `
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
    `,
      { input: { email, password } }
    );

    const result = json?.data?.customerAccessTokenCreate;

    if (!result) {
      return NextResponse.json({ error: '不正なレスポンス' }, { status: 500 });
    }

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

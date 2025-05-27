import { NextRequest, NextResponse } from 'next/server';
import { callShopifyCart } from '../../../_libs/shopify';

export async function POST(req: NextRequest) {
  const { cartId, lines } = await req.json();

  const res = await callShopifyCart(
    `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
        }
        userErrors {
          message
        }
      }
    }
  `,
    { cartId, lines }
  );

  // userErrorsの型定義
  type UserError = { message: string };

  if (res.data.cartLinesAdd.userErrors.length > 0) {
    return NextResponse.json(
      { errors: res.data.cartLinesAdd.userErrors.map((e: UserError) => e.message) },
      { status: 400 }
    );
  }

  return NextResponse.json(res.data.cartLinesAdd.cart);
}
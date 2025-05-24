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

  return NextResponse.json(res.data);
}
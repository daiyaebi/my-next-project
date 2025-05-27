import { NextRequest, NextResponse } from 'next/server';
import { callShopifyCart } from '../../../_libs/shopify';

export async function POST(req: NextRequest) {
  try {
    const { cartId, lines } = await req.json();

    if (!cartId || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

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

    if (res.data.cartLinesAdd.userErrors.length > 0) {
      return NextResponse.json(
        { errors: res.data.cartLinesAdd.userErrors.map(e => e.message) },
        { status: 400 }
      );
    }

    return NextResponse.json({
      cart: res.data.cartLinesAdd.cart,
      errors: [],
    });
  } catch (error) {
    console.error('cartLinesAdd error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

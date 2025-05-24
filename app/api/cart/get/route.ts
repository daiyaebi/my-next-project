import { NextRequest, NextResponse } from 'next/server';
import { callShopifyCart } from '../../../_libs/shopify';

export async function POST(req: NextRequest) {
  const { cartId } = await req.json();

  const res = await callShopifyCart(
    `
    query cartQuery($cartId: ID!) {
      cart(id: $cartId) {
        checkoutUrl
      }
    }
  `,
    { cartId }
  );

  return NextResponse.json({ checkoutUrl: res.data.cart.checkoutUrl });
}
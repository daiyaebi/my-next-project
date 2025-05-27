import { NextRequest, NextResponse } from 'next/server';
import { callShopifyCart } from '../../../_libs/shopify';

export async function POST(req: NextRequest) {
  try {
    const { cartId } = await req.json();

    if (!cartId) {
      return NextResponse.json({ error: 'cartId is required' }, { status: 400 });
    }

    const fullCartId = cartId.startsWith('gid://shopify/Cart/')
      ? cartId
      : `gid://shopify/Cart/${cartId}`;

    const res = await callShopifyCart(
      `
      query cartQuery($cartId: ID!) {
        cart(id: $cartId) {
          checkoutUrl
        }
      }
      `,
      { cartId: fullCartId }
    );

    if (!res.data.cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    return NextResponse.json({ checkoutUrl: res.data.cart.checkoutUrl });
  } catch (error) {
    console.error('Error fetching checkout URL:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

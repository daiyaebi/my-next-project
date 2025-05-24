import { NextRequest, NextResponse } from 'next/server';
import { callShopifyCart } from '../../../_libs/shopify';

export async function POST(req: NextRequest) {
  const res = await callShopifyCart(
    `
    mutation {
      cartCreate {
        cart {
          id
        }
      }
    }
  `
  );
  return NextResponse.json({ cartId: res.data.cartCreate.cart.id });
}
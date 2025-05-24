import { NextRequest, NextResponse } from 'next/server';
import { callShopifyCart } from '../../../_libs/shopify';

export async function POST(req: NextRequest) {
  const { cartId, buyerIdentity } = await req.json();

  const res = await callShopifyCart(
    `
    mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
      cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
        cart {
          id
        }
        userErrors {
          message
        }
      }
    }
  `,
    { cartId, buyerIdentity }
  );

  return NextResponse.json(res.data);
}
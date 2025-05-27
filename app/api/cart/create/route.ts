import { NextRequest, NextResponse } from 'next/server';
import { callShopifyCart } from '../../../_libs/shopify';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { customerAccessToken } = body;

  const buyerIdentity = customerAccessToken
    ? `buyerIdentity: { customerAccessToken: "${customerAccessToken}" }`
    : '';

  const res = await callShopifyCart(
    `
    mutation {
      cartCreate(input: { ${buyerIdentity} }) {
        cart {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `
  );

  if (res.data?.cartCreate?.userErrors?.length) {
    console.error('cartCreate userErrors:', res.data.cartCreate.userErrors);
    return NextResponse.json({ error: res.data.cartCreate.userErrors }, { status: 400 });
  }

  return NextResponse.json({ cartId: res.data.cartCreate.cart.id });
}

import { NextRequest } from 'next/server';
import { callShopifyCart } from '../../../_libs/shopify';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body));

    const { cartId, buyerIdentity } = body;

    if (!cartId) {
      return new Response(JSON.stringify({ error: 'cartId is required' }), { status: 400 });
    }
    if (!buyerIdentity) {
      return new Response(JSON.stringify({ error: 'buyerIdentity is required' }), { status: 400 });
    }

    const mutation = `
      mutation updateCartBuyerIdentity($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
        cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
          cart {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      cartId,
      buyerIdentity: {
        email: buyerIdentity.email ?? null,
        phone: buyerIdentity.phone ?? null,
        ...(buyerIdentity.customerAccessToken
          ? { customerAccessToken: buyerIdentity.customerAccessToken }
          : {}),
        countryCode: buyerIdentity.countryCode ?? null
      },
    };

    const data = await callShopifyCart(mutation, variables);

    console.log('Full response data:', JSON.stringify(data));

    if (data.errors || (data.data?.cartBuyerIdentityUpdate?.userErrors.length ?? 0) > 0) {
      console.error('GraphQL Errors:', data.errors);
      console.error('User Errors:', data.data?.cartBuyerIdentityUpdate?.userErrors);
      return new Response(
        JSON.stringify({
          errors: data.errors,
          userErrors: data.data?.cartBuyerIdentityUpdate?.userErrors,
        }),
        { status: 400 }
      );
    }

    return new Response(JSON.stringify(data.data.cartBuyerIdentityUpdate), { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

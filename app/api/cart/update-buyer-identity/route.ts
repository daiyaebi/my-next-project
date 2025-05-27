import { NextRequest } from 'next/server';
import { callShopifyCart } from '../../../_libs/shopify';

export async function POST(req: NextRequest) {
  try {
    const { cartId, buyerIdentity } = await req.json();

    const mutation = `
      mutation updateCartBuyerIdentity($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
        cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
          cart {
            id
            checkoutUrl
            buyerIdentity {
              email
              phone
              customer {
                id
                email
              }
              deliveryAddress {
                firstName
                lastName
                address1
                city
                province
                zip
                country
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    // deliveryAddressPreferences → deliveryAddress に修正し、
    // countryCode を country に変換
    const variables = {
      cartId,
      buyerIdentity: {
        email: buyerIdentity.email ?? null,
        phone: buyerIdentity.phone ?? null,
        ...(buyerIdentity.customerAccessToken
          ? { customerAccessToken: buyerIdentity.customerAccessToken }
          : {}),
        deliveryAddress: buyerIdentity.deliveryAddress
          ? {
              firstName: buyerIdentity.deliveryAddress.firstName ?? null,
              lastName: buyerIdentity.deliveryAddress.lastName ?? null,
              address1: buyerIdentity.deliveryAddress.address1 ?? null,
              city: buyerIdentity.deliveryAddress.city ?? null,
              province: buyerIdentity.deliveryAddress.province ?? null,
              zip: buyerIdentity.deliveryAddress.zip ?? null,
              country: buyerIdentity.deliveryAddress.countryCode ?? null,
            }
          : null,
      },
    };

    const data = await callShopifyCart(mutation, variables);

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
import { NextRequest } from 'next/server';
import { callShopifyCart } from '../../../_libs/shopify'; // 適切なパスに調整してください

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
              deliveryAddressPreferences {
                deliveryAddress {
                  firstName
                  lastName
                  address1
                  city
                  province
                  zip
                  countryCode
                }
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

    const deliveryPref = buyerIdentity.deliveryAddressPreferences?.[0];
    const variables = {
      cartId,
      buyerIdentity: {
        email: buyerIdentity.email ?? null,
        phone: buyerIdentity.phone ?? null,
        deliveryAddressPreferences: deliveryPref
          ? [
              {
                deliveryAddress: {
                  firstName: deliveryPref.firstName ?? '',
                  lastName: deliveryPref.lastName ?? '',
                  address1: deliveryPref.address1 ?? '',
                  city: deliveryPref.city ?? '',
                  province: deliveryPref.province ?? '',
                  zip: deliveryPref.zip ?? '',
                  countryCode: deliveryPref.countryCode ?? 'JP',
                },
              },
            ]
          : [],
        ...(buyerIdentity.customerAccessToken
          ? { customerAccessToken: buyerIdentity.customerAccessToken }
          : {}),
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

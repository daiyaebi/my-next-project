import { NextRequest } from 'next/server';

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

    // 構造の正規化（ネスト不足を修正）
    const deliveryPref = buyerIdentity.deliveryAddressPreferences?.[0];
    const variables = {
      cartId,
      buyerIdentity: {
        email: buyerIdentity.email,
        phone: buyerIdentity.phone,
        deliveryAddressPreferences: deliveryPref
          ? [
              {
                deliveryAddress: {
                  firstName: deliveryPref.firstName,
                  lastName: deliveryPref.lastName,
                  address1: deliveryPref.address1,
                  city: deliveryPref.city,
                  province: deliveryPref.province,
                  zip: deliveryPref.zip,
                  countryCode: deliveryPref.countryCode, // e.g., 'JP'
                },
              },
            ]
          : [],
      },
    };

    const res = await fetch(process.env.SHOPIFY_STORE_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    const data = await res.json();

    if (data.errors || data.data.cartBuyerIdentityUpdate.userErrors.length > 0) {
      console.error('GraphQL Errors:', data.errors);
      console.error('User Errors:', data.data.cartBuyerIdentityUpdate.userErrors);
    }

    return new Response(JSON.stringify(data.data.cartBuyerIdentityUpdate), { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
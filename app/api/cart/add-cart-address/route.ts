import { NextRequest } from 'next/server';
import { callShopifyCart } from '../../../_libs/shopify';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body));

    const { cartId, buyerIdentity, deliveryAddress } = body;

    if (!cartId) {
      return new Response(JSON.stringify({ error: 'cartId is required' }), { status: 400 });
    }

    if (!buyerIdentity) {
      return new Response(JSON.stringify({ error: 'buyerIdentity is required' }), { status: 400 });
    }

    // ✅ Step 1: Update buyerIdentity (email, phone, customerAccessToken)
    const buyerMutation = `
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

    const buyerVariables = {
      cartId,
      buyerIdentity: {
        email: buyerIdentity.email ?? null,
        phone: buyerIdentity.phone ?? null,
        ...(buyerIdentity.customerAccessToken
          ? { customerAccessToken: buyerIdentity.customerAccessToken }
          : {}),
        countryCode: buyerIdentity.countryCode ?? "JP"
      },
    };

    const buyerResponse = await callShopifyCart(buyerMutation, buyerVariables);

    if (
      buyerResponse.errors ||
      (buyerResponse.data?.cartBuyerIdentityUpdate?.userErrors.length ?? 0) > 0
    ) {
      return new Response(
        JSON.stringify({
          errors: buyerResponse.errors,
          userErrors: buyerResponse.data?.cartBuyerIdentityUpdate?.userErrors,
        }),
        { status: 400 }
      );
    }

    // ✅ Step 2: Add delivery address
    const deliveryMutation = `
      mutation cartDeliveryAddressesAdd($cartId: ID!, $deliveryAddresses: [CartDeliveryAddressInput!]!) {
        cartDeliveryAddressesAdd(cartId: $cartId, deliveryAddresses: $deliveryAddresses) {
          cart {
            id
            deliveryGroups {
              deliveryAddress {
                ... on MailingAddress {
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
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const deliveryVariables = {
      cartId,
      deliveryAddresses: [
        {
          deliveryAddress: {
            firstName: deliveryAddress.firstName ?? '',
            lastName: deliveryAddress.lastName ?? '',
            address1: deliveryAddress.address1 ?? '',
            city: deliveryAddress.city ?? '',
            province: deliveryAddress.province ?? '',
            zip: deliveryAddress.zip ?? '',
            country: 'JP',
          },
        },
      ],
    };

    const deliveryResponse = await callShopifyCart(deliveryMutation, deliveryVariables);

    if (
      deliveryResponse.errors ||
      (deliveryResponse.data?.cartDeliveryAddressesAdd?.userErrors.length ?? 0) > 0
    ) {
      return new Response(
        JSON.stringify({
          errors: deliveryResponse.errors,
          userErrors: deliveryResponse.data?.cartDeliveryAddressesAdd?.userErrors,
        }),
        { status: 400 }
      );
    }

    return new Response(JSON.stringify(deliveryResponse.data.cartDeliveryAddressesAdd.cart), {
      status: 200,
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

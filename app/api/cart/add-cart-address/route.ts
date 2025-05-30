import { NextRequest } from 'next/server';
import { callShopifyCart } from '../../../_libs/shopify';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body));

    const { cartId, deliveryAddress } = body;

    if (!cartId || !deliveryAddress) {
      return new Response(JSON.stringify({ error: 'cartId and deliveryAddress are required' }), {
        status: 400,
      });
    }

    const mutation = `
      mutation CartDeliveryAddressesAdd($id: ID!, $addresses: [CartSelectableAddressInput!]!) {
        cartDeliveryAddressesAdd(cartId: $id, addresses: $addresses) {
          userErrors {
            message
            code
            field
          }
          warnings {
            message
            code
            target
          }
          cart {
            id
            delivery {
              addresses {
                id
                selected
                oneTimeUse
                address {
                  ... on CartDeliveryAddress {
                    firstName
                    lastName
                    company
                    address1
                    address2
                    city
                    provinceCode
                    zip
                    countryCode
                  }
                }
              }
            }
          }
        }
      }
    `;

    const variables = {
      id: cartId,
      addresses: [
        {
          selected: true,
          address: {
            deliveryAddress: {
              firstName: deliveryAddress.firstName ?? '',
              lastName: deliveryAddress.lastName ?? '',
              company: deliveryAddress.company ?? '',
              address1: deliveryAddress.address1 ?? '',
              address2: deliveryAddress.address2 ?? '',
              city: deliveryAddress.city ?? '',
              provinceCode: deliveryAddress.provinceCode ?? '',
              zip: deliveryAddress.zip ?? '',
              countryCode: deliveryAddress.countryCode ?? 'JP',
            },
          },
        },
      ],
    };

    const response = await callShopifyCart(mutation, variables);

    if (
      response.errors ||
      (response.data?.cartDeliveryAddressesAdd?.userErrors.length ?? 0) > 0
    ) {
      return new Response(
        JSON.stringify({
          errors: response.errors,
          userErrors: response.data?.cartDeliveryAddressesAdd?.userErrors,
        }),
        { status: 400 }
      );
    }

    return new Response(JSON.stringify(response.data.cartDeliveryAddressesAdd.cart), {
      status: 200,
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

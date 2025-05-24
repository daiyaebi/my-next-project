// Next.js API handler 例
export async function POST(req: Request) {
    const { cartId, buyerIdentity } = await req.json();
  
    const mutation = `
      mutation updateCartBuyerIdentity($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
        cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
          cart {
            id
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
  
    const variables = {
      cartId,
      buyerIdentity: {
        ...buyerIdentity,
        deliveryAddressPreferences: [
          {
            deliveryAddress: {
              firstName: buyerIdentity.deliveryAddressPreferences[0].firstName,
              lastName: buyerIdentity.deliveryAddressPreferences[0].lastName,
              address1: buyerIdentity.deliveryAddressPreferences[0].address1,
              city: buyerIdentity.deliveryAddressPreferences[0].city,
              province: buyerIdentity.deliveryAddressPreferences[0].province,
              zip: buyerIdentity.deliveryAddressPreferences[0].zip,
              countryCode: buyerIdentity.deliveryAddressPreferences[0].countryCode,
            },
          },
        ],
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
    return new Response(JSON.stringify(data), { status: 200 });
  }
  
import { NextRequest, NextResponse } from 'next/server';
import { callShopifyCart } from '../../_libs/shopify';

export async function POST(req: NextRequest) {
    try {
      const form = await req.formData();
      const variantId = form.get('variant_id') as string;
  
      const res = await callShopifyCart(
        `
        mutation cartCreate($input: CartInput!) {
          cartCreate(input: $input) {
            cart {
              id
              checkoutUrl
            }
            userErrors {
              message
            }
          }
        }
      `,
        {
          input: {
            lines: [
              {
                merchandiseId: variantId,
                quantity: 1,
              },
            ],
          },
        }
      );
  
      const { cart, userErrors } = res.data.cartCreate;
  
      if (userErrors?.length > 0) {
        return new NextResponse(
          JSON.stringify({ error: 'Cart creation error', messages: userErrors }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
  
      return NextResponse.redirect(cart.checkoutUrl);
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ error: 'Internal Server Error', detail: String(error) }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
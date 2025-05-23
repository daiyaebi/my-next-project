import { NextRequest, NextResponse } from 'next/server';
import { callShopify } from '../../_libs/shopify';


export async function POST(req: NextRequest) {
    try {
      const form = await req.formData();
      const variantId = form.get('variant_id') as string;
      const handle = form.get('handle') as string;
  
      const res = await callShopify(
        `
        mutation checkoutCreate($input: CheckoutCreateInput!) {
          checkoutCreate(input: $input) {
            checkout {
              id
              webUrl
            }
            checkoutUserErrors {
              code
              message
            }
          }
        }
      `,
        {
          input: {
            lineItems: [{ variantId, quantity: 1 }],
            customAttributes: [
              {
                key: 'source-url',
                value: `/one-pager?handle=${handle}`,
              },
            ],
          },
        }
      );
  
      const { checkout, checkoutUserErrors } = res.data.checkoutCreate;
  
      if (checkoutUserErrors.length > 0) {
        console.error('Shopify Checkout Errors:', checkoutUserErrors);
        return new NextResponse(
          JSON.stringify({
            error: 'Shopify Checkout Error',
            messages: checkoutUserErrors.map((e: any) => e.message),
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
  
      return NextResponse.redirect(checkout.webUrl);
    } catch (error) {
      console.error('API Error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Internal Server Error', detail: String(error) }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
  
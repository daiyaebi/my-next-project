import { NextRequest, NextResponse } from 'next/server';
import { callShopify } from '@/lib/shopify';

export async function POST(req: NextRequest) {
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
        lineItems: [
          {
            variantId,
            quantity: 1,
          },
        ],
        customAttributes: [
          {
            key: 'source-url',
            value: `/one-pager?handle=${handle}`,
          },
        ],
      },
    }
  );

  const webUrl = res.data.checkoutCreate.checkout.webUrl;
  return NextResponse.redirect(webUrl);
}

// app/api/customer/customercreate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { callShopifyCart } from '../../../_lib/shopify'; // 必要に応じてパス調整

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { firstName, lastName, email, phone, password, acceptsMarketing } = body;

    const response = await callShopifyCart(
      `#graphql
      mutation customerCreate($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
          customer {
            firstName
            lastName
            email
            phone
            acceptsMarketing
          }
          customerUserErrors {
            field
            message
            code
          }
        }
      }`,
      {
        variables: {
          input: {
            firstName,
            lastName,
            email,
            phone,
            password,
            acceptsMarketing,
          },
        },
      }
    );

    const data = await response.json();

    if (data.errors || data.data.customerCreate.customerUserErrors.length > 0) {
      return NextResponse.json(
        {
          errors: data.errors || data.data.customerCreate.customerUserErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ customer: data.data.customerCreate.customer });
  } catch (error) {
    console.error('Customer creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

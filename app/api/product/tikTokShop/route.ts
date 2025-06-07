// app/api/product/tikTokShop/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { callTikTokShopAPI } from '@/app/_libs/tikTokShop';

export async function GET(req: NextRequest) {
  try {
    // クエリパラメータ取得（例: ?page=1）
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');

    const data = await callTikTokShopAPI('product/list', {
      page_size: 10,
      page_number: page,
    });

    return NextResponse.json({ products: data.products });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'TikTok Shop API Error', detail: error.message },
      { status: 500 }
    );
  }
}

// app/api/product/tikTokShop/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { callTikTokShopAPI } from '../../../_libs/tikTokShop';

export async function GET(req: NextRequest) {
    try {
      // クエリパラメータ取得（例: ?page=1）
      const { searchParams } = new URL(req.url);
      const pageParam = searchParams.get('page');
      const page = pageParam && !isNaN(Number(pageParam)) ? parseInt(pageParam, 10) : 1;
  
      const response = await callTikTokShopAPI('product/list', {
        page_size: 10,
        page_number: page,
      });
  
      const products = response?.data?.products;
  
      if (!products) {
        return NextResponse.json(
          { error: 'No products found from TikTok Shop API' },
          { status: 502 }
        );
      }
  
      return NextResponse.json({ products });
    } catch (error: any) {
      return NextResponse.json(
        {
          error: 'TikTok Shop API Error',
          detail: error?.message || 'Unknown error',
        },
        { status: 500 }
      );
    }
  }
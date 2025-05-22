'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { callShopify } from '../_libs/shopify';

export default function OnePagerClient() {
  const searchParams = useSearchParams();
  const handle = searchParams.get('handle');
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    const fetchProduct = async () => {
    try{
      console.log('handle:', handle); // クエリパラメータが取れているか確認
      const res = await callShopify(
        `{
          productByHandle(handle: "${handle}") {
            title
            id
            variants(first:1) {
              edges {
                node {
                  id
                  title
                  image {
                    originalSrc
                  }
                  priceV2 {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }`
      );
      console.log('Shopify response:', res); // 結果の中身を確認
      setProduct(res.data.productByHandle);
    } catch (error) {
        console.error('Shopify API error:', error);
      }
    };

    if (handle) fetchProduct();
  }, [handle]);

  if (!product) return <p>Loading...</p>;

  const variant = product.variants.edges[0].node;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">{product.title}</h1>
      <img src={variant.image.originalSrc} alt={variant.title} className="w-64" />
      <p>{variant.priceV2.amount} {variant.priceV2.currencyCode}</p>
      <form method="POST" action="/api/checkout">
        <input type="hidden" name="variant_id" value={variant.id} />
        <input type="hidden" name="handle" value={handle || ''} />
        <button type="submit" className="mt-4 px-4 py-2 bg-black text-white rounded">今すぐ購入</button>
      </form>
    </main>
  );
}

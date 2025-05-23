'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { callShopifyCart } from '../_libs/shopify';

export default function OnePagerClient() {
  const searchParams = useSearchParams();
  const handle = searchParams.get('handle');
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('handle:', handle);
        const res = await callShopifyCart(
          `{
            productByHandle(handle: "${handle}") {
              title
              id
              variants(first: 1) {
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
        console.log('Shopify response:', res);
        setProduct(res.data.productByHandle);
      } catch (error) {
        console.error('Shopify API error:', error);
      }
    };

    if (handle) fetchProduct();
  }, [handle]);

  const handleBuyNow = async () => {
    if (!product) return;
    const variant = product.variants.edges[0].node;

    const formData = new FormData();
    formData.append('variant_id', variant.id);

    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl; // ✅ クライアント側でリダイレクト
      } else {
        console.error('Error:', data);
        alert('チェックアウトURLの取得に失敗しました');
      }
    } catch (err) {
      console.error('POST /api/checkout error:', err);
      alert('チェックアウト処理に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (!product) return <p>Loading...</p>;

  const variant = product.variants.edges[0].node;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">{product.title}</h1>
      <img src={variant.image.originalSrc} alt={variant.title} className="w-64" />
      <p>{variant.priceV2.amount} {variant.priceV2.currencyCode}</p>
    
      <form onSubmit={handleBuyNow} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium">姓</label>
          <input
            type="text"
            name="lastName"
            required
            className="mt-1 block w-full border border-gray-300 rounded p-2"
          />
        </div>
    
        <div>
          <label className="block text-sm font-medium">名</label>
          <input
            type="text"
            name="firstName"
            required
            className="mt-1 block w-full border border-gray-300 rounded p-2"
          />
        </div>
    
        <div>
          <label className="block text-sm font-medium">メールアドレス</label>
          <input
            type="email"
            name="email"
            required
            className="mt-1 block w-full border border-gray-300 rounded p-2"
          />
        </div>
    
        <div>
          <label className="block text-sm font-medium">電話番号</label>
          <input
            type="tel"
            name="phone"
            required
            className="mt-1 block w-full border border-gray-300 rounded p-2"
          />
        </div>
    
        <div>
          <label className="block text-sm font-medium">郵便番号</label>
          <input
            type="text"
            name="zip"
            required
            className="mt-1 block w-full border border-gray-300 rounded p-2"
          />
        </div>
    
        <div>
          <label className="block text-sm font-medium">都道府県</label>
          <input
            type="text"
            name="province"
            required
            className="mt-1 block w-full border border-gray-300 rounded p-2"
          />
        </div>
    
        <div>
          <label className="block text-sm font-medium">市区町村</label>
          <input
            type="text"
            name="city"
            required
            className="mt-1 block w-full border border-gray-300 rounded p-2"
          />
        </div>
    
        <div>
          <label className="block text-sm font-medium">番地・建物名</label>
          <input
            type="text"
            name="address1"
            required
            className="mt-1 block w-full border border-gray-300 rounded p-2"
          />
        </div>
    
        <button
          type="submit"
          className="w-full py-2 bg-black text-white rounded"
          disabled={loading}
        >
          {loading ? '処理中...' : '今すぐ購入'}
        </button>
      </form>
    </main>
  );
}

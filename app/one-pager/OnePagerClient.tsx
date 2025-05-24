'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { callShopifyCart } from '../_libs/shopify';

type ShopifyProduct = {
  title: string;
  id: string;
  variants: {
    edges: {
      node: {
        id: string;
        title: string;
        image: {
          originalSrc: string;
        } | null;
        priceV2: {
          amount: string;
          currencyCode: string;
        };
      };
    }[];
  };
};

export default function OnePagerClient() {
  const searchParams = useSearchParams();
  const handle = searchParams.get('handle');
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(false);

  // 入力値ステート
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [zip, setZip] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [address1, setAddress1] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const query = `
          query GetProduct($handle: String!) {
            productByHandle(handle: $handle) {
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
          }
        `;
        const res = await callShopifyCart(query, { handle });
        setProduct(res.data.productByHandle);
      } catch (error) {
        console.error('Shopify API error:', error);
      }
    };

    if (handle) fetchProduct();
  }, [handle]);

  const handleBuyNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    const variant = product.variants.edges[0].node;
    setLoading(true);

    try {
      const cartCreateRes = await fetch('/api/cart/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const { cartId } = await cartCreateRes.json();

      await fetch('/api/cart/add-lines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          lines: [
            {
              merchandiseId: variant.id,
              quantity: 1,
            },
          ],
        }),
      });

      await fetch('/api/cart/update-buyer-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          buyerIdentity: {
            email,
            phone,
            deliveryAddressPreferences: [
              {
                firstName,
                lastName,
                address1,
                city,
                province,
                zip,
                countryCode: 'JP',
              },
            ],
          },
        }),
      });

      const checkoutRes = await fetch('/api/cart/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId }),
      });

      const { checkoutUrl } = await checkoutRes.json();

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('チェックアウトURL取得失敗');
      }
    } catch (err) {
      console.error('handleBuyNow error:', err);
      alert('購入処理に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (!product) return <p>Loading...</p>;

  const variant = product.variants.edges[0].node;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">{product.title}</h1>
      {variant.image?.originalSrc && (
        <img
          src={variant.image.originalSrc}
          alt={`${product.title} の商品画像`}
          className="w-64"
        />
      )}
      <p>{variant.priceV2.amount} {variant.priceV2.currencyCode}</p>

      <form onSubmit={handleBuyNow} className="mt-4 space-y-4">
        <input required placeholder="姓" value={lastName} onChange={(e) => setLastName(e.target.value)} className="block w-full border rounded p-2" />
        <input required placeholder="名" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="block w-full border rounded p-2" />
        <input required type="email" placeholder="メール" value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full border rounded p-2" />
        <input required type="tel" placeholder="電話番号" value={phone} onChange={(e) => setPhone(e.target.value)} className="block w-full border rounded p-2" />
        <input required placeholder="郵便番号" pattern="\d{3}-?\d{4}" value={zip} onChange={(e) => setZip(e.target.value)} className="block w-full border rounded p-2" />
        <input required placeholder="都道府県" value={province} onChange={(e) => setProvince(e.target.value)} className="block w-full border rounded p-2" />
        <input required placeholder="市区町村" value={city} onChange={(e) => setCity(e.target.value)} className="block w-full border rounded p-2" />
        <input required placeholder="番地・建物名" value={address1} onChange={(e) => setAddress1(e.target.value)} className="block w-full border rounded p-2" />

        <button type="submit" disabled={loading} className="w-full py-2 bg-black text-white rounded">
          {loading ? '処理中...' : '今すぐ購入'}
        </button>
      </form>
    </main>
  );
}

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { callShopifyCart } from '../_libs/shopify';
import styles from './page.module.css';

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

  if (!product) return <p></p>;

  const variant = product.variants.edges[0].node;

  return (
    <main className={styles['product-detail']}>
      <h1 className={styles['product-title']}>{product.title}</h1>
    
      {variant.image?.originalSrc && (
        <div className={styles['product-image-wrapper']}>
          <img
            src={variant.image.originalSrc}
            alt={`${product.title} の商品画像`}
            className={styles['product-image']}
          />
        </div>
      )}

      <p className={styles['product-price']}>
        {variant.priceV2.amount} {variant.priceV2.currencyCode}
      </p>
      
      <form onSubmit={handleBuyNow} className={styles['buy-form']}>
        <button
          type="submit"
          disabled={loading}
          className={styles['buy-button']}
        >
          {loading ? '処理中...' : '今すぐ購入'}
        </button>
      </form>
    </main>
  );
}

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

export default function ProductIntroClient() {
  const searchParams = useSearchParams();
  const handle = searchParams.get('handle');
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address1: '',
    city: '',
    province: '',
    zip: '',
    countryCode: 'JP',
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBuyNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    const variant = product.variants.edges[0].node;
    setLoading(true);

    try {
      // カート作成
      const cartCreateRes = await fetch('/api/cart/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const { cartId } = await cartCreateRes.json();

      // 商品追加
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

      // 購入者情報を付与
      await fetch('/api/cart/update-buyer-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          buyerIdentity: {
            email: formData.email,
            phone: formData.phone,
            deliveryAddressPreferences: [
              {
                firstName: formData.firstName,
                lastName: formData.lastName,
                address1: formData.address1,
                city: formData.city,
                province: formData.province,
                zip: formData.zip,
                countryCode: formData.countryCode,
              },
            ],
          },
        }),
      });

      // チェックアウトURL取得
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

  if (!product) return (
    <div className={styles['loading-wrapper']}>
      <div className={styles['spinner']} />
      <span>Loading...</span>
    </div>
  );

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
        <input name="email" type="email" placeholder="メールアドレス" value={formData.email} onChange={handleInputChange} required />
        <input name="phone" type="tel" placeholder="電話番号" value={formData.phone} onChange={handleInputChange} />
        <input name="firstName" placeholder="名" value={formData.firstName} onChange={handleInputChange} />
        <input name="lastName" placeholder="姓" value={formData.lastName} onChange={handleInputChange} />
        <input name="address1" placeholder="住所1" value={formData.address1} onChange={handleInputChange} />
        <input name="city" placeholder="市区町村" value={formData.city} onChange={handleInputChange} />
        <input name="province" placeholder="都道府県" value={formData.province} onChange={handleInputChange} />
        <input name="zip" placeholder="郵便番号" value={formData.zip} onChange={handleInputChange} />

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
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
  const [customerAccessToken, setCustomerAccessToken] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

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

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
        }),
      });

      const data = await res.json();

      if (data.customerAccessToken) {
        setCustomerAccessToken(data.customerAccessToken);
        alert('ログイン成功');
      } else {
        alert('ログイン失敗: ' + data.error || '不明なエラー');
      }
    } catch (err) {
      console.error('ログインエラー:', err);
      alert('ログイン処理に失敗しました');
    }
  };

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

      // 顧客ログイン済みなら customerAccessToken を付ける
      const buyerIdentity: any = {
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
      };

      if (customerAccessToken) {
        buyerIdentity.customerAccessToken = customerAccessToken;
      }

      await fetch('/api/cart/update-buyer-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          buyerIdentity,
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

      {/* 顧客ログインフォーム */}
      {!customerAccessToken && (
        <form onSubmit={handleCustomerLogin} className={styles['buy-form']}>
          <h2>ログインして購入</h2>
          <input name="email" type="email" placeholder="メールアドレス" value={loginForm.email} onChange={handleLoginInputChange} required />
          <input name="password" type="password" placeholder="パスワード" value={loginForm.password} onChange={handleLoginInputChange} required />
          <button type="submit" className={styles['buy-button']}>ログイン</button>
        </form>
      )}

      {/* 既存の購入フォーム（変更なし） */}
      <form onSubmit={handleBuyNow} className={styles['buy-form']}>
        <input name="email" type="email" placeholder="メールアドレス" value={formData.email} onChange={handleInputChange} required />
        <input name="phone" type="tel" placeholder="電話番号" value={formData.phone} onChange={handleInputChange} />
        <input name="firstName" placeholder="名" value={formData.firstName} onChange={handleInputChange} />
        <input name="lastName" placeholder="姓" value={formData.lastName} onChange={handleInputChange} />
        <input name="address1" placeholder="住所1" value={formData.address1} onChange={handleInputChange} />
        <input name="city" placeholder="市区町村" value={formData.city} onChange={handleInputChange} />
        <input name="province" placeholder="都道府県" value={formData.province} onChange={handleInputChange} />
        <input name="zip" placeholder="郵便番号" value={formData.zip} onChange={handleInputChange} />

        <button type="submit" disabled={loading} className={styles['buy-button']}>
          {loading ? '処理中...' : '今すぐ購入'}
        </button>
      </form>
    </main>
  );
}

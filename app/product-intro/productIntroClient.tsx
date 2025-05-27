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
          url: string | null;  // 以前のoriginalSrcからurlに変更
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
    countryCode: 'JP'
  });

  useEffect(() => {
    if (!handle) return;

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
                      url
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

    fetchProduct();
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
      } else {
        alert('ログイン失敗: ' + (data.error || '不明なエラー'));
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
      // カート作成
      const cartCreateRes = await fetch('/api/cart/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerAccessToken,
        }),
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

      // buyerIdentity の配送先はオブジェクト形式（配列ではない）
      const buyerIdentity: any = {
        email: formData.email,
        phone: formData.phone
      };

      if (customerAccessToken) {
        buyerIdentity.customerAccessToken = customerAccessToken;
        console.log(buyerIdentity.customerAccessToken);
      }

      // buyerIdentity 更新
      await fetch('/api/cart/update-buyer-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          buyerIdentity,
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
        console.log(checkoutUrl);
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

  if (!customerAccessToken) {
    return (
      <main className={styles['product-detail']}>
        <form onSubmit={handleCustomerLogin} className={styles['buy-form']}>
          <h2>ログインして購入</h2>
          <input className={styles.input} name="email" type="email" placeholder="メールアドレス" value={loginForm.email} onChange={handleLoginInputChange} required />
          <input className={styles.input} name="password" type="password" placeholder="パスワード" value={loginForm.password} onChange={handleLoginInputChange} required />
          <button type="submit" className={styles['buy-button']}>ログイン</button>
        </form>
      </main>
    );
  }

  if (!product) {
    return (
      <div className={styles['loading-wrapper']}>
        <div className={styles['spinner']} />
        <span>商品情報を読み込み中...</span>
      </div>
    );
  }

  const variant = product.variants.edges[0].node;

  return (
    <main className={styles['product-detail']}>
      <h1 className={styles['product-title']}>{product.title}</h1>
      {variant.image?.url && (
        <div className={styles['image-wrapper']}>
         <img src={variant.image.url} alt={variant.title} className={styles['product-image']} />
         <p>価格: {variant.priceV2.amount} {variant.priceV2.currencyCode}</p>
        </div>
      )}
      <form onSubmit={handleBuyNow} className={styles['buy-form']}>
      　<input
　　　　　  className={styles.input}
　　　　　  name="email"
　　　　　  type="email"
　　　　　  placeholder="メールアドレス"
　　　　　  value={formData.email}
　　　　　  onChange={handleInputChange}
　　　　　  required
　　　　　  pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
　　　　　  title="有効なメールアドレスを入力してください"
　　　　　/>
　　　　　<input
　　　　　  className={styles.input}
　　　　　  name="phone"
　　　　　  type="tel"
　　　　　  placeholder="電話番号（例: 9012345678）"
　　　　　  value={formData.phone}
　　　　　  onChange={(e) => {
　　　　　    const input = e.target.value.replace(/[^0-9]/g, ''); // 数字以外を除去
　　　　　    const formatted = `+81${input.startsWith('0') ? input.slice(1) : input}`;
　　　　　    handleInputChange({
　　　　　      ...e,
　　　　　      target: { ...e.target, value: formatted },
　　　　　    });
　　　　　  }}
　　　　　  required
　　　　　  pattern="^\+81\d{9,10}$"
　　　　　  title="日本の電話番号を+81で入力してください（例: +819012345678）"
　　　　　/>
        <button type="submit" disabled={loading} className={styles['buy-button']}>
          {loading ? '処理中...' : '今すぐ購入'}
        </button>
      </form>
    </main>
  );
}
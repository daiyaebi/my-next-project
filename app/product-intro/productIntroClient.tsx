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
    countryCode: 'JP',
    lastName: '',
    firstName: '',
    address1: '',
    address2: '',
    city: '',
    provinceCode: '',
    zip: ''
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      // 配送先住所追加
      await fetch('/api/cart/add-cart-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          deliveryAddress: {
            lastName: formData.lastName,
            firstName: formData.firstName,
            address1: formData.address1,
            address2: formData.address2 || '',
            city: formData.city,
            provinceCode: formData.provinceCode,
            zip: formData.zip,
            countryCode: formData.countryCode,
            phone: formData.phone,
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

  // if (!customerAccessToken) {
  //   return (
  //     <main className={styles['product-detail']}>
  //       <form onSubmit={handleCustomerLogin} className={styles['buy-form']}>
  //         <h2>ログインして購入</h2>
  //         <input className={styles.input} name="email" type="email" placeholder="メールアドレス" value={loginForm.email} onChange={handleLoginInputChange} required />
  //         <input className={styles.input} name="password" type="password" placeholder="パスワード" value={loginForm.password} onChange={handleLoginInputChange} required />
  //         <button type="submit" className={styles['buy-button']}>ログイン</button>
  //       </form>
  //     </main>
  //   );
  // }

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
        </div>
      )}
      <p>価格: {variant.priceV2.amount} {variant.priceV2.currencyCode}</p>
      <form onSubmit={handleBuyNow} className={styles['buy-form']}>
      <input
       className={styles.input}
       name="email"
       type="email"
       placeholder="メールアドレス"
       value={formData.email}
       onChange={handleInputChange}
       required
       pattern="^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$"
       title="有効なメールアドレスを入力してください"
     />
     <input
       className={styles.input}
       name="phone"
       type="tel"
       placeholder="90から始まる番号（例: 9012345678）"
       value={formData.phone.replace(/^\+81/, '')}
       onChange={(e) => {
         const raw = e.target.value.replace(/\D/g, ''); // 数字のみ許容
         setFormData({ ...formData, phone: `+81${raw}` });
       }}
       pattern="^\d{9,10}$"
       title="90から始まる9〜10桁の電話番号を入力してください"
       required
     />
     <input
       className={styles.input}
       name="lastName"
       type="text"
       placeholder="山田"
       value={formData.lastName}
       onChange={handleInputChange}
       required
     />
     <input
       className={styles.input}
       name="firstName"
       type="text"
       placeholder="太郎"
       value={formData.firstName}
       onChange={handleInputChange}
       required
     />
     <input
       className={styles.input}
       name="zip"
       type="text"
       placeholder="郵便番号（例：1000001）"
       value={formData.zip}
       onChange={handleInputChange}
       required
     />
　　　<select
　　　  className={styles.input}
　　　  name="provinceCode"
　　　  value={formData.provinceCode}
　　　  onChange={handleInputChange}
　　　  required
　　　>
　　　  <option value="">都道府県を選択</option>
　　　  <option value="JP-01">北海道</option>
　　　  <option value="JP-02">青森県</option>
　　　  <option value="JP-03">岩手県</option>
　　　  <option value="JP-04">宮城県</option>
　　　  <option value="JP-05">秋田県</option>
　　　  <option value="JP-06">山形県</option>
　　　  <option value="JP-07">福島県</option>
　　　  <option value="JP-08">茨城県</option>
　　　  <option value="JP-09">栃木県</option>
　　　  <option value="JP-10">群馬県</option>
　　　  <option value="JP-11">埼玉県</option>
　　　  <option value="JP-12">千葉県</option>
　　　  <option value="JP-13">東京都</option>
　　　  <option value="JP-14">神奈川県</option>
　　　  <option value="JP-15">新潟県</option>
　　　  <option value="JP-16">富山県</option>
　　　  <option value="JP-17">石川県</option>
　　　  <option value="JP-18">福井県</option>
　　　  <option value="JP-19">山梨県</option>
　　　  <option value="JP-20">長野県</option>
　　　  <option value="JP-21">岐阜県</option>
　　　  <option value="JP-22">静岡県</option>
　　　  <option value="JP-23">愛知県</option>
　　　  <option value="JP-24">三重県</option>
　　　  <option value="JP-25">滋賀県</option>
　　　  <option value="JP-26">京都府</option>
　　　  <option value="JP-27">大阪府</option>
　　　  <option value="JP-28">兵庫県</option>
　　　  <option value="JP-29">奈良県</option>
　　　  <option value="JP-30">和歌山県</option>
　　　  <option value="JP-31">鳥取県</option>
　　　  <option value="JP-32">島根県</option>
　　　  <option value="JP-33">岡山県</option>
　　　  <option value="JP-34">広島県</option>
　　　  <option value="JP-35">山口県</option>
　　　  <option value="JP-36">徳島県</option>
　　　  <option value="JP-37">香川県</option>
　　　  <option value="JP-38">愛媛県</option>
　　　  <option value="JP-39">高知県</option>
　　　  <option value="JP-40">福岡県</option>
　　　  <option value="JP-41">佐賀県</option>
　　　  <option value="JP-42">長崎県</option>
　　　  <option value="JP-43">熊本県</option>
　　　  <option value="JP-44">大分県</option>
　　　  <option value="JP-45">宮崎県</option>
　　　  <option value="JP-46">鹿児島県</option>
　　　  <option value="JP-47">沖縄県</option>
　　　</select>
     <input
       className={styles.input}
       name="city"
       type="text"
       placeholder="市区町村（例：大田区）"
       value={formData.city}
       onChange={handleInputChange}
       required
     />
     <input
       className={styles.input}
       name="address1"
       type="text"
       placeholder="住所1（例：大森西3-11-00）"
       value={formData.address1}
       onChange={handleInputChange}
       required
     />
     <input
       className={styles.input}
       name="address2"
       type="text"
       placeholder="住所2（建物名など）"
       value={formData.address2}
       onChange={handleInputChange}
     />
        <button type="submit" disabled={loading} className={styles['buy-button']}>
          {loading ? '処理中...' : '今すぐ購入'}
        </button>
      </form>
    </main>
  );
}
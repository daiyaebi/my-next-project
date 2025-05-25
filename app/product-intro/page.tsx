import { Suspense } from 'react';
import productIntroClient from './productIntroClient';
import styles from './page.module.css';

export default function Page() {
  return (
  <>
  <header className={styles['page-title-wrapper']}>
     <h1 className={styles['page-title']}>
       外部CMSの商品紹介画面からShopifyチェックアウトにスムーズに遷移するカスタムアプリ
     </h1>
     <h2 className={styles['page-title']}>Shopify Storefront API × Next.js（ヘッドレスコマース）</h2>
  </header>
　<Suspense
  　fallback={
    　<div className={styles['loading-wrapper']}>
      <div className={styles['spinner']} />
      　<span>Loading...</span>
    　</div>
  　}
　>
  　<productIntroClient />
　</Suspense>
</>
  );
}

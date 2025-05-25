import { Suspense } from 'react';
import OnePagerClient from './OnePagerClient';
import styles from './page.module.css';

export default function Page() {
  return (
  <>
  <header className={styles['page-title-wrapper']}>
     <h1 className={styles['page-title']}>
       Shopify Storefront API × Next.js（ヘッドレスコマース）で「今すぐ購入」からチェックアウトにスムーズに遷移するミニアプリ
     </h1>
  </header>
　<Suspense
  　fallback={
    　<div className={styles['loading-wrapper']}>
      <div className={styles['spinner']} />
      　<span>Loading...</span>
    　</div>
  　}
　>
  　<OnePagerClient />
　</Suspense>
</>
  );
}

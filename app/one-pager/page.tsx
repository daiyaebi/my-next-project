import { Suspense } from 'react';
import OnePagerClient from './OnePagerClient';
import styles from './page.module.css';

export default function Page() {
  return (
    <Suspense fallback={<div className={styles['buy-form']}>Loading...</div>}>
      <OnePagerClient />
    </Suspense>
  );
}

import { getTermsDetail } from '@/app/_libs/microcms';
import { TERMS_LIST_LIMIT } from '../_constants/index';
import styles from './page.module.css';

export default async function Page() {
  const data = await getTermsDetail({ limit: TERMS_LIST_LIMIT });
  return (
    <div className={styles.container}>
      {data.contents.length === 0 ? (
        <p className={styles.empty}>登録されていません。</p>
      ) : (
        <div>
          {data.contents.map((item) => (
              <div key={item.id}>{item.terms}</div>
          ))}
        </div>
      )}
    </div>
  );
}
import Image from 'next/image';
import { getTermsDetail } from '@/app/_libs/microcms';
import { MEMBER_LIST_LIMIT } from '../_constants/index';
import styles from './page.module.css';

export default async function Page() {
  const data = await getTermsDetail({ limit: MEMBER_LIST_LIMIT });
  return (
    <div className={styles.container}>
      {data.contents.length === 0 ? (
        <p className={styles.empty}>登録されていません。</p>
      ) : (
        <div>
          {data.contents.map((term) => (
              <div>{term.terms}</div>
          ))}
        </div>
      )}
    </div>
  );
}
import Image from 'next/image';
import { getMembersList } from '@/app/_libs/microcms';
import { MEMBER_LIST_LIMIT } from '../_constants/index';
import styles from './page.module.css';
import mainStyles from "../page.module.css";


export default async function Page() {
  const data = await getMembersList({ limit: MEMBER_LIST_LIMIT });
  return (
    <div className={styles.container}>
      {data.contents.length === 0 ? (
        <p className={styles.empty}>メンバーが登録されていません。</p>
      ) : (
        <ul>
          {data.contents.map((member) => (
            <li key={member.id} className={styles.list}>
              <Image
                src={member.image.url}
                alt=""
                width={member.image.width}
                height={member.image.height}
                className={styles.image}
                priority
              />
              <dl>
                <dt className={styles.name}>{member.name}</dt>
                <dd className={styles.position}>{member.position}</dd>
                <dd className={styles.profile}>{member.profile}</dd>
              </dl>
            </li>
          ))}
        </ul>
      )}
      <a 
        href="https://note.com/e_daiya" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        <img 
          src="/note_image.png" 
          alt="note投稿記事" 
          className={mainStyles.noteImage}
        />
        <span>noteにも記事を投稿してます！</span>
      </a>
    </div>
  );
}
import { getNewsList } from "../_libs/microcms";
import Image from 'next/image';
import NewsList from "../_components/NewsList/index";
import Pagination from "../_components/Pagination/index";
import SearchField from "../_components/SearchField/index";
import { NEWS_LIST_LIMIT } from "../_constants/index";
import styles from "../page.module.css";


export default async function Page() {
  const { contents: news, totalCount } = await getNewsList({
    limit: NEWS_LIST_LIMIT,
  });
  return (
    <>
      <SearchField />
      <a
        href="https://note.com/e_daiya"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="/note_image.png"
          alt="note投稿記事"
          className={styles.noteImage}
          width={50}
          height={50}
        />
        <span>noteにも記事を投稿してます！</span>
      </a>
      <NewsList news={news} />
      <Pagination totalCount={totalCount} />
    </>
  );
}
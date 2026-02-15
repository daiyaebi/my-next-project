import styles from "./page.module.css";
import Image from "@/node_modules/next/image";
import { getNewsList } from "@/app/_libs/microcms";
import NewsList from "@/app/_components/NewsList/index";
import ButtonLink from "@/app/_components/ButtonLink/index";
// import { News } from "@/app/_libs/microcms";
import { TOP_NEWS_LIMIT } from "./_constants/index";


export const revalidate = 60;
export default async function Home() {
  const data = await getNewsList({
    limit: TOP_NEWS_LIMIT,
  })
  return (
    <>
      <section className={styles.top}>
        <div>
          <h1 className={styles.title}>Knowledge <span className={styles.S}>S</span></h1>
          <p className={styles.description}>Shopifyで使える便利なKnowledgeを共有</p>
        </div>
        <Image className={styles.bgimg} src="/KnowledgeS_top.png" alt="" width={4000} height={1200} />
      </section>
      <section className={styles.news}>
        <h2 className={styles.newsTitle}>記事</h2>
        <NewsList news={data.contents} />
        <div className={styles.newsLink}>
          <ButtonLink href="/news">もっと見る</ButtonLink>
        </div>
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
      </section>
    </>
  );
}
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
          <h1 className={styles.title}>Shopify Knowledge</h1>
          <p className={styles.description}>Shopify案件のKnowledge共有</p>
        </div>
        <Image className={styles.bgimg} src="/background-kinabaru.JPG" alt="" width={4000} height={1200} />
      </section>
      <section className={styles.news}>
        <h2 className={styles.newsTitle}>News</h2>
        <NewsList news={data.contents} />
        <div className={styles.newsLink}>
          <ButtonLink href="/news">もっと見る</ButtonLink>
        </div>
      </section>
    </>
    );
}
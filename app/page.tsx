import styles from "./page.module.css";
import Image from "@/node_modules/next/image";
import NewsList from "@/app/_components/NewsList/index";
import ButtonLink from "@/app/_components/ButtonLink/index";
import { News } from "@/app/_libs/microcms";


const data: {contents: News[] } = {
    contents: [
      {
        id: "1",
        title: "渋谷に移転しました",
        category: {
          name: "更新情報"
        },
        publishedAt: "2024/11/20",
        createdAt: "2024/11/20"
      },
      {
        id: "2",
        title: "当社CEOが凄いです",
        category: {
          name: "更新情報",
        },
        publishedAt: "2024/11/20",
        createdAt: "2024/11/20"
      },
      {
        id: "3",
        title: "テストです",
        category: {
          name: "更新情報",
        },
        publishedAt: "2024/11/20",
        createdAt: "2024/11/20"
      },
    ],
  };
export default function Home() {
  const sliceData = data.contents.slice(0, 2);
  // const sliceData: News = [];
  return (
    <>
      <section className={styles.top}>
        <div>
          <h1 className={styles.title}>テクノロジーの力で世界を変える</h1>
          <p className={styles.description}>私たちは市場をリードするグローバルテックカンパニーです。</p>
        </div>
        <Image className={styles.bgimg} src="/img-mv.jpg" alt="" width={4000} height={1200} />
      </section>
      <section className={styles.news}>
        <h2 className={styles.newsTitle}>News</h2>
        <NewsList news={sliceData} />
        <div className={styles.newsLink}>
          <ButtonLink href="/news">もっと見る</ButtonLink>
        </div>
      </section>
    </>
    );
}
import { notFound } from "@/node_modules/next/navigation";
import { getNewsDetail } from "@/app/_libs/microcms";
import Article from "@/app/_components/Article/index";
import ButtonLink from "@/app/_components/ButtonLink/index";
import styles from "./page.module.css";

type Props = {
    params: {
        slug: string;
    };
    searchParams: {
        dk?: string;
    }
};

export default async function Page({params, searchParams}: Props) {
    const data = await getNewsDetail(params.slug, {
        draftKey: searchParams.dk,
    }).catch(notFound);
    return (
        <>
            <Article data={data} />
            <div className={styles.footer}>
                <ButtonLink href="/news">Knowledge 一覧へ</ButtonLink>
            </div>
        </>
    )
}
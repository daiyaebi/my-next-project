import { notFound } from "@/node_modules/next/navigation";
import { getNewsList } from "@/app/_libs/microcms";
import NewsList from "@/app/_components/NewsList/index";
import Pagination from "@/app/_components/Pagination/index";
import { NEWS_LIST_LIMIT } from "@/app/_constants/index";

type Props = {
    params: {
        current: string;
    };
};
export default async function Page({params}: Props) {
    const current = parseInt(params.current, 10);
    if(Number.isNaN(current) || current < 1){
        notFound();
    }
    const {contents: news, totalCount} = await getNewsList({
        limit: NEWS_LIST_LIMIT,
        offset: NEWS_LIST_LIMIT * (current - 1),
    });
    if(news.length === 0){
        notFound();
    }
    return (
        <>
            <NewsList news={news} />
            <Pagination totalCount={totalCount} current={current} />
        </>
    );
}
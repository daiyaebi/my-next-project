import { getNewsList } from "../_libs/microcms";
import NewsList from "../_components/NewsList/index";
import Pagination from "../_components/Pagination/index";
import SearchField from "../_components/SearchField/index";
import { NEWS_LIST_LIMIT } from "../_constants/index";
export default async function Page(){
    const {contents: news, totalCount} = await getNewsList({
        limit: NEWS_LIST_LIMIT,
    });
    return (
        <>
            <SearchField />
            <NewsList news={news}/>
            <Pagination totalCount={totalCount} />
        </>
    );
}
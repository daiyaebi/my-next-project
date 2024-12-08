import { getNewsList } from "../_libs/microcms";
import NewsList from "../_components/NewsList/index";
export default async function Page(){
    const {contents: news} = await getNewsList();
    return <NewsList news={news}/>;
}
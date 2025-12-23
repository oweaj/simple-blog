import { bloglistApi } from "@/lib/api/blog";
import MainContent from "./blog/_components/MainContent";

type SearchParams = Promise<{ [key: string]: string | undefined }>;

const Home = async (props: { searchParams: SearchParams }) => {
  const searchParams = await props.searchParams;
  const category = searchParams.category ?? null;
  const page = Number(searchParams.page) || 1;
  const keyword = searchParams.keyword ?? null;

  const data = await bloglistApi(category, page, keyword);

  return (
    <MainContent
      initialData={data}
      category={category}
      page={page}
      keyword={keyword}
    />
  );
};

export default Home;

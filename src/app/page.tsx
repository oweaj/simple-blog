import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { blogListAction } from "./actions/blog";
import MainContent from "./blog/_components/MainContent";

type SearchParams = Promise<{ [key: string]: string | undefined }>;

const Home = async (props: { searchParams: SearchParams }) => {
  const searchParams = await props.searchParams;
  const queryClient = new QueryClient();
  const category = searchParams.category ?? null;
  const page = Number(searchParams.page) || 1;
  const keyword = searchParams.keyword ?? null;

  await queryClient.prefetchQuery({
    queryKey: ["blog_list", category, page, keyword],
    queryFn: () => blogListAction(category, page, keyword),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainContent category={category} page={page} keyword={keyword} />
    </HydrationBoundary>
  );
};

export default Home;

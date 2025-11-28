import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { Suspense } from "react";
import { blogListAction } from "./actions/blog";
import MainContent from "./blog/_components/MainContent";

const Home = async () => {
  const queryClient = new QueryClient();
  const category = null;
  const page = 1;
  const keyword = null;

  await queryClient.prefetchQuery({
    queryKey: ["blog_list", category, page, keyword],
    queryFn: () => blogListAction(category, page, keyword),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense
        fallback={
          <div className="h-full flex justify-center items-center">
            <LoaderCircle />
          </div>
        }
      >
        <MainContent category={category} page={page} keyword={keyword} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Home;

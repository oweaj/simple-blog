import { blogDetailApi } from "@/lib/api/blog";
import BlogDetail from "./_components/BlogDetail";

const BlogDetailPage = async ({
  params,
}: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const data = await blogDetailApi(id);

  return (
    <div className="max-w-screen-sm h-full py-6 mx-auto px-4">
      <BlogDetail initialData={data} id={id} />
    </div>
  );
};

export default BlogDetailPage;

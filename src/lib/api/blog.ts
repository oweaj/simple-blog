// 블로그 리스트
export const bloglistApi = async (
  category: string | null,
  page: number,
  keyword: string | null,
) => {
  const params = new URLSearchParams();

  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  if (keyword) params.set("keyword", keyword);

  const query = params.toString();
  const url = query ? `/api/blog/list?${query}` : "/api/blog/list";

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${url}`, {
    next: { tags: ["blog_list"] },
  });

  if (!res.ok) {
    throw new Error("블로그 리스트 조회 실패");
  }

  return res.json();
};

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
    cache: "force-cache",
    next: { tags: ["blog_list"] },
  });

  if (!res.ok) {
    throw new Error("블로그 리스트 조회 실패");
  }

  return res.json();
};

// 블로그 상세
export const blogDetailApi = async (id: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/blog/${id}`,
    {
      cache: "force-cache",
      next: { tags: ["blog_detail"] },
    },
  );

  if (!res.ok) {
    throw new Error("블로그 상세 조회 실패");
  }

  return res.json();
};

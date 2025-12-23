"use client";

import { useBlogList } from "@/app/hooks/blog/useBlog";
import type { IBlogDataType, IBlogListType } from "@/types/blog.type";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BlogCard from "./BlogCard";

interface IPageQueryType {
  initialData: IBlogListType;
  category: string | null;
  page: number;
  keyword: string | null;
  handleQueryChange: ({ newPage }: { newPage: number }) => void;
}

const BlogList = ({
  initialData,
  category,
  page,
  keyword,
  handleQueryChange,
}: IPageQueryType) => {
  const { data } = useBlogList({ initialData, category, page, keyword });

  if (!data) return null;

  const pageNumberList = Array.from(
    { length: data.totalPages },
    (_, i) => 1 + i,
  );

  const handleMovePage = (move: "prev" | "next") => {
    if (move === "prev" && page > 1) {
      handleQueryChange({ newPage: page - 1 });
    } else if (move === "next" && page < data.totalPages) {
      handleQueryChange({ newPage: page + 1 });
    }
  };

  return (
    <div>
      {!data.bloglist.length && (
        <div className="text-center text-gray-600 py-8">
          해당 카테고리의 데이터가 없습니다.
        </div>
      )}
      <ul className="space-y-8">
        {data.bloglist.map((item: IBlogDataType) => (
          <BlogCard key={item._id} item={item} />
        ))}
      </ul>
      {data.totalCount > 10 && (
        <ul className="flex items-center justify-center gap-4 mt-12">
          <li>
            <button
              type="button"
              className={`flex items-center ${page !== 1 && "cursor-pointer"}`}
              onClick={() => handleMovePage("prev")}
              disabled={page === 1}
              aria-label="이전 페이지"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
          </li>
          {pageNumberList.map((num) => (
            <li key={num}>
              <button
                type="button"
                onClick={() => handleQueryChange({ newPage: num })}
                className={`px-4 py-2 rounded cursor-pointer ${
                  num === page ? "bg-orange-500 text-white" : "bg-gray-200"
                }`}
              >
                {num}
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              className={`flex items-center ${page !== data.totalCount && "cursor-pointer"}`}
              onClick={() => handleMovePage("next")}
              disabled={page === data.totalCount}
              aria-label="다음 페이지"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default BlogList;

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { mockBlogLikeRankData } from "@/tests/mockData/mockBlogData";
import type { IBlogDataType } from "@/types/blog.type";
import LikeRankList from "./LikeRankList";

const mockBlogLikeRank = jest.fn();

jest.mock("@/app/hooks/blog/useBlog", () => ({
  useBlogLikeRank: () => mockBlogLikeRank(),
}));

jest.mock("@/app/blog/_components/BlogCard", () => ({
  __esModule: true,
  default: ({ item }: { item: any }) => <li>{item._id}</li>,
}));

describe("블로그 랭킹 컴포넌트", () => {
  it("공감 수에 따라 내림차순으로 데이터가 렌더링 된다.", () => {
    mockBlogLikeRank.mockReturnValue({
      data: mockBlogLikeRankData.sort(
        (a: IBlogDataType, b: IBlogDataType) => b.like_count - a.like_count,
      ),
    });
    render(<LikeRankList />);

    mockBlogLikeRankData.forEach((data: IBlogDataType) => {
      expect(screen.getByText(`${data._id}`)).toBeInTheDocument();
    });
  });
});

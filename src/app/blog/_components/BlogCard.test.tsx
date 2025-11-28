import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { mockBlogData } from "@/tests/mockData/mockBlogData";
import { useSession } from "next-auth/react";
import BlogCard from "./BlogCard";

const mockRouterPush = jest.fn();
const mockBlogDelete = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

jest.mock("@/app/hooks/blog/useBlog", () => ({
  useBlogDelete: () => ({
    mutate: mockBlogDelete,
  }),
}));

describe("blog card 컴포넌트", () => {
  it("해당 블로그 게시글이 작성자 본인이 아니면 모달 영역이 렌더링 되지않는다", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          _id: "another-id",
          email: "another-email",
          name: "another-name",
        },
      },
    });
    render(<BlogCard item={mockBlogData} />);

    expect(
      screen.queryByLabelText("블로그 옵션 트리거"),
    ).not.toBeInTheDocument();
  });

  it("해당 블로그 게시글이 작성자 본인이면 모달 영역이 렌더링된다.", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          _id: mockBlogData.user_id._id,
          email: mockBlogData.user_id.email,
          name: mockBlogData.user_id.name,
        },
      },
    });
    render(<BlogCard item={mockBlogData} />);

    screen.debug();
    expect(screen.getByLabelText("블로그 옵션 트리거")).toBeInTheDocument();
  });

  describe("모달 open 상태", () => {
    beforeEach(() => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            _id: mockBlogData.user_id._id,
            email: mockBlogData.user_id.email,
            name: mockBlogData.user_id.name,
          },
        },
      });
      render(<BlogCard item={mockBlogData} />);
      const trigger = screen.getByLabelText("블로그 옵션 트리거");
      expect(trigger).toBeInTheDocument();
      fireEvent.click(trigger);
    });

    it("모달 트리거를 클릭하면 모달이 열리고 해당 콘텐츠가 표시되어야 한다.", () => {
      expect(screen.getByText(mockBlogData.title)).toBeInTheDocument();
      expect(
        screen.getByText(mockBlogData.content as string),
      ).toBeInTheDocument();
    });

    it("모달 상단 X 아이콘을 클릭하면 모달이 닫혀야한다.", () => {
      const modalCloes = screen.getByTestId("modal-close");
      expect(modalCloes).toBeInTheDocument();

      fireEvent.click(modalCloes);
      expect(screen.queryByTestId("modal-close")).not.toBeInTheDocument();
    });

    it("모달 삭제 버튼 클릭 시 blogDelete가 실행되어야 한다.", () => {
      expect(screen.getByRole("button", { name: "삭제" })).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "삭제" }));

      expect(mockBlogDelete).toHaveBeenCalledWith(mockBlogData._id);
    });

    it("모달 수정 버튼 클릭 시 해당 블로그 수정 폼으로 이동되어야 한다.", () => {
      expect(screen.getByRole("button", { name: "수정" })).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "수정" }));

      expect(mockRouterPush).toHaveBeenCalledWith(
        `/blog/edit?id=${mockBlogData._id}`,
      );
    });
  });
});

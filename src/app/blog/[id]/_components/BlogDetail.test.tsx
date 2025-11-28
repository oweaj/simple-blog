import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { mockBlogData } from "@/tests/mockData/mockBlogData";
import BlogDetail from "./BlogDetail";

const mockBlogDetail = jest.fn();
const mockBlogDelete = jest.fn();
const mockBlogLike = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
  }),
}));

jest.mock("@/app/hooks/blog/useBlog", () => ({
  useBlogDetail: () => mockBlogDetail(),
  useBlogDelete: () => ({ mutate: mockBlogDelete }),
  useBlogLike: () => ({ mutate: mockBlogLike }),
}));

jest.mock("next/image", () => {
  return ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  );
});

describe("상세페이지 컴포넌트", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBlogDetail.mockReturnValue({ data: mockBlogData });
  });

  it("상세 데이터가 있을경우 해당 데이터를 렌더링한다", () => {
    render(<BlogDetail id={mockBlogData._id} />);

    expect(screen.getByText(mockBlogData.title)).toBeInTheDocument();
    expect(
      screen.getByText(mockBlogData.content as string),
    ).toBeInTheDocument();
    expect(screen.getByAltText("블로그 상세 이미지")).toBeInTheDocument();

    expect(screen.getByAltText("블로그 상세 이미지")).toHaveAttribute(
      "src",
      "/test-image.jpg",
    );
    expect(screen.getByText("2025.01.01")).toBeInTheDocument();
    expect(mockBlogDetail).toHaveBeenCalled();
  });

  it("상세 데이터가 없을경우 null을 반환한다.", () => {
    mockBlogDetail.mockReturnValue({ data: null });

    const { container } = render(<BlogDetail id={mockBlogData._id} />);
    expect(container.firstChild).toBeNull();
  });

  describe("블로그 공감 카운트", () => {
    it("블로그 작성자 본인이 아니여야 공감 카운트 버튼이 표시된다", () => {
      render(<BlogDetail id={mockBlogData._id} />);

      expect(mockBlogData.isWriter).toBe(false);
      expect(screen.getByTestId("liked-button")).toBeInTheDocument();
    });

    it("해당 블로그에 공감을 하지않는 상태라면 공감 카운트를 증가할 수 있다", () => {
      render(<BlogDetail id={mockBlogData._id} />);

      expect(mockBlogData.isLiked).toBe(false);
      expect(screen.getByTestId("liked-button")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("liked-button"));
      expect(mockBlogLike).toHaveBeenCalledTimes(1);
      expect(mockBlogLike).toHaveBeenCalledWith(mockBlogData._id);
    });

    it("해당 블로그에 이미 공감을 했다면 공감 카운트를 감소할 수 있다", () => {
      const mockUpdateData = { ...mockBlogData, isLiked: true };
      mockBlogDetail.mockReturnValue({ data: mockUpdateData });
      render(<BlogDetail id={mockBlogData._id} />);

      expect(mockUpdateData.isLiked).toBe(true);
      expect(screen.getByTestId("liked-button")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("liked-button"));
      expect(mockBlogLike).toHaveBeenCalledTimes(1);
      expect(mockBlogLike).toHaveBeenCalledWith(mockBlogData._id);
    });
  });

  describe("블로그 데이터 수정 권한", () => {
    it("블로그 작성자가 본인이면 상세페이지에 수정 및 삭제 권한이 있다", () => {
      const mockUpdateData = { ...mockBlogData, isWriter: true };
      mockBlogDetail.mockReturnValue({ data: mockUpdateData });
      render(<BlogDetail id={mockBlogData._id} />);

      expect(mockUpdateData.isWriter).toBe(true);
      expect(screen.getByText("수정")).toBeInTheDocument();
      expect(screen.getByText("수정").closest("a")).toHaveAttribute(
        "href",
        `/blog/edit?id=${mockBlogData._id}`,
      );

      const deleteButton = screen.getByRole("button", { name: "삭제" });
      expect(deleteButton).toBeInTheDocument();
      fireEvent.click(deleteButton);
      expect(mockBlogDelete).toHaveBeenCalledTimes(1);
      expect(mockBlogDelete).toHaveBeenCalledWith(mockBlogData._id);
    });

    it("해당 블로그 데이터 작성자가 아니면 수정 및 삭제할 권한이 없다", () => {
      render(<BlogDetail id={mockBlogData._id} />);

      expect(mockBlogData.isWriter).toBe(false);
      expect(screen.queryByText("수정")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "삭제" }),
      ).not.toBeInTheDocument();
    });
  });
});

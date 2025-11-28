import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { mockBlogData } from "@/tests/mockData/mockBlogData";
import { useNavigationGuard } from "next-navigation-guard";
import BlogForm from "./BlogForm";

const mockBlogCreate = jest.fn();
const mockBlogUpdate = jest.fn();
const mockBlogImageUpload = jest.fn();
window.confirm = jest.fn();

jest.mock("next-navigation-guard");

jest.mock("@/lib/api/image", () => ({
  uploadImageApi: () => mockBlogImageUpload(),
}));

jest.mock("@/app/hooks/blog/useBlog", () => ({
  useBlogCreate: () => ({ mutate: mockBlogCreate }),
  useBlogUpdate: () => ({ mutate: mockBlogUpdate }),
}));

describe("blogform 컴포넌트", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("블로그 form 항목들이 렌더링 되어야한다.", () => {
    render(<BlogForm editMode={false} />);

    expect(screen.getByRole("textbox", { name: /타이틀/ }));
    expect(screen.getByTestId("main-image-upload")).toBeInTheDocument();
    expect(screen.getByTestId("sub-image-upload")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /내용/ }));
  });

  it("수정폼(editmode)일경우 기존 데이터가 렌더링되어야한다.", () => {
    render(
      <BlogForm
        editMode
        defaultData={mockBlogData}
        id={`${mockBlogData._id}`}
      />,
    );

    expect(screen.getByRole("textbox", { name: /타이틀/ })).toHaveValue(
      mockBlogData.title,
    );
    expect(screen.getByAltText("main 이미지")).toBeInTheDocument();
    expect(
      within(screen.getByRole("combobox")).getByText("일상생활"),
    ).toBeInTheDocument();
    expect(screen.getByText(mockBlogData.content)).toBeInTheDocument();
  });

  it("form에 데이터가 입력이 되어있을 경우에 네비게이션 가드가 활성화되면 comfirm 메세지 창이 표시된다.", () => {
    render(
      <BlogForm
        editMode
        defaultData={mockBlogData}
        id={`${mockBlogData._id}`}
      />,
    );

    expect(useNavigationGuard).toHaveBeenCalledWith({
      enabled: true,
      confirm: expect.any(Function),
    });

    const mockUseNavigationGuard = useNavigationGuard as jest.MockedFunction<
      typeof useNavigationGuard
    >;

    const navigationGuardCall = mockUseNavigationGuard.mock.calls[0]?.[0];
    const confirmFunction = navigationGuardCall.confirm;

    if (confirmFunction) {
      confirmFunction({} as any);
      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining("작성중인 내용이 삭제됩니다."),
      );
    }
  });

  it("form 제출버튼을 클릭하면 submit이 실행된다.", async () => {
    render(<BlogForm editMode={false} />);

    expect(screen.getByRole("button", { name: "제출" })).toBeInTheDocument();

    // 타이틀
    fireEvent.change(screen.getByRole("textbox", { name: /타이틀/ }), {
      target: { value: mockBlogData.title },
    });

    // 이미지 업로드
    mockBlogImageUpload.mockResolvedValue(mockBlogData.main_image);

    const file = new File(["test-image"], mockBlogData.main_image, {
      type: "image/jpeg",
    });

    fireEvent.click(screen.getByTestId("main-image-upload"));
    fireEvent.change(screen.getByTestId("main-image-upload"), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(mockBlogImageUpload).toHaveBeenCalledTimes(1);
    });

    // 카테고리 선택
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "일상생활" }));

    // 콘텐츠
    fireEvent.change(screen.getByRole("textbox", { name: /내용/ }), {
      target: { value: mockBlogData.content },
    });

    fireEvent.click(screen.getByRole("button", { name: "제출" }));

    await waitFor(() => {
      expect(mockBlogCreate).toHaveBeenCalledTimes(1);
      expect(mockBlogCreate).toHaveBeenCalledWith({
        title: mockBlogData.title,
        main_image: mockBlogData.main_image,
        sub_image: null,
        category_id: mockBlogData.category_id,
        content: mockBlogData.content,
      });
    });
  });
});

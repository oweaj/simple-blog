import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { mockBlogData } from "@/tests/mockData/mockBlogData";
import { mockNoticeData } from "@/tests/mockData/mockBlogData";
import NoticeForm from "./NoticeForm";

const mockRouterPush = jest.fn();
const mockNoticeCreate = jest.fn();
const mockNoticeUpdate = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

jest.mock("@/app/hooks/my/useMy", () => ({
  useNoticeCreate: () => ({ mutate: mockNoticeCreate }),
  useNoticeUpdate: () => ({ mutate: mockNoticeUpdate }),
}));

describe("마이페이지 notice 컴포넌트", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("마이페이지 notice 폼 기본 항목들이 렌더링 되어야한다.", () => {
    render(<NoticeForm editMode={false} />);

    expect(screen.getByRole("textbox", { name: /타이틀/ }));
    expect(screen.getByRole("textbox", { name: /내용/ }));
    expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "등록" })).toBeInTheDocument();
  });

  it("수정폼(editmode)일경우 기존 데이터가 렌더링되어야한다.", () => {
    render(
      <NoticeForm
        editMode
        defaultData={mockNoticeData}
        id={`${mockBlogData._id}`}
      />,
    );

    expect(screen.getByRole("textbox", { name: /타이틀/ })).toHaveValue(
      mockNoticeData.title,
    );
    expect(screen.getByText(mockNoticeData.content)).toBeInTheDocument();
  });

  describe("notice form 버튼", () => {
    beforeEach(() => {
      render(<NoticeForm editMode={false} />);
    });

    it("form 등록 버튼을 클릭하면 공지사항 등록이 완료된다.", async () => {
      fireEvent.change(screen.getByRole("textbox", { name: /타이틀/ }), {
        target: { value: mockNoticeData.title },
      });

      fireEvent.change(screen.getByRole("textbox", { name: /내용/ }), {
        target: { value: mockNoticeData.content },
      });

      expect(screen.getByRole("button", { name: "등록" })).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "등록" }));

      await waitFor(() => {
        expect(mockNoticeCreate).toHaveBeenCalledTimes(1);
        expect(mockNoticeCreate).toHaveBeenCalledWith({
          title: mockNoticeData.title,
          content: mockNoticeData.content,
        });
      });
    });

    it("form 취소 버튼을 클릭하면 공지사항 페이지로 이동된다.", () => {
      expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "취소" }));

      expect(mockRouterPush).toHaveBeenCalledWith("/my/notice");
    });
  });
});

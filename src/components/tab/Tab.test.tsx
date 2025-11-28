import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { mockBlogData } from "@/tests/mockData/mockBlogData";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Tab from "./Tab";

interface ITabProps {
  item?: { id: number; name: string; value: string };
  category?: string | null;
  handleQueryChange?: ({ newCategory }: { newCategory: string | null }) => void;
}

const queryClient = new QueryClient();
const mockHandleQueryChange = jest.fn();
const mockBlogListAction = jest.fn();

jest.mock("@/app/actions/blog", () => ({
  blogListAction: () => mockBlogListAction(),
}));

describe("tab 컴포넌트", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const MockTabWrap = ({
    item = { id: 1, name: "일상생활", value: "daily_life" },
    category = mockBlogData.category_id,
    handleQueryChange = mockHandleQueryChange,
  }: ITabProps) => (
    <QueryClientProvider client={queryClient}>
      <Tab
        item={item}
        category={category}
        handleQueryChange={handleQueryChange}
      />
    </QueryClientProvider>
  );

  it("카테고리 데이터를 props로 받으면 해당 카테고리 정보가 렌더링 되어야한다.", () => {
    render(<MockTabWrap />);
    expect(
      screen.getByRole("button", { name: "일상생활" }),
    ).toBeInTheDocument();
  });

  it("카테고리 클릭 시 상태가 selected로 변경된다.", () => {
    render(<MockTabWrap />);

    fireEvent.click(screen.getByRole("button", { name: "일상생활" }));
    expect(screen.getByTestId("daily_life-selected")).toBeInTheDocument();
  });

  it("카테고리가 기본인 전체일경우 전체 데이터를 조회한다.", () => {
    const item = { id: 0, name: "전체", value: "all" };
    render(<MockTabWrap item={item} category={null} />);

    fireEvent.click(screen.getByRole("button", { name: item.name }));
    expect(mockHandleQueryChange).toHaveBeenCalledTimes(1);
    expect(mockHandleQueryChange).toHaveBeenCalledWith({ newCategory: null });
  });

  it("카테고리 클릭 시 해당 카테고리의 데이터를 조회한다.", () => {
    const item = { id: 1, name: "일상생활", value: "daily_life" };
    render(<MockTabWrap item={item} />);

    fireEvent.click(screen.getByRole("button", { name: item.name }));
    expect(mockHandleQueryChange).toHaveBeenCalledTimes(1);
    expect(mockHandleQueryChange).toHaveBeenCalledWith({
      newCategory: item.value,
    });
  });
});

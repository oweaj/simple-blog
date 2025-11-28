import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Form } from "@/components/ui/form";
import { BlogCreateSchema } from "@/schemas/blog.schema";
import { mockBlogData } from "@/tests/mockData/mockBlogData";
import type { IBlogFormDataType } from "@/types/blog.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import BlogImageUpload from "./ImageUpload";

const mockOnChange = jest.fn();
const mockBlogImageUpload = jest.fn();

jest.mock("@/lib/api/image", () => ({
  uploadImageApi: () => mockBlogImageUpload(),
}));

const MockImageUploadComponent = ({ tag }: { tag: "main" | "sub" }) => {
  const mockForm = useForm<IBlogFormDataType>({
    defaultValues: {
      category_id: mockBlogData.category_id,
      title: mockBlogData.title,
      content: mockBlogData.content,
      main_image: mockBlogData.main_image,
      sub_image: mockBlogData.sub_image,
    },
    resolver: zodResolver(BlogCreateSchema),
  });

  const currentTag = tag === "main" ? "main_image" : "sub_image";

  const field = {
    value: "",
    onChange: (value: string | null) => {
      mockOnChange(value);
      mockForm.setValue(currentTag, value || "");
    },
  };

  return (
    <Form {...mockForm}>
      <form onSubmit={mockForm.handleSubmit(() => {})}>
        <BlogImageUpload form={mockForm} field={field} tag={tag} />
      </form>
    </Form>
  );
};

describe("이미지 업로드 컴포넌트", () => {
  it("이미지 영역의 input file 영역이 렌더링 되어야한다.", () => {
    render(<MockImageUploadComponent tag="main" />);

    const input = screen.getByTestId("main-image-upload") as HTMLInputElement;

    expect(input).toBeInTheDocument();
    expect(input.files?.length).toBe(0);
  });

  it("tag가 main이라면 이미지 이름은 대표사진이여야 한다.", () => {
    render(<MockImageUploadComponent tag="main" />);

    expect(screen.getByText("대표사진")).toBeInTheDocument();
  });

  it("tag가 sub라면 이미지 이름은 서브여야 한다.", () => {
    render(<MockImageUploadComponent tag="sub" />);

    expect(screen.getByText("서브")).toBeInTheDocument();
    expect(screen.queryByText("대표사진")).not.toBeInTheDocument();
  });

  it("이미지 업로드 input file을 클릭하면 이미지 업로드가 호출되어야한다.", async () => {
    render(<MockImageUploadComponent tag="main" />);

    expect(screen.getByText("대표사진")).toBeInTheDocument();

    const file = new File(["test-image"], mockBlogData.main_image, {
      type: "image/jpeg",
    });

    const mockImageUrl = mockBlogData.main_image;
    mockBlogImageUpload.mockResolvedValue(mockImageUrl);

    fireEvent.click(screen.getByTestId("main-image-upload"));
    fireEvent.change(screen.getByTestId("main-image-upload"), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(mockBlogImageUpload).toHaveBeenCalledTimes(1);
    });

    expect(
      screen.getByRole("img", { name: "main 이미지" }),
    ).toBeInTheDocument();
  });
});

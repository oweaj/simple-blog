import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { mockBlogData } from "@/tests/mockData/mockBlogData";
import { useSession } from "next-auth/react";
import MyProfileImage from "./MyProfileImage";

const mockProfileImageUpload = jest.fn();
const mockProfileImageDelete = jest.fn();

jest.mock("@/lib/api/image", () => ({
  uploadImageApi: () => mockProfileImageUpload(),
  deleteImageApi: () => mockProfileImageDelete(),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

jest.mock("@/assets/images/default-profile.svg", () => () => (
  <svg data-testid="default-profile" />
));

describe("마이페이지 프로필 이미지 업로드 컴포넌트", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          _id: mockBlogData.user_id._id,
          email: mockBlogData.user_id.email,
          name: mockBlogData.user_id.name,
        },
      },
    });
  });

  it("이미지 영역의 input file 영역과 기본 버튼이 있어야한다.", () => {
    render(<MyProfileImage />);

    const input = screen.getByTestId(
      "profile-image-upload",
    ) as HTMLInputElement;

    expect(input).toBeInTheDocument();
    expect(input.files?.length).toBe(0);
    expect(
      screen.getByRole("button", { name: "이미지 변경" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "삭제" })).toBeInTheDocument();
  });

  it("이미지 업로드 input 영역을 클릭하면 이미지 업로드가 호출되어야한다.", async () => {
    render(<MyProfileImage />);
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { profile_image: null } },
    });

    const file = new File(["test-image"], "/test-image.jpg", {
      type: "image/jpeg",
    });
    mockProfileImageUpload.mockResolvedValue("/test-image.jpg");

    fireEvent.click(screen.getByRole("button", { name: "이미지 변경" }));
    fireEvent.change(screen.getByTestId("profile-image-upload"), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(mockProfileImageUpload).toHaveBeenCalledTimes(1);
    });

    (useSession as jest.Mock).mockReturnValue({
      data: { user: { profile_image: "/test-image.jpg" } },
    });
    render(<MyProfileImage />);

    expect(
      screen.getByRole("img", { name: "프로필 이미지" }),
    ).toBeInTheDocument();
  });

  it("삭제 버튼을 클릭하면 이미지 삭제가 호출되어야한다.", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { profile_image: "/test-image.jpg" } },
    });
    render(<MyProfileImage />);

    expect(
      screen.getByRole("img", { name: "프로필 이미지" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "삭제" }));

    expect(mockProfileImageDelete).toHaveBeenCalledTimes(1);

    (useSession as jest.Mock).mockReturnValue({
      data: { user: { profile_image: null } },
    });
    render(<MyProfileImage />);

    expect(screen.getByTestId("default-profile")).toBeInTheDocument();
  });
});

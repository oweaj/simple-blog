import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { signupAction } from "@/app/actions/auth";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthForm from "./AuthForm";

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/app/actions/auth", () => ({
  signupAction: jest.fn(),
}));

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

describe("로그인 및 회원가입 공통 인증 form 컴포넌트", () => {
  it("회원가입 폼 제출 시 회원가입 실패", async () => {
    render(<AuthForm submit="signup" />);

    expect(
      screen.getByRole("button", { name: "회원가입" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "회원가입" }));

    expect(
      await screen.findByText("닉네임은 최소 2자 이상입니다."),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("이메일 형식으로 입력해주세요."),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("비밀번호를 다시 확인해주세요."),
    ).toBeInTheDocument();
  });

  it("로그인 폼 제출 시 로그인 실패", async () => {
    render(<AuthForm submit="signin" />);

    expect(screen.getByRole("button", { name: "로그인" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "로그인" }));

    expect(
      await screen.findByText("이메일 형식으로 입력해주세요."),
    ).toBeInTheDocument();
  });

  it("회원가입 폼 제출 시 회원가입 성공", async () => {
    (signupAction as jest.Mock).mockResolvedValue({
      state: true,
      message: "회원가입이 완료되었습니다.",
    });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    render(<AuthForm submit="signup" />);

    fireEvent.change(screen.getByLabelText("닉네임"), {
      target: { value: "테스트" },
    });
    fireEvent.change(screen.getByLabelText("이메일"), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByLabelText("비밀번호"), {
      target: { value: "test1234" },
    });
    fireEvent.change(screen.getByLabelText("비밀번호 확인"), {
      target: { value: "test1234" },
    });

    fireEvent.click(screen.getByRole("button", { name: "회원가입" }));

    await waitFor(() => {
      expect(signupAction).toHaveBeenCalledWith({
        name: "테스트",
        email: "test@test.com",
        password: "test1234",
        passwordConfirm: "test1234",
      });
      expect(mockPush).toHaveBeenCalledWith("/auth/signin");
    });
  });

  it("로그인 폼 제출 시 로그인 성공", async () => {
    (signIn as jest.Mock).mockResolvedValue({ ok: true });
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
    render(<AuthForm submit="signin" />);

    fireEvent.change(screen.getByLabelText("이메일"), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByLabelText("비밀번호"), {
      target: { value: "test1234" },
    });

    fireEvent.click(screen.getByRole("button", { name: "로그인" }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "test@test.com",
        password: "test1234",
        redirect: false,
      });
    });
    expect(mockReplace).toHaveBeenCalledWith("/");
  });
});

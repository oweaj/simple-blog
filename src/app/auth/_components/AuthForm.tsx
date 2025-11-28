"use client";

import { signupAction } from "@/app/actions/auth";
import FormFieldWrapper from "@/components/form/FormFieldWrapper";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { signinSchema, signupSchema } from "@/schemas/auth.schema";
import type { IAuthFormType } from "@/types/auth.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

const AuthForm = ({ submit }: { submit: string }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<IAuthFormType>({
    defaultValues: { email: "", password: "", name: "", passwordConfirm: "" },
    resolver: zodResolver(submit === "signin" ? signinSchema : signupSchema),
  });

  const onSubmit = async (data: IAuthFormType) => {
    startTransition(async () => {
      if (submit === "signin") {
        const signin = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (signin?.ok) {
          router.replace("/");
        } else {
          alert("이메일과 비밀번호를 다시 확인해주세요.");
        }
      } else {
        const signup = await signupAction(data);

        if (signup.state) {
          router.push("/auth/signin");
        } else {
          alert(signup.message);
        }
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="relative w-full h-full space-y-10"
      >
        {submit === "signup" && (
          <FormFieldWrapper
            control={form.control}
            name="name"
            label="닉네임"
            placeholder="사용할 닉네임을 입력해주세요."
          />
        )}
        <FormFieldWrapper
          control={form.control}
          name="email"
          label="이메일"
          placeholder="이메일을 입력해주세요."
        />
        <FormFieldWrapper
          control={form.control}
          name="password"
          label="비밀번호"
          inputType="password"
          placeholder="비밀번호를 입력해주세요."
        />
        {submit === "signup" && (
          <FormFieldWrapper
            control={form.control}
            name="passwordConfirm"
            label="비밀번호 확인"
            inputType="password"
            placeholder="비밀번호를 다시 입력해주세요."
          />
        )}
        <div className="w-full h-12 space-y-4">
          <Button
            type="submit"
            className={cn("w-full h-full text-base font-bold bg-gray-400")}
            disabled={isPending}
          >
            {isPending ? (
              <LoaderCircle className="size-7 animate-spin" />
            ) : submit === "signin" ? (
              "로그인"
            ) : (
              "회원가입"
            )}
          </Button>
          {submit === "signin" && (
            <Button
              type="button"
              className={cn("w-full h-full text-base font-bold bg-gray-400")}
              onClick={() => router.push("/auth/signup")}
              disabled={isPending}
            >
              회원가입
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default AuthForm;

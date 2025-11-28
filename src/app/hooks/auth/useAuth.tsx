import { deleteUserAction, profileUpdateAction } from "@/app/actions/auth";
import { deleteImageApi, uploadImageApi } from "@/lib/api/image";
import type { IMyProfileDataType } from "@/types/mypage.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { UseFormReset } from "react-hook-form";

// 프로필 수정
export const useUserUpdate = (reset: UseFormReset<IMyProfileDataType>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileUpdateAction,
    onSuccess: (data, newData) => {
      alert(data.message);
      reset(newData);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => alert(error.message),
  });
};

// 프로필 이미지 업로드
export const useImageUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadImageApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => alert(error.message),
  });
};

// 유저 프로필 이미지 삭제
export const useImageDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteImageApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => alert(error.message),
  });
};

// 회원탈퇴
export const useUserDelete = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: deleteUserAction,
    onSuccess: () => {
      router.replace("/auth/signin");
      queryClient.removeQueries({ queryKey: ["user"] });
    },
    onError: (error) => alert(error.message),
  });
};

import {
  blogCreateAction,
  blogDeleteAction,
  blogDetailAction,
  blogLikeAction,
  blogLikeRankAction,
  blogListAction,
  blogUpdateAction,
} from "@/app/actions/blog";
import type { IBlogDataType, IBlogListType } from "@/types/blog.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

// 블로그 리스트
export const useBlogList = ({
  initialData,
  category,
  page,
  keyword,
}: {
  initialData: IBlogListType;
  category: string | null;
  page: number;
  keyword?: string | null;
}) => {
  return useQuery<IBlogListType>({
    queryKey: ["blog_list", category, page, keyword],
    queryFn: () => blogListAction(category, page, keyword),
    placeholderData: initialData,
    staleTime: 0,
  });
};

// 블로그 생성
export const useBlogCreate = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: blogCreateAction,
    onSuccess: (data) => {
      alert(data.message);
      router.replace("/");
      queryClient.invalidateQueries({ queryKey: ["blog_list"] });
    },
    onError: (error) => alert(error.message),
  });
};

// 블로그 수정
export const useBlogUpdate = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: blogUpdateAction,
    onSuccess: ({ message, id }) => {
      alert(message);
      router.replace(`/blog/${id}`);
      queryClient.invalidateQueries({ queryKey: ["blog_list"] });
      queryClient.invalidateQueries({ queryKey: ["blogDetail", id] });
    },
    onError: (error: Error) => alert(error.message),
  });
};

// 블로그 삭제
export const useBlogDelete = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: blogDeleteAction,
    onSuccess: ({ message }) => {
      alert(message);
      router.push("/");
      queryClient.invalidateQueries({ queryKey: ["blog_list"] });
    },
    onError: (error) => alert(error.message),
  });
};

// 블로그 상세
export const useBlogDetail = ({ id }: { id: string }) => {
  return useQuery<IBlogDataType>({
    queryKey: ["blogDetail", id],
    queryFn: () => blogDetailAction(id),
  });
};

// 블로그 공감 랭킹 리스트
export const useBlogLikeRank = () => {
  return useQuery<IBlogDataType[]>({
    queryKey: ["blog_rank"],
    queryFn: blogLikeRankAction,
  });
};

// 블로그 공감
export const useBlogLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: blogLikeAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog_list"] });
      queryClient.invalidateQueries({ queryKey: ["blogDetail"] });
      queryClient.invalidateQueries({ queryKey: ["blog_rank"] });
      queryClient.invalidateQueries({ queryKey: ["myLikeBlogs"] });
    },
    onError: (error) => alert(error.message),
  });
};

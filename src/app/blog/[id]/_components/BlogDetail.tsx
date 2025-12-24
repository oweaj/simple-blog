"use client";

import {
  useBlogDelete,
  useBlogDetail,
  useBlogLike,
} from "@/app/hooks/blog/useBlog";
import PageTitle from "@/components/common/PageTitle";
import type { IBlogDataType } from "@/types/blog.type";
import { dateFormat } from "@/utils/dateFormat";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BlogDetail = ({
  initialData,
  id,
}: { initialData: IBlogDataType; id: string }) => {
  const { data } = useBlogDetail({ initialData, id });
  const { mutate: queryBlogDelete } = useBlogDelete();
  const { mutate: queryBlogLike } = useBlogLike();
  const router = useRouter();

  if (!data) return null;

  const handleBlogLike = () => {
    if (data.isWriter === null) {
      router.push("/auth/signin");
    } else {
      queryBlogLike(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-xl border-b-1 pb-4">
        <PageTitle title={data.title} />
      </div>
      <div className="flex flex-col gap-6 text-gray-600 font-medium">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden mx-auto">
          <Image
            src={data.main_image}
            width={300}
            height={300}
            className="w-full h-full object-cover"
            alt="블로그 상세 이미지"
            priority
          />
        </div>
        <div className="flex items-center justify-between text-gray-700 font-medium border-b py-1">
          <div className="flex [&>*:not(:last-child)]:after:content-['·'] [&>*:not(:last-child)]:after:mx-2">
            <p className="font-semibold">{data.user_id.name}</p>
            <p>{dateFormat(data.createdAt)}</p>
          </div>
          {data.isWriter ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/blog/edit?id=${id}`}
                className="cursor-pointer hover:text-black"
              >
                수정
              </Link>
              <button
                type="button"
                className="cursor-pointer hover:text-black"
                onClick={() => queryBlogDelete(id)}
              >
                삭제
              </button>
            </div>
          ) : (
            <div className="flex gap-1">
              <button
                type="button"
                data-testid="liked-button"
                onClick={handleBlogLike}
              >
                <Star
                  className={`w-[22px] h-[22px] stroke-[1.5] cursor-pointer hover:stroke-yellow-400 ${
                    data.isLiked
                      ? "fill-yellow-400 stroke-yellow-400"
                      : "stroke-gray-500"
                  }
                  `}
                />
              </button>
              {data.like_count}
            </div>
          )}
        </div>
        <div className="text-gray-600 line-clamp-4 overflow-hidden break-words">
          {data.content}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;

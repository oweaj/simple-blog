"use server";

import { authOptions } from "@/auth";
import connectDB from "@/lib/database/db";
import { Blog } from "@/lib/schemas/blog-schema";
import type { IBlogFormDataType } from "@/types/blog.type";
import type { Types } from "mongoose";
import { getServerSession } from "next-auth";
import { revalidateTag } from "next/cache";
import { requireSession } from "./requireSession";

// 블로그 리스트
export const blogListAction = async (
  category: string | null,
  page: number,
  keyword?: string | null,
) => {
  await connectDB();

  const limit = 10;
  const skip = (page - 1) * limit;
  const filterData: Record<string, any> = { deleted_at: null };

  if (category) {
    filterData.category_id = category;
  }

  if (keyword) {
    filterData.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { content: { $regex: keyword, $options: "i" } },
    ];
  }

  const data = await Blog.find(filterData)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("user_id", "email name profile_image");

  const totalCount = await Blog.countDocuments(filterData);
  const bloglist = JSON.parse(JSON.stringify(data));

  return {
    bloglist,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(totalCount / limit)),
    totalCount,
  };
};

// 블로그 생성
export const blogCreateAction = async (data: IBlogFormDataType) => {
  await connectDB();

  const user = await requireSession();
  const { title, main_image, category_id, content } = data;

  if (!title || !main_image || !category_id || !content) {
    throw new Error("필수 항목을 모두 입력해주세요.");
  }

  const blog = new Blog({
    ...data,
    user_id: user._id,
  });

  await blog.save();

  revalidateTag("blog_list");
  return { state: true, message: "블로그 등록이 되었습니다." };
};

// 블로그 수정
export const blogUpdateAction = async ({
  id,
  data,
}: { id: string; data: IBlogFormDataType }) => {
  await connectDB();

  const user = await requireSession();
  const { title, main_image, sub_image, category_id, content } = data;
  const blogData = await Blog.findById(id);

  if (!blogData) {
    throw new Error("존재하지 않는 블로그입니다.");
  }

  if (blogData.user_id.toString() !== user._id.toString()) {
    throw new Error("블로그 수정 권한이 없습니다.");
  }

  const updateBlogData = {
    title: title ?? blogData.title,
    main_image: main_image ?? blogData.main_image,
    sub_image: sub_image ?? blogData.sub_image,
    category_id: category_id ?? blogData.category_id,
    content: content ?? blogData.content,
  };

  await Blog.findOneAndUpdate(
    { _id: id, user_id: user._id },
    { $set: updateBlogData },
    { new: true },
  );

  revalidateTag("blog_list");
  revalidateTag("blog_detail");
  return { state: true, message: "블로그 수정이 완료되었습니다.", id };
};

// 블로그 삭제
export const blogDeleteAction = async (id: string) => {
  await connectDB();

  const user = await requireSession();
  const blog = await Blog.findById(id);

  if (!blog) {
    throw new Error("존재하지 않는 블로그입니다.");
  }

  if (blog.user_id.toString() !== user._id.toString()) {
    throw new Error("블로그 삭제 권한이 없습니다.");
  }

  blog.deleted_at = new Date();
  await blog.save();

  revalidateTag("blog_list");
  return { state: true, message: "블로그가 삭제 되었습니다." };
};

// 블로그 상세 리스트
export const blogDetailAction = async (id: string) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?._id ?? null;

  await connectDB();

  const data = await Blog.findById(id).populate("user_id", "email name").lean();

  if (!data) {
    throw new Error("해당 블로그를 찾을 수 없습니다.");
  }

  const blogDetail = JSON.parse(JSON.stringify(data));
  const isWriter = userId
    ? userId === blogDetail.user_id?._id?.toString()
    : null;
  const isLiked = userId
    ? blogDetail.like_user.some((id: string) => id.toString() === userId)
    : false;

  return { ...blogDetail, isWriter, isLiked };
};

// 블로그 공감 랭킹 리스트
export const blogLikeRankAction = async () => {
  await connectDB();

  const data = await Blog.find({
    deleted_at: null,
    like_count: { $gt: 0 },
  })
    .sort({ like_count: -1, createdAt: -1 })
    .populate("user_id", "email name profile_image")
    .limit(10)
    .lean();

  const blogRank = JSON.parse(JSON.stringify(data));
  return blogRank;
};

// 블로그 공감
export const blogLikeAction = async (id: string) => {
  await connectDB();

  const session = await getServerSession(authOptions);
  const user_id = session?.user?._id ?? null;
  const checkBlog = await Blog.findById(id);

  if (!checkBlog) {
    throw new Error("존재하지 않는 블로그입니다.");
  }

  const checkUserLike = checkBlog.like_user.some((user: Types.ObjectId) =>
    user.equals(user_id),
  );

  const updateBlogData = checkUserLike
    ? { $pull: { like_user: user_id }, $inc: { like_count: -1 } }
    : { $addToSet: { like_user: user_id }, $inc: { like_count: 1 } };

  await Blog.findOneAndUpdate({ _id: id }, updateBlogData, { new: true });

  return {
    state: true,
    message: checkUserLike
      ? "좋아요가 취소되었습니다."
      : "좋아요가 등록되었습니다.",
  };
};

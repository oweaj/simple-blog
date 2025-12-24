import { authOptions } from "@/auth";
import connectDB from "@/lib/database/db";
import { Blog } from "@/lib/schemas/blog-schema";
import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?._id ?? null;

  await connectDB();

  const data = await Blog.findById(id).populate("user_id", "email name").lean();

  if (!data) {
    return NextResponse.json(
      { message: "해당 블로그를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const blogDetail = JSON.parse(JSON.stringify(data));

  const isWriter = userId
    ? userId === blogDetail.user_id?._id?.toString()
    : null;

  const isLiked = userId
    ? blogDetail.like_user.some((id: string) => id.toString() === userId)
    : false;

  return NextResponse.json({
    ...blogDetail,
    isWriter,
    isLiked,
  });
}

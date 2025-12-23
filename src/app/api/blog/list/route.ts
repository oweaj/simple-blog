import connectDB from "@/lib/database/db";
import { Blog } from "@/lib/schemas/blog-schema";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await connectDB();

  const { searchParams } = new URL(req.url);

  const category = searchParams.get("category");
  const page = Number(searchParams.get("page") ?? 1);
  const keyword = searchParams.get("keyword");

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

  return NextResponse.json({
    bloglist: JSON.parse(JSON.stringify(data)),
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(totalCount / limit)),
    totalCount,
  });
}

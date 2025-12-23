import mongoose from "mongoose";
import { Auth } from "../schemas/auth-schema";
import { Blog } from "../schemas/blog-schema";
import { Notice } from "../schemas/notice-schema";

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(process.env.MONGODB_URL as string);
    console.log("mongoDB 연결 성공");

    mongoose.models.Auth || mongoose.model("Auth", Auth.schema);
    mongoose.models.Blog || mongoose.model("Blog", Blog.schema);
    mongoose.models.Blog || mongoose.model("Notice", Notice.schema);
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;

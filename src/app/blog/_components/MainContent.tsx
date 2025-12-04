"use client";

import BlogCreate from "@/assets/icons/icon_create.svg";
import BottomNavbar from "@/components/home/BottomNavbar";
import Header from "@/components/home/Header";
import SearchBar from "@/components/home/SearchBar";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BlogCategory from "./BlogCategory";
import BlogList from "./BlogList";

export interface IMainProps {
  category: string | null;
  page: number;
  keyword: string | null;
}

const MainContent = ({ category, page, keyword }: IMainProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState({ category, page, keyword });

  const handleQueryChange = async ({
    newCategory,
    newPage,
    newKeyword,
  }: {
    newCategory?: string | null;
    newPage?: number;
    newKeyword?: string | null;
  }) => {
    const update = { ...filter };

    const params = new URLSearchParams();

    if (newCategory) {
      update.category = newCategory;
      update.keyword = null;
      params.set("category", newCategory);
      params.set("page", "1");
      params.delete("keyword");
    } else {
      update.category = null;
      update.keyword = null;
      params.delete("category");
      params.delete("keyword");
    }

    if (newPage) {
      params.set("page", newPage.toString());
    }

    if (newKeyword) {
      update.keyword = newKeyword;
      update.category = null;
      params.set("keyword", newKeyword);
      params.set("page", "1");
      params.delete("category");
    }

    setFilter(update);

    router.push(`/?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleQueryReset = () => {
    setFilter(() => ({ category: null, page: 1, keyword: null }));
    router.push("/");
  };

  return (
    <>
      <Header handleQueryReset={handleQueryReset} />
      <div className="relative p-4 max-w-screen-xl h-auto mx-auto pb-24">
        <main>
          <div className="space-y-7">
            <div className="flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-4">
              <BlogCategory
                category={filter.category}
                handleQueryChange={handleQueryChange}
              />
              <SearchBar
                keyword={filter.keyword}
                handleQueryChange={handleQueryChange}
              />
            </div>
            <BlogList
              category={filter.category}
              page={filter.page}
              keyword={filter.keyword}
              handleQueryChange={handleQueryChange}
            />
          </div>
        </main>
      </div>
      {session?.user._id && (
        <Link
          href={"/blog/create"}
          className="fixed bottom-20 right-4 flex items-center justify-center w-16 h-16 rounded-full bg-orange-400 hover:scale-105 hover:bg-black transition-all duration-300"
        >
          <BlogCreate className="w-8 h-8" />
        </Link>
      )}
      <BottomNavbar />
    </>
  );
};

export default MainContent;

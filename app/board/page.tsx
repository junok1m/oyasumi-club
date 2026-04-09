import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";

type BoardPost = {
  id: number;
  title: string;
  category: string;
  views: number;
  created_at: string;
  slug: string | null;
};

async function getPosts(sort: string, category: string, page: number) {
  const pageSize = 10;
  const safePage = Number.isNaN(page) || page < 1 ? 1 : page;

  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await supabaseServer();

  let query = supabase
  .from("board_posts")
  .select("*", { count: "exact" })
  .eq("status", "approved");
  if (category !== "all") {
    query = query.eq("category", category);
  }

  if (sort === "views") {
    query = query.order("views", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error || !data) {
    console.error("getPosts error:", error);
    return {
      results: [] as (BoardPost & { pretty_slug: string })[],
      page: 1,
      total_pages: 1,
    };
  }

  const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize));

  const results = data.map((post: BoardPost) => ({
    ...post,
    pretty_slug: post.slug ? `${post.id}-${post.slug}` : `${post.id}`,
  }));

  return {
    results,
    page: safePage,
    total_pages: totalPages,
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    sort?: string;
    category?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;

  const sort = params.sort === "views" ? "views" : "latest";
  const category = params.category || "all";
  const page = Number(params.page || "1");

  const data = await getPosts(sort, category, page);

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#5f5a54]">
      <div className="mx-auto w-[92%] max-w-5xl py-8">
        <h1 className="mb-8 text-[22px] font-medium text-[#4f4a45]">Board</h1>

        {data.results.length === 0 ? (
          <div className="py-20 text-sm text-[#948d85]">No posts yet.</div>
        ) : (
          <div className="space-y-4">
            {data.results.map((post) => (
              <Link
                key={post.id}
                href={`/board/${post.pretty_slug}`}
                className="block border-b border-[#e7e0d7] pb-4"
              >
                <div className="text-[15px] text-[#4f4a45]">{post.title}</div>
                <div className="mt-1 text-[12px] text-[#9b948c]">
                  {post.category} · {post.views} views
                </div>
              </Link>
            ))}
          </div>
        )}

        {data.total_pages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2 text-sm">
            {data.page > 1 && (
              <Link
                href={`/board?sort=${sort}&category=${category}&page=${data.page - 1}`}
                className="border border-[#ddd6cc] px-3 py-1.5 text-[#5f5a54]"
              >
                Prev
              </Link>
            )}

            <span className="text-[#948d85]">
              Page {data.page} / {data.total_pages}
            </span>

            {data.page < data.total_pages && (
              <Link
                href={`/board?sort=${sort}&category=${category}&page=${data.page + 1}`}
                className="border border-[#ddd6cc] px-3 py-1.5 text-[#5f5a54]"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
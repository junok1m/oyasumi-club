import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  categoryLabel,
  categoryColor,
} from "@/lib/category-style";

type Props = {
    searchParams: Promise<{
        q?: string;
        audience?: string;
    }>;
};

export default async function SearchPage({
    searchParams,
}: Props) {
    const { q = "", audience = "men" } = await searchParams;
const isGirls = audience === "girls";

    const keyword = q.trim();

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    if (!keyword) {
        return (
            <main className="mx-auto max-w-5xl p-4">
                <h1 className="mb-4 text-2xl font-bold">検索</h1>

                <p className="text-sm text-gray-500">
                    キーワードを入力してください。
                </p>
            </main>
        );
    }

    const guideResult = isGirls
  ? { data: [], error: null }
  : await supabase
      .from("guide_posts")
      .select("id,title,slug,location,industry,excerpt,created_at")
      .or(
        `title.ilike.%${keyword}%,location.ilike.%${keyword}%,industry.ilike.%${keyword}%,excerpt.ilike.%${keyword}%`
      )
      .order("created_at", { ascending: false })
      .limit(5);

let boardQuery = supabase
  .from("board_posts")
  .select("id,title,slug,category,industry,location,excerpt,created_at")
  .eq("status", "approved")
  .or(
    `title.ilike.%${keyword}%,location.ilike.%${keyword}%,industry.ilike.%${keyword}%,excerpt.ilike.%${keyword}%`
  )
  .order("created_at", { ascending: false })
  .limit(10);

if (isGirls) {
  boardQuery = boardQuery.in("category", ["jobs", "qa", "blog"]);
}

const boardResult = await boardQuery;

    const guides = guideResult.data ?? [];
    if (guideResult.error) {
        console.error("guide search error", guideResult.error);
    }

    if (boardResult.error) {
        console.error("board search error", boardResult.error);
    }
    const boards = boardResult.data ?? [];
    function formatDate(date: string | null) {
        if (!date) return "";

        return new Intl.DateTimeFormat("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(new Date(date));
    }
    return (
        <main className="mx-auto max-w-5xl space-y-10 p-4">

            <h1 className="text-2xl font-semibold">
                「{keyword}」の検索結果
            </h1>

            {/* Guide */}
{!isGirls && (
            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        📖 ガイド ({guides.length})
                    </h2>

                    <Link href={`/guide?q=${encodeURIComponent(keyword)}`}>
                        もっと見る →
                    </Link>
                </div>

                <div className="divide-y divide-[#e6ded5] border-y border-[#e6ded5]">
                    {guides.map((guide) => (
                        <Link
                            key={guide.id}
                            href={`/guide/${guide.slug ? `${guide.id}-${guide.slug}` : guide.id}`}
                            className="flex items-center justify-between gap-4 py-3 text-sm transition hover:bg-[#faf8f5]"
                        >
                            <span className="min-w-0 flex-1 truncate text-[#4f4943]">
                                {guide.title}
                            </span>

                            <time className="shrink-0 text-[12px] text-[#9b948c]">
                                {formatDate(guide.created_at)}
                            </time>
                        </Link>
                    ))}
                </div>
            </section>
)}
            {/* Board */}

            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        📝 掲示板 ({boards.length})
                    </h2>

                    <Link href={`/board?q=${encodeURIComponent(keyword)}`}>
                        もっと見る →
                    </Link>
                </div>

                <div className="divide-y divide-[#e6ded5] border-y border-[#e6ded5]">
  {boards.map((post) => {
    const href =
      post.category === "blog"
        ? `/blog/${post.slug ? `${post.id}-${post.slug}` : post.id}`
        : `/board/${post.slug ? `${post.id}-${post.slug}` : post.id}`;

    return (
      <Link
  key={post.id}
  href={href}
  className="flex items-center justify-between gap-3 py-3 text-sm transition hover:bg-[#faf8f5]"
>
  <div className="min-w-0 flex flex-1 items-center gap-2">
    <span
      className={`shrink-0 whitespace-nowrap rounded ${categoryColor(
        post.category ?? ""
      )}`}
    >
      {categoryLabel(post.category ?? "")}
    </span>

    <span className="min-w-0 flex-1 truncate text-[#4f4943]">
      {post.title}
    </span>
  </div>

  <time className="shrink-0 whitespace-nowrap text-[12px] text-[#9b948c]">
    {formatDate(post.created_at)}
  </time>
</Link>
    );
  })}
</div>
            </section>

        </main>
    );
}
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { industryLabel, industryStyle } from "@/lib/industry-style";
import { CITIES, cityLabelJa, isValidCity } from "@/lib/cities";

type BoardPost = {
  id: number;
  title: string;
  industry: string | null;
  location: string | null;
  views: number;
  created_at: string;
  slug: string | null;
  like_boost: number;
  views_boost: number;
  board_likes?: { id: number }[];
};

function prettySlug(post: { id: number; slug: string | null }) {
  return post.slug ? `${post.id}-${post.slug}` : `${post.id}`;
}

function formatRelativeTime(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  if (hours < 24) return `${hours}時間前`;
  if (days < 7) return `${days}日前`;
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function buildUrl(
  city: string,
  opts: { sort?: string; page?: number } = {}
) {
  const params = new URLSearchParams();
  if (opts.sort && opts.sort !== "latest") params.set("sort", opts.sort);
  if (opts.page && opts.page > 1) params.set("page", String(opts.page));
  const q = params.toString();
  return q ? `/${city}/jobs?${q}` : `/${city}/jobs`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  if (!isValidCity(city)) return { title: "求人 | おやすみクラブ" };
  const name = cityLabelJa(city);
  const title = `${name}の求人 | おやすみクラブ`;
  const description = `${name}で働きたい女の子向けの求人情報です。`;
  return {
    title,
    description,
    alternates: { canonical: `https://www.oyasumi-club.com/${city}/jobs` },
  };
}

export default async function CityJobsPage({
  params,
  searchParams,
}: {
  params: Promise<{ city: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}) {
  const { city } = await params;
  if (!isValidCity(city)) notFound();

  const sp = await searchParams;
  const sort = sp.sort === "views" ? "views" : "latest";
  const page = Number(sp.page || "1");
  const pageSize = 10;
  const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  const name = cityLabelJa(city);
  const supabase = await supabaseServer();

  let query = supabase
    .from("board_posts")
    .select(
      `id, title, industry, location, views, created_at, slug, like_boost, views_boost, board_likes (id)`,
      { count: "exact" }
    )
    .eq("status", "approved")
    .eq("category", "jobs")
    .eq("city", city);

  if (sort === "views") {
    query = query
      .order("total_views", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, count } = await query.range(from, to);
  const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize));
  const results = (data ?? []) as BoardPost[];

  return (
    <main className="min-h-dvh bg-[#fff3f8] pb-28 text-[#5f4d5c]">
      <div className="mx-auto w-[92%] max-w-5xl py-8">
        <div className="mb-4 flex flex-wrap gap-2">
          {CITIES.map((c) => (
            <Link
              key={c.value}
              href={`/${c.value}/jobs`}
              className={`rounded-full border px-3 py-1.5 text-[12px] font-medium ${
                c.value === city
                  ? "border-[#4f3a4f] bg-[#4f3a4f] text-white"
                  : "border-pink-100 bg-white/80"
              }`}
            >
              {c.labelJa}
            </Link>
          ))}
        </div>

        <h1 className="mb-2 text-[24px] font-semibold text-[#4f3a4f]">
          {name}の求人
        </h1>
        <p className="mb-6 text-[12px] leading-6 text-[#9b7892]">
          {name}で働きたい女の子向けの求人情報です。
        </p>

        <div className="mb-6 flex justify-end text-[12px]">
          <div className="flex border border-pink-200 bg-pink-50">
            <Link
              href={buildUrl(city, { sort: "latest" })}
              className={
                sort === "latest"
                  ? "bg-pink-200 px-3 py-1.5 text-[#4f3a4f]"
                  : "px-3 py-1.5 text-[#b28aa8]"
              }
            >
              新着順
            </Link>
            <Link
              href={buildUrl(city, { sort: "views" })}
              className={
                sort === "views"
                  ? "bg-pink-200 px-3 py-1.5 text-[#4f3a4f]"
                  : "px-3 py-1.5 text-[#b28aa8]"
              }
            >
              人気順
            </Link>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="rounded-3xl border border-pink-100 bg-white/70 px-6 py-16 text-center text-sm text-[#9b7892]">
            まだ{name}の求人がありません。
            <div className="mt-4">
              <Link
                href={`/board/write?category=jobs&city=${city}`}
                className="font-bold text-pink-500"
              >
                最初の求人を書く →
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-pink-100">
            {results.map((post) => (
              <div key={post.id} className="py-4">
                <Link
                  href={`/jobs/${prettySlug(post)}`}
                  className="block text-[15px] font-semibold leading-6 text-[#4f3a4f] hover:text-pink-500"
                >
                  {post.title}
                </Link>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#9b7892]">
                  {industryLabel(post.industry) && (
                    <span className={industryStyle(post.industry)}>
                      {industryLabel(post.industry)}
                    </span>
                  )}
                  {post.location && <span>📍 {post.location}</span>}
                  <span>
                    ♡ {(post.board_likes?.length ?? 0) + (post.like_boost ?? 0)}
                  </span>
                  <span>
                    {(post.views ?? 0) + (post.views_boost ?? 0)}閲覧
                  </span>
                  <span>{formatRelativeTime(post.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2 text-sm">
            {safePage > 1 && (
              <Link
                href={buildUrl(city, { sort, page: safePage - 1 })}
                className="border border-pink-200 bg-white/70 px-3 py-1.5"
              >
                ← 前へ
              </Link>
            )}
            <span className="text-[#9b7892]">
              {safePage} / {totalPages}
            </span>
            {safePage < totalPages && (
              <Link
                href={buildUrl(city, { sort, page: safePage + 1 })}
                className="border border-pink-200 bg-white/70 px-3 py-1.5"
              >
                次へ →
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

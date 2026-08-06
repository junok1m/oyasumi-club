import Link from "next/link";
import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase-server";
import SearchBar from "@/app/board/SearchBar";
import LocationPills from "@/components/location/LocationPills";
import BottomNavGirls from "@/app/girls/_components/BottomNavGirls";
import { industryLabel, industryStyle } from "@/lib/industry-style";

type BoardPost = {
  id: number;
  title: string;
  category: string;
  industry: string | null;
  location: string | null;
  views: number;
  created_at: string;
  slug: string | null;
  like_boost: number;
  views_boost: number;
  board_likes?: { id: number }[];
  comments?: { id: number }[];
  thumbnail_url: string | null;
};

const industries = [
  { value: "fuzoku", label: "風俗" },
  { value: "karaoke", label: "カラオケ" },
  { value: "massage", label: "マッサージ" },
  { value: "club", label: "クラブ" },
  { value: "restaurant", label: "レストラン" },
  { value: "bar", label: "バー" },
];

function buildBlogUrl({
  industry,
  sort = "latest",
  q = "",
  location = "",
  page,
}: {
  industry?: string;
  sort?: string;
  q?: string;
  location?: string;
  page?: number;
}) {
  const params = new URLSearchParams();
  if (industry && industry !== "all") params.set("industry", industry);
  if (sort && sort !== "latest") params.set("sort", sort);
  if (q) params.set("q", q);
  if (location) params.set("location", location);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/blog?${query}` : "/blog";
}

function toggleValue(current: string, value: string) {
  const selected = current === "all" ? [] : current.split(",").filter(Boolean);
  const next = selected.includes(value)
    ? selected.filter((item) => item !== value)
    : [...selected, value];
  return next.length ? next.join(",") : "all";
}

function formatRelativeTime(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  if (hours < 24) return `${hours}時間前`;
  if (days < 7) return `${days}日前`;
  if (weeks < 5) return `${weeks}週間前`;
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function BlogFilter({
  industry,
  sort,
  q,
  location,
}: {
  industry: string;
  sort: string;
  q: string;
  location: string;
}) {
  const selectedIndustries =
    industry === "all" ? [] : industry.split(",").filter(Boolean);

  return (
    <div className="mb-8">
      <div className="flex gap-2 overflow-x-auto pb-1 pt-1 whitespace-nowrap">
        {industries.map((item) => {
          const nextIndustry = toggleValue(industry, item.value);
          const active = selectedIndustries.includes(item.value);
          return (
            <Link
              key={item.value}
              href={buildBlogUrl({ industry: nextIndustry, sort, q, location })}
              className={`shrink-0 ${industryStyle(item.value)} ${
                active
                  ? "shadow-[inset_0_0_0_1px_#d8a7d8] opacity-100"
                  : "opacity-70"
              }`}
            >
              {industryLabel(item.value)}
            </Link>
          );
        })}
      </div>
      <div className="mt-4 flex justify-end text-[12px]">
        <div className="flex border border-pink-200 bg-pink-50">
          <Link
            href={buildBlogUrl({ industry, sort: "latest", q, location })}
            className={
              sort === "latest"
                ? "bg-pink-200 px-3 py-1.5 text-[#4f3a4f]"
                : "px-3 py-1.5 text-[#b28aa8]"
            }
          >
            新着順
          </Link>
          <Link
            href={buildBlogUrl({ industry, sort: "views", q, location })}
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
    </div>
  );
}

async function getPosts(
  sort: string,
  industries: string[],
  location: string,
  page: number,
  q: string
) {
  const pageSize = 10;
  const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;
  const supabase = await supabaseServer();

  let query = supabase
    .from("board_posts")
    .select(
      `
      id, title, category, industry, location, thumbnail_url,
      views, created_at, slug, like_boost, views_boost,
      board_likes (id), comments (id)
      `,
      { count: "exact" }
    )
    .eq("status", "approved")
    .eq("category", "blog");

  if (industries.length > 0) query = query.in("industry", industries);
  if (location) query = query.eq("location", location);
  const searchText = q.trim();
  if (searchText) {
    query = query.or(`title.ilike.%${searchText}%,body.ilike.%${searchText}%`);
  }
  if (sort === "views") {
    query = query
      .order("total_views", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error || !data) {
    console.error("getBlog error:", error);
    return { results: [] as (BoardPost & { pretty_slug: string })[], page: 1, total_pages: 1 };
  }

  const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize));
  const results = data.map((post) => ({
    ...post,
    pretty_slug: post.slug ? `${post.id}-${post.slug}` : `${post.id}`,
  }));

  return { results, page: safePage, total_pages: totalPages };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; industry?: string; location?: string; page?: string; q?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const page = Number(params.page || "1");
  const q = params.q?.trim() || "";
  const title = q
    ? `「${q}」の記事検索結果 | おやすみクラブ`
    : "女の子向け記事 | おやすみクラブ";
  const description =
    "ビザ・安全・稼ぎ方・はじめかたなど、シドニーで働く女の子向けの記事をまとめています。";

  return {
    title: page > 1 ? `${title} - ページ${page}` : title,
    description,
    alternates: { canonical: "https://www.oyasumi-club.com/blog" },
    openGraph: {
      title,
      description,
      url: "https://www.oyasumi-club.com/blog",
      type: "website",
    },
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; industry?: string; location?: string; page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const sort = params.sort === "views" ? "views" : "latest";
  const industry = params.industry || "all";
  const location = params.location?.trim() || "";
  const selectedIndustries = industry === "all" ? [] : industry.split(",").filter(Boolean);
  const page = Number(params.page || "1");
  const q = params.q?.trim() || "";

  const data = await getPosts(sort, selectedIndustries, location, page, q);

  return (
    <main className="-mb-24 min-h-dvh bg-[#fff3f8] pb-32 text-[#5f4d5c]">
      <div className="mx-auto w-[92%] max-w-5xl py-8">
        <h1 className="mb-4 text-[24px] font-semibold text-[#4f3a4f]">女の子向け記事</h1>
        <p className="mb-6 text-[12px] leading-6 text-[#9b7892]">
          ビザ・安全・稼ぎ方・はじめかたなど、シドニーで働く女の子向けの記事をまとめています。
        </p>

        <div className="space-y-6">
          <SearchBar q={q} category="blog" sort={sort} basePath="/blog" />
          <LocationPills
            category="blog"
            basePath="/blog"
            title="エリアで探す"
            showTitle={false}
            currentLocation={location}
            queryMode
          />
          <BlogFilter industry={industry} sort={sort} q={q} location={location} />
        </div>

        {q && <p className="mb-5 text-[12px] text-[#9b7892]">「{q}」の検索結果</p>}

        {data.results.length === 0 ? (
          <div className="rounded-3xl border border-pink-100 bg-white/70 px-6 py-20 text-center text-sm text-[#9b7892]">
            まだ記事がありません。
          </div>
        ) : (
          <div className="divide-y divide-pink-100">
            {data.results.map((post) => (
              <div key={post.id} className="py-4">
                {post.thumbnail_url && (
                  <Link href={`/blog/${post.pretty_slug}`}>
                    <img
                      src={post.thumbnail_url}
                      alt={post.title}
                      className="mb-3 aspect-[3/2] w-full rounded-2xl object-cover"
                    />
                  </Link>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="shrink-0 text-[11px] text-pink-300">#{post.id}</span>
                  <Link
                    href={`/blog/${post.pretty_slug}`}
                    className="min-w-0 flex-1 truncate text-[15px] leading-6 text-[#4f3a4f]"
                  >
                    {post.title}
                  </Link>
                </div>
                <div className="ml-8 mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#9b7892]">
                  {industryLabel(post.industry) && (
                    <Link
                      href={buildBlogUrl({ industry: post.industry || "all", sort, q, location })}
                      className={`shrink-0 ${industryStyle(post.industry)}`}
                    >
                      {industryLabel(post.industry)}
                    </Link>
                  )}
                  {post.location && (
                    <Link
                      href={buildBlogUrl({ industry, sort, q, location: post.location })}
                      className="text-[#a8739b] underline decoration-dotted underline-offset-2"
                    >
                      {post.location}
                    </Link>
                  )}
                  <span className="flex items-center gap-1.5">
                    <span>♡</span>
                    <span>{(post.board_likes?.length ?? 0) + (post.like_boost ?? 0)}</span>
                  </span>
                  <span>{(post.views ?? 0) + (post.views_boost ?? 0)}閲覧</span>
                  <span>{formatRelativeTime(post.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.total_pages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2 text-sm">
            {data.page > 1 && (
              <Link
                href={buildBlogUrl({ industry, sort, page: data.page - 1, q, location })}
                className="border border-pink-200 bg-white/70 px-3 py-1.5 text-[#5f4d5c]"
              >
                ← 前へ
              </Link>
            )}
            <span className="text-[#9b7892]">{data.page} / {data.total_pages}</span>
            {data.page < data.total_pages && (
              <Link
                href={buildBlogUrl({ industry, sort, page: data.page + 1, q, location })}
                className="border border-pink-200 bg-white/70 px-3 py-1.5 text-[#5f4d5c]"
              >
                次へ →
              </Link>
            )}
          </div>
        )}
      </div>
      <BottomNavGirls />
    </main>
  );
}

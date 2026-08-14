import Link from "next/link";
import { supabasePublic } from "@/lib/supabase-public";
import type { Metadata } from "next";
import SearchBar from "@/app/board/SearchBar";
import LocationPills from "@/components/location/LocationPills";
import { industryLabel, industryStyle } from "@/lib/industry-style";

export const revalidate = 60;

type GuidePost = {
  id: number;
  title: string;
  slug: string | null;
  excerpt: string | null;
  industry: string | null;
  location: string | null;
  sponsor_name: string | null;
  thumbnail_url: string | null;
  thumbnail_small_url: string | null;
  views: number;
  views_boost: number;
  created_at: string;
};

const industries = [
  { value: "fuzoku", label: "風俗" },
  { value: "karaoke", label: "カラオケ" },
  { value: "massage", label: "マッサージ" },
  { value: "club", label: "クラブ" },
  { value: "restaurant", label: "レストラン" },
  { value: "bar", label: "バー" },
];

function buildGuideUrl({
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
  return query ? `/guide?${query}` : "/guide";
}

function toggleValue(current: string, value: string) {
  const selected = current === "all" ? [] : current.split(",").filter(Boolean);

  const next = selected.includes(value)
    ? selected.filter((item) => item !== value)
    : [...selected, value];

  return next.length ? next.join(",") : "all";
}

export const metadata: Metadata = {
  title: "シドニー夜遊びガイド | おやすみクラブ",
  description:
    "シドニーの風俗・カラオケ・マッサージ・クラブなど、夜遊びスポットを日本語で紹介します。",
  alternates: {
    canonical: "https://www.oyasumi-club.com/guide",
  },
};

function GuideIndustryFilter({
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
    <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1 pt-1">
      {industries.map((item) => {
        const nextIndustry = toggleValue(industry, item.value);
        const active = selectedIndustries.includes(item.value);

        return (
          <Link
            key={item.value}
            href={buildGuideUrl({
              industry: nextIndustry,
              sort,
              q,
              location,
            })}
            className={`shrink-0 ${industryStyle(item.value)} ${
              active
                ? "shadow-[inset_0_0_0_1px_#67e8f9] opacity-100"
                : "opacity-65"
            }`}
          >
            {industryLabel(item.value)}
          </Link>
        );
      })}
    </div>
  );
}

function GuideSortTabs({
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
  return (
    <div className="mb-5 flex justify-end text-[12px]">
      <div className="flex border border-slate-700 bg-[#1b2433]">
        <Link
          href={buildGuideUrl({ industry, sort: "latest", q, location })}
          className={
            sort === "latest"
              ? "bg-cyan-400/10 px-3 py-1.5 text-cyan-300"
              : "px-3 py-1.5 text-slate-500"
          }
        >
          新着順
        </Link>

        <Link
          href={buildGuideUrl({ industry, sort: "views", q, location })}
          className={
            sort === "views"
              ? "bg-cyan-400/10 px-3 py-1.5 text-cyan-300"
              : "px-3 py-1.5 text-slate-500"
          }
        >
          人気順
        </Link>
      </div>
    </div>
  );
}

async function getGuidePosts(
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

  const supabase = supabasePublic();

  let query = supabase
    .from("guide_posts")
    .select(
      `
id,
title,
slug,
excerpt,
industry,
location,
sponsor_name,
thumbnail_url,
thumbnail_small_url,
views,
views_boost,
created_at
`,
      { count: "exact" }
    )
    .eq("status", "approved");

  if (industries.length > 0) {
    query = query.in("industry", industries);
  }

  if (location) {
    query = query.eq("location", location);
  }

  const searchText = q.trim();

  if (searchText) {
    query = query.or(
      `title.ilike.%${searchText}%,excerpt.ilike.%${searchText}%,body.ilike.%${searchText}%`
    );
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
    console.error("getGuidePosts error:", error);
    return {
      results: [] as (GuidePost & { pretty_slug: string })[],
      page: 1,
      total_pages: 1,
    };
  }

  const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize));

  const results = data.map((post) => ({
    ...post,
    pretty_slug: post.slug ? `${post.id}-${post.slug}` : `${post.id}`,
  }));

  return {
    results,
    page: safePage,
    total_pages: totalPages,
  };
}

export default async function GuidePage({
  searchParams,
}: {
  searchParams: Promise<{
    sort?: string;
    industry?: string;
    location?: string;
    page?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;

  const sort = params.sort === "views" ? "views" : "latest";
  const industry = params.industry || "all";
  const location = params.location?.trim() || "";
  const industries =
    industry === "all" ? [] : industry.split(",").filter(Boolean);

  const page = Number(params.page || "1");
  const q = params.q?.trim() || "";

  const data = await getGuidePosts(sort, industries, location, page, q);

  return (
    <main className="relative min-h-dvh text-[#d6dde7]">
    <div className="pointer-events-none fixed inset-0 z-0 bg-[#151c28]" />

    <div className="relative z-10 mx-auto w-[92%] max-w-5xl pb-32 pt-8">
      
        <h1 className="mb-4 text-[22px] font-medium text-slate-100">
          シドニー夜遊びガイド
        </h1>

        <p className="mb-6 text-[12px] leading-6 text-slate-400">
          おすすめのお店・エリア・遊び方を、日本語でゆるく紹介します。
        </p>

        <div className="mb-10 space-y-6">
  <SearchBar q={q} category="guide" sort={sort} basePath="/guide" />

  <LocationPills
    source="guide"
    basePath="/guide"
    title="エリアで探す"
    showTitle={false}
    currentLocation={location}
    queryMode
  />

  <GuideIndustryFilter
    industry={industry}
    sort={sort}
    q={q}
    location={location}
  />
</div>

<GuideSortTabs
  industry={industry}
  sort={sort}
  q={q}
  location={location}
/>
        {q && (
          <p className="mb-5 text-[12px] text-slate-400">
            「{q}」のガイド検索結果
          </p>
        )}

        {data.results.length === 0 ? (
          <div className="py-20 text-sm text-slate-500">
            まだガイド記事がありません。
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:grid-cols-4">
            {data.results.map((post) => {
              const thumbnail =
                post.thumbnail_small_url || post.thumbnail_url;

              return (
                <Link
                  key={post.id}
                  href={`/guide/${post.pretty_slug}`}
                  prefetch={false}
                  className="group block"
                >
                  <div className="aspect-[2/3] overflow-hidden border border-slate-700 bg-[#1b2433]">
                    {thumbnail && (
                      <img
                        src={thumbnail}
                        alt={post.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div className="mt-2">
                    <div className="text-[11px] text-slate-500">
                      #{post.id}
                    </div>

                    <h2 className="mt-1 line-clamp-2 text-[14px] leading-6 text-slate-100 transition group-hover:text-cyan-300">
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-slate-400">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-slate-500">
                      {post.location && <span>{post.location}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {data.total_pages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2 text-sm">
            {data.page > 1 && (
              <Link
                href={buildGuideUrl({
                  industry,
                  sort,
                  page: data.page - 1,
                  q,
                  location,
                })}
                className="border border-slate-700 px-3 py-1.5 text-slate-300 transition hover:bg-[#202c3d]"
              >
                ← 前へ
              </Link>
            )}

            <span className="text-slate-400">
              {data.page} / {data.total_pages}
            </span>

            {data.page < data.total_pages && (
              <Link
                href={buildGuideUrl({
                  industry,
                  sort,
                  page: data.page + 1,
                  q,
                  location,
                })}
                className="border border-slate-700 px-3 py-1.5 text-slate-300 transition hover:bg-[#202c3d]"
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

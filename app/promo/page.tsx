import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import type { Metadata } from "next";
import SearchBar from "@/app/board/SearchBar";
import LocationPills from "@/components/location/LocationPills";
import { industryLabel, industryStyle } from "@/lib/industry-style";

type BoardPost = {
  id: number;
  author_id: string;
  title: string;
  category: string;
  industry: string | null;
  location: string | null;
  views: number;
  created_at: string;
  slug: string | null;
  thumbnail_url: string | null;
  thumbnail_small_url: string | null;
  board_likes?: { id: number }[];
  comments?: { id: number }[];
  like_boost: number;
  views_boost: number;
  expires_at: string | null;
};

type PublicProfile = {
  id: string;
  display_name: string | null;
};

const industries = [
  { value: "fuzoku", label: "風俗" },
  { value: "karaoke", label: "カラオケ" },
  { value: "massage", label: "マッサージ" },
  { value: "club", label: "クラブ" },
  { value: "restaurant", label: "レストラン" },
  { value: "bar", label: "バー" },
];

function buildPromoUrl({
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
  return query ? `/promo?${query}` : "/promo";
}

function toggleValue(current: string, value: string) {
  const selected = current === "all" ? [] : current.split(",").filter(Boolean);

  const next = selected.includes(value)
    ? selected.filter((item) => item !== value)
    : [...selected, value];

  return next.length ? next.join(",") : "all";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{
    sort?: string;
    industry?: string;
    location?: string;
    page?: string;
    q?: string;
  }>;
}): Promise<Metadata> {
  const params = await searchParams;

  const industry = params.industry || "all";
  const location = params.location?.trim() || "";
  const page = Number(params.page || "1");
  const q = params.q?.trim() || "";

  const title = q
    ? `「${q}」のプロモーション検索結果 | シドニー夜遊び割引 | おやすみクラブ`
    : location
      ? `${location}のプロモーション | おやすみクラブ`
      : `シドニー夜遊びプロモーション | おやすみクラブ`;

  const description = q
    ? `シドニーの夜遊びプロモーションから「${q}」に関連する割引・キャンペーン情報を検索できます。`
    : location
      ? `${location}周辺のナイトライフ割引・キャンペーン情報を日本語でチェックできます。`
      : `シドニーの風俗、カラオケ、マッサージ、クラブ、バー、レストランなどのプロモーション情報を日本語でチェックできます。`;

  const canonical = buildPromoUrl({
    industry,
    sort: params.sort || "latest",
    q,
    location,
    page,
  });

  return {
    title: page > 1 ? `${title} - ページ${page}` : title,
    description,
    alternates: {
      canonical: `https://www.oyasumi-club.com${canonical}`,
    },
    openGraph: {
      title,
      description,
      url: "https://www.oyasumi-club.com/promo",
      type: "website",
    },
  };
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

function formatExpiry(expiresAt: string | null) {
  if (!expiresAt) return null;


  const now = new Date();
  const expires = new Date(expiresAt);
  const diffMs = expires.getTime() - now.getTime();


  if (diffMs <= 0) return "期限切れ";
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 1) return "本日まで";
  return `あと${days}日`;
}

function PromoIndustryFilter({
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
            href={buildPromoUrl({
              industry: nextIndustry,
              sort,
              q,
              location,
            })}
            className={`shrink-0 ${industryStyle(item.value)} ${active
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

function PromoSortTabs({
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
          href={buildPromoUrl({ industry, sort: "latest", q, location })}
          className={
            sort === "latest"
              ? "bg-cyan-400/10 px-3 py-1.5 text-cyan-300"
              : "px-3 py-1.5 text-slate-500"
          }
        >
          新着順
        </Link>

        <Link
          href={buildPromoUrl({ industry, sort: "views", q, location })}
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
id,
author_id,
title,
category,
industry,
location,
views,
created_at,
expires_at,
slug,
like_boost,
views_boost,
thumbnail_url,
thumbnail_small_url,
board_likes (
id
),
comments (
id
)
`,
      { count: "exact" }
    )
    .eq("status", "approved")
    .eq("category", "promo")

  if (industries.length > 0) {
    query = query.in("industry", industries);
  }

  if (location) {
    query = query.eq("location", location);
  }

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
    console.error("getPromo error:", error);
    return {
      results: [] as (BoardPost & { pretty_slug: string })[],
      authors: {} as Record<string, string>,
      page: 1,
      total_pages: 1,
    };
  }

  const authorIds = [
    ...new Set(data.map((post) => post.author_id).filter(Boolean)),
  ];

  let authors: Record<string, string> = {};

  if (authorIds.length > 0) {
    const { data: profileData, error: profileError } = await supabase
      .from("public_profiles")
      .select("id, display_name")
      .in("id", authorIds);

    if (profileError) {
      console.error("getProfiles error:", profileError);
    } else {
      authors = Object.fromEntries(
        (profileData as PublicProfile[]).map((profile) => [
          profile.id,
          profile.display_name || "unknown",
        ])
      );
    }
  }

  const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize));

  const results = data.map((post) => ({
    ...post,
    pretty_slug: post.slug ? `${post.id}-${post.slug}` : `${post.id}`,
  }));

  return {
    results,
    authors,
    page: safePage,
    total_pages: totalPages,
  };
}

export default async function PromoPage({
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
  const category = "promo";
  const industry = params.industry || "all";
  const location = params.location?.trim() || "";

  const industries =
    industry === "all" ? [] : industry.split(",").filter(Boolean);

  const page = Number(params.page || "1");
  const q = params.q?.trim() || "";

  const data = await getPosts(sort, industries, location, page, q);

  return (
    <main className="relative min-h-dvh text-[#d6dde7]">
  <div className="pointer-events-none fixed inset-0 z-0 bg-[#151c28]" />

  <div className="relative z-10 mx-auto w-[92%] max-w-5xl pb-32 pt-8">
    <h1 className="mb-4 text-[22px] font-medium text-slate-100">
      シドニー夜遊びプロモーション
    </h1>

    <p className="mb-6 text-[12px] leading-6 text-slate-400">
      風俗・カラオケ・マッサージ・クラブなど、シドニーの割引・キャンペーン情報。
    </p>

    <div className="mb-10 space-y-6">
      <SearchBar q={q} category={category} sort={sort} basePath="/promo" />

      <LocationPills
        category="promo"
        basePath="/promo"
        title="エリアで探す"
        showTitle={false}
        currentLocation={location}
      />

      <PromoIndustryFilter
        industry={industry}
        sort={sort}
        q={q}
        location={location}
      />
    </div>

    <PromoSortTabs
      industry={industry}
      sort={sort}
      q={q}
      location={location}
    />

    {q && (
      <p className="mb-5 text-[12px] text-slate-400">
        「{q}」のプロモーション検索結果
      </p>
    )}

    {data.results.length === 0 ? (
      <div className="py-20 text-sm text-slate-500">
        まだプロモーション投稿がありません。
      </div>
    ) : (
      <div className="border-t border-slate-700">
        {data.results.map((post) => {
          const expiry = formatExpiry(post.expires_at);
          const expired =
            post.expires_at &&
            new Date(post.expires_at).getTime() < Date.now();

          return (
            <div
              key={post.id}
              className={`border-b border-slate-700 py-3.5 ${
                expired ? "opacity-55" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                {(post.thumbnail_small_url || post.thumbnail_url) && (
                  <Link
                    href={`/board/${post.pretty_slug}`}
                    className="shrink-0"
                  >
                    <img
                      src={post.thumbnail_small_url || post.thumbnail_url}
                      alt={post.title}
                      className="h-20 w-30 border border-slate-700 bg-[#1b2433] object-cover"
                    />
                  </Link>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="shrink-0 text-[11px] text-slate-500">
                      #{post.id}
                    </span>

                    <Link
                      href={`/board/${post.pretty_slug}`}
                      className="min-w-0 flex-1 truncate text-[15px] leading-6 text-slate-100 transition hover:text-cyan-300"
                    >
                      {post.title}
                    </Link>
                  </div>

                  <div className="ml-8 mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-slate-400">
                    {industryLabel(post.industry) && (
                      <Link
                        href={buildPromoUrl({
                          industry: post.industry || "all",
                          sort,
                          q,
                          location,
                        })}
                        className={`shrink-0 ${industryStyle(post.industry)}`}
                      >
                        {industryLabel(post.industry)}
                      </Link>
                    )}

                    {post.location && (
                      <Link
                        href={buildPromoUrl({
                          industry,
                          sort,
                          q,
                          location: post.location,
                        })}
                        className="text-cyan-300 underline decoration-dotted underline-offset-2"
                      >
                        {post.location}
                      </Link>
                    )}

                    {expiry && <span className="text-amber-300">{expiry}</span>}

                    <span>{formatRelativeTime(post.created_at)}</span>

                    <span>
                      {(post.views ?? 0) + (post.views_boost ?? 0)}閲覧
                    </span>

                    <span>
                      <span className="mr-0.5 text-cyan-300">♡</span>
                      {(post.board_likes?.length ?? 0) + (post.like_boost ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}

    {data.total_pages > 1 && (
      <div className="mt-10 flex items-center justify-center gap-2 text-sm">
        {data.page > 1 && (
          <Link
            href={buildPromoUrl({
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
            href={buildPromoUrl({
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
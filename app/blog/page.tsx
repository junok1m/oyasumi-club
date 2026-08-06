import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import type { Metadata } from "next";
import SearchBar from "@/app/board/SearchBar";
import LocationPills from "@/components/location/LocationPills";
import { industryLabel, industryStyle } from "@/lib/industry-style";
import { buildUrl } from "@/lib/url";

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
  like_boost: number;
  views_boost: number;
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

function buildBlogUrl({
  industry,
  sort = "latest",
  q = "",
  location = "",
  audience = "all,men",
  page,
}: {
  industry?: string;
  sort?: string;
  q?: string;
  location?: string;
  audience?: string;
  page?: number;
}) {
  return buildUrl("/blog", {
    industry,
    sort,
    q,
    location,
    audience,
    page,
  });
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
    audience?: string;
  }>;
}): Promise<Metadata> {
  const params = await searchParams;

  const industry = params.industry || "all";
  const location = params.location?.trim() || "";
  const page = Number(params.page || "1");
  const q = params.q?.trim() || "";
  const audienceParam = params.audience || "all,men";

  const title = q
    ? `「${q}」のブログ検索結果 | シドニー夜遊びブログ | おやすみクラブ`
    : location
      ? `${location}の夜遊びブログ | おやすみクラブ`
      : "シドニー夜遊びブログ | おやすみクラブ";

  const description = q
    ? `シドニーの夜遊びブログから「${q}」に関連する投稿を検索できます。`
    : location
      ? `${location}周辺の風俗・カラオケ・マッサージ・クラブに関するブログを日本語で読めます。`
      : "シドニーの風俗・カラオケ・マッサージ・クラブなど、夜遊び情報や体験談を日本語で読めます。";

  const canonical = buildBlogUrl({
    industry,
    sort: params.sort || "latest",
    q,
    location,
    audience: audienceParam,
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
      url: "https://www.oyasumi-club.com/blog",
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

function BlogIndustryFilter({
  industry,
  sort,
  q,
  location,
  audience,
}: {
  industry: string;
  sort: string;
  q: string;
  location: string;
  audience: string;
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
            href={buildBlogUrl({
              industry: nextIndustry,
              sort,
              q,
              location,
              audience,
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

function BlogSortTabs({
  industry,
  sort,
  q,
  location,
  audience,
}: {
  industry: string;
  sort: string;
  q: string;
  location: string;
  audience: string;
}) {
  return (
    <div className="mb-5 flex justify-end text-[12px]">
      <div className="flex border border-slate-700 bg-[#1b2433]">
        <Link
          href={buildBlogUrl({ industry, sort: "latest", q, location, audience })}
          className={
            sort === "latest"
              ? "bg-cyan-400/10 px-3 py-1.5 text-cyan-300"
              : "px-3 py-1.5 text-slate-500"
          }
        >
          新着順
        </Link>

        <Link
          href={buildBlogUrl({ industry, sort: "views", q, location, audience })}
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
  q: string,
  audience: string[]
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
    .eq("category", "blog");

  if (audience.length > 0) {
    query = query.in("audience", audience);
  }

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
    console.error("getBlog error:", error);
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

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{
    sort?: string;
    industry?: string;
    location?: string;
    page?: string;
    q?: string;
    audience?: string;
  }>;
}) {
  const params = await searchParams;

  const sort = params.sort === "views" ? "views" : "latest";
  const category = "blog";
  const industry = params.industry || "all";
  const location = params.location?.trim() || "";

  const industries =
    industry === "all" ? [] : industry.split(",").filter(Boolean);

  const page = Number(params.page || "1");
  const q = params.q?.trim() || "";
  const audienceParam = params.audience || "all,men";
  const audiences = audienceParam
    ? audienceParam.split(",").filter(Boolean)
    : [];

  const data = await getPosts(sort, industries, location, page, q, audiences);

  return (
    <main className="relative min-h-dvh text-[#d6dde7]">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[#151c28]" />

      <div className="relative z-10 mx-auto w-[92%] max-w-5xl pb-32 pt-8">
        <h1 className="mb-4 text-[22px] font-medium text-slate-100">
          シドニー夜遊びブログ
        </h1>

        <p className="mb-6 text-[12px] leading-6 text-slate-400">
          お店情報・体験談・働き方など、シドニーの夜遊びにまつわる読みもの。
        </p>

        <div className="mb-10 space-y-6">
          <SearchBar q={q} category={category} sort={sort} basePath="/blog" />

          <LocationPills
            category="blog"
            basePath="/blog"
            title="エリアで探す"
            showTitle={false}
            currentLocation={location}
          />

          <BlogIndustryFilter
            industry={industry}
            sort={sort}
            q={q}
            location={location}
            audience={audienceParam}
          />
        </div>

        <BlogSortTabs
          industry={industry}
          sort={sort}
          q={q}
          location={location}
          audience={audienceParam}
        />

        {q && (
          <p className="mb-5 text-[12px] text-[#948d85]">
            「{q}」のブログ検索結果
          </p>
        )}

        {data.results.length === 0 ? (
          <div className="py-20 text-sm text-[#948d85]">
            まだブログ投稿がありません。
          </div>
        ) : (
          <div>
            {data.results.map((post) => {
              const thumbnail = post.thumbnail_small_url || post.thumbnail_url;

              return (
                <div
                  key={post.id}
                  className="py-3.5"
                >
                  <div className="flex items-center gap-3">
                    {thumbnail && (
                      <Link
                        href={`/board/${post.pretty_slug}`}
                        className="block h-20 w-30 shrink-0 overflow-hidden"
                      >
                        <img
                          src={thumbnail}
                          alt={post.title}
                          className="h-full w-full object-cover"
                        />
                      </Link>
                    )}

                    <div className="min-w-0 flex-1">
  <Link
    href={`/board/${post.pretty_slug}`}
    className="block truncate text-[15px] leading-6 text-slate-100 transition hover:text-cyan-300"
  >
    {post.title}
  </Link>

  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-slate-500">
    {post.location && (
      <Link
        href={buildBlogUrl({
          industry,
          sort,
          q,
          location: post.location,
          audience: audienceParam,
        })}
        className="text-cyan-300 underline decoration-dotted underline-offset-2"
      >
        {post.location}
      </Link>
    )}

    <span>{formatRelativeTime(post.created_at)}</span>

    <span>{(post.views ?? 0) + (post.views_boost ?? 0)}閲覧</span>

    <span>
      ♡ {(post.board_likes?.length ?? 0) + (post.like_boost ?? 0)}
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
                href={buildBlogUrl({
                  industry,
                  sort,
                  page: data.page - 1,
                  q,
                  location,
                  audience: audienceParam,
                })}
                className="border border-[#ddd6cc] px-3 py-1.5 text-[#5f5a54]"
              >
                ← 前へ
              </Link>
            )}

            <span className="text-[#948d85]">
              {data.page} / {data.total_pages}
            </span>

            {data.page < data.total_pages && (
              <Link
                href={buildBlogUrl({
                  industry,
                  sort,
                  page: data.page + 1,
                  q,
                  location,
                  audience: audienceParam,
                })}
                className="border border-[#ddd6cc] px-3 py-1.5 text-[#5f5a54]"
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
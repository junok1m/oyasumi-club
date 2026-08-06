import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import type { Metadata } from "next";
import SearchBar from "./SearchBar";
import {
  categoryLabel,
  industryLabel,
  buildBoardUrl,
} from "@/lib/board"
import BoardToolbar from "@/components/board/BoardToolbar"


type BoardPost = {
  id: number;
  author_id: string;
  title: string;
  category: string;
  industry: string | null;
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

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{
    sort?: string;
    category?: string;
    industry?: string;
    page?: string;
    q?: string;
  }>;
}): Promise<Metadata> {
  const params = await searchParams;

  const category = params.category || "all";
  const industry = params.industry || "all";

  const categories =
    category === "all"
      ? []
      : category.split(",").filter(Boolean);

  const industries =
    industry === "all"
      ? []
      : industry.split(",").filter(Boolean);

  const page = Number(params.page || "1");
  const q = params.q?.trim() || "";

  const categoryMap: Record<string, string> = {
    news: "ニュース",
    blog: "ブログ",
    jobs: "求人",
    promo: "プロモーション",
    qa: "Q&A",
  };

  const industryMap: Record<string, string> = {
    fuzoku: "風俗",
    karaoke: "カラオケ",
    massage: "マッサージ",
    club: "クラブ",
    restaurant: "レストラン",
    bar: "バー",
  };

  const categoryText =
    category === "all" ? "風俗・夜遊び" : categoryMap[category] || "情報";

  const industryText =
    industry === "all" ? "" : industryMap[industry] || "";

  const seoText = industryText
    ? `${industryText}・${categoryText}`
    : categoryText;

  const baseTitle = q
    ? `「${q}」の検索結果 | シドニー${seoText}掲示板 | おやすみクラブ`
    : `シドニー${seoText}掲示板 | おやすみクラブ`;

  const title = page > 1 ? `${baseTitle} - ページ${page}` : baseTitle;

  const description = q
    ? `シドニーの${seoText}投稿から「${q}」に関連する情報を検索できます。`
    : page > 1
      ? `シドニーの${seoText}投稿一覧ページ${page}。最新の投稿や人気記事をチェックできます。`
      : `シドニーの風俗店、カラオケ、クラブ、レストラン、バーなど、夜遊び・ナイトライフ関連のプロモーション情報や求人・求職情報をチェックできる掲示板です。`;

  const paramsForCanonical = new URLSearchParams();

  if (category !== "all") paramsForCanonical.set("category", category);
  if (industry !== "all") paramsForCanonical.set("industry", industry);
  if (params.sort && params.sort !== "latest") paramsForCanonical.set("sort", params.sort);
  if (q) paramsForCanonical.set("q", q);
  if (page > 1) paramsForCanonical.set("page", String(page));

  const canonicalQuery = paramsForCanonical.toString();

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.oyasumi-club.com/board${canonicalQuery ? `?${canonicalQuery}` : ""
        }`,
    },
    openGraph: {
      title,
      description,
      url: "https://www.oyasumi-club.com/board",
      type: "website",
    },
  };
}



function categoryColor(cat: string) {
  switch (cat) {
    case "news":
      return "bg-[#eef3ea] text-[#6f8660]";
    case "blog":
      return "bg-[#eef1f6] text-[#6b7896]";
    case "jobs":
      return "bg-[#f5eee9] text-[#8a5e3f]";
    case "promo":
      return "bg-[#f7eef2] text-[#a15470]";
    case "qa":
      return "bg-[#efe9f6] text-[#7d6896]";
    default:
      return "bg-[#f0ece6] text-[#8f887f]";
  }
}



function industryColor(industry: string | null) {
  switch (industry) {
    case "fuzoku":
      return "border-[#e5bfd0] text-[#a15470]";
    case "karaoke":
      return "border-[#c8d6e8] text-[#627c9e]";
    case "massage":
      return "border-[#d8c8b2] text-[#8a6b48]";
    case "club":
      return "border-[#d5c6e8] text-[#7a669b]";
    case "restaurant":
      return "border-[#d9c7a3] text-[#8a6b3f]";
    case "bar":
      return "border-[#d6c4b7] text-[#85604a]";
    default:
      return "border-[#ddd6cc] text-[#948d85]";
  }
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

function getPromoRemainingLabel(expiresAt: string | null) {
  if (!expiresAt) return null;

  const diffMs = new Date(expiresAt).getTime() - Date.now();

  if (diffMs <= 0) return "掲載終了";

  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 1) return "本日終了";

  return `あと${days}日`;
}

async function getPosts(
  sort: string,
  categories: string[],
  industries: string[],
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
    .eq("status", "approved");

  if (categories.length > 0) {
    query = query.in("category", categories);
  }

  if (industries.length > 0) {
    query = query.in("industry", industries);
  }

  const searchText = q.trim();

  if (searchText) {
    query = query.or(
      `title.ilike.%${searchText}%,body.ilike.%${searchText}%`
    );
  }

  if (sort === "views") {
    query = query.order("views", { ascending: false }).order("created_at", {
      ascending: false,
    });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error || !data) {
    console.error("getPosts error:", error);
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



export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    sort?: string;
    category?: string;
    industry?: string;
    page?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;

  const sort = params.sort === "views" ? "views" : "latest";
  const category = params.category || "all";
  const industry = params.industry || "all";
  const categories =
    category === "all"
      ? []
      : category.split(",").filter(Boolean);

  const industries =
    industry === "all"
      ? []
      : industry.split(",").filter(Boolean);
  const page = Number(params.page || "1");
  const q = params.q?.trim() || "";

  const data = await getPosts(
    sort,
    categories,
    industries,
    page,
    q
  );
  const filterCategories = ["all", "news", "jobs", "promo", "blog", "qa",];
  const filterIndustries = [
    "all",
    "fuzoku",
    "karaoke",
    "massage",
    "club",
    "restaurant",
    "bar",
  ];
  

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#5f5a54]">
      <div className="mx-auto w-[92%] max-w-5xl py-8">
        <h1 className="mb-6 text-[22px] font-medium text-[#4f4a45]">
          掲示板
        </h1>

        <p className="mb-6 text-[11px] text-[#9b948c]">          シドニー夜遊び情報掲示板
        </p>



        <SearchBar q={q} category={category} sort={sort} />
        <BoardToolbar
          category={category}
          industry={industry}
          sort={sort}
          q={q}
        />


        {q && (
          <p className="mb-5 text-[12px] text-[#948d85]">
            Search results for “{q}”
          </p>
        )}

        {data.results.length === 0 ? (
          <div className="py-20 text-sm text-[#948d85]">No posts yet.</div>
        ) : (
          <div className="space-y-4">
            {data.results.map((post) => {
              const thumbnailSrc =
                post.thumbnail_small_url || post.thumbnail_url;

              return (
                <div
                  key={post.id}
                  className="flex gap-3 border-b border-[#e7e0d7] pb-4"
                >
                  {thumbnailSrc && (
                    <Link
                      href={`/board/${post.pretty_slug}`}
                      className="h-[66px] w-[88px] shrink-0 overflow-hidden bg-[#e8e1d8]"
                    >
                      <img
                        src={thumbnailSrc}
                        alt=""
                        loading="lazy"
                        className="block h-full w-full object-cover"
                      />
                    </Link>
                  )}

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/board/${post.pretty_slug}`}
                      className="line-clamp-2 block text-[15px] leading-6 text-[#4f4a45]"
                    >
                      {post.title}
                    </Link>

                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#9b948c]">
                      <span className="text-[#b8b0a8]">#{post.id}</span>

                      {industryLabel(post.industry) && (
                        <Link
                          href={buildBoardUrl({
                            category: "all",
                            industry: post.industry || "all",
                            sort,
                            q,
                          })}
                          className={`border-b border-dotted px-0.5 text-[11px] ${industryColor(
                            post.industry
                          )}`}
                        >
                          {industryLabel(post.industry)}
                        </Link>
                      )}

                      <span
                        className={`rounded-full px-1.5 py-px text-[11px] ${categoryColor(
                          post.category
                        )}`}
                      >
                        {categoryLabel(post.category)}
                      </span>

                      <span>{(post.views ?? 0) + (post.views_boost ?? 0)}閲覧</span>

                      <span>
                        <span className="text-[#d8a7b8]">♡</span>
                        {(post.board_likes?.length ?? 0) +
                          (post.like_boost ?? 0)}
                      </span>
                      {post.category === "qa" && (
                        <span>
                          💬 {post.comments?.length ?? 0}
                        </span>
                      )}

                      <span>{formatRelativeTime(post.created_at)}</span>

                      {post.category === "promo" &&
                        getPromoRemainingLabel(post.expires_at) && (
                          <span className="text-[11px] text-[#a80237]">
                            {getPromoRemainingLabel(post.expires_at)}
                          </span>
                        )}
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
                href={buildBoardUrl({
                  category,
                  industry,
                  sort,
                  page: data.page - 1,
                  q,
                })}
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
                href={buildBoardUrl({
                  category,
                  industry,
                  sort,
                  page: data.page + 1,
                  q,
                })}
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
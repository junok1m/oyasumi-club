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
    board_likes?: { id: number }[];
    comments?: { id: number }[];
    like_boost: number;
    views_boost: number;
};

const industries = [
    { value: "fuzoku", label: "風俗" },
    { value: "karaoke", label: "カラオケ" },
    { value: "massage", label: "マッサージ" },
    { value: "club", label: "クラブ" },
    { value: "restaurant", label: "レストラン" },
    { value: "bar", label: "バー" },
];

function buildQnaUrl({
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
    return query ? `/qna?${query}` : "/qna";
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
        ? `「${q}」のQ&A検索結果 | シドニー夜遊び質問掲示板 | おやすみクラブ`
        : location
            ? `${location}の夜遊びQ&A | おやすみクラブ`
            : "シドニー夜遊びQ&A | おやすみクラブ";

    const description = q
        ? `シドニーの夜遊びQ&Aから「${q}」に関連する質問を検索できます。`
        : location
            ? `${location}周辺の風俗・カラオケ・マッサージ・クラブに関する質問を日本語で共有できます。`
            : "シドニーの風俗・カラオケ・マッサージ・クラブに関する質問や体験談を日本語で共有できます。";

    const canonical = buildQnaUrl({
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
            url: "https://www.oyasumi-club.com/qna",
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

function QnaFilter({
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
            <div className="flex gap-2 overflow-x-auto pt-1 pb-1 whitespace-nowrap">
                {industries.map((item) => {
                    const nextIndustry = toggleValue(industry, item.value);
                    const active = selectedIndustries.includes(item.value);

                    return (
                        <Link
                            key={item.value}
                            href={buildQnaUrl({
                                industry: nextIndustry,
                                sort,
                                q,
                                location,
                            })}
                            className={`
                shrink-0
                ${industryStyle(item.value)}
                ${active
                                    ? "shadow-[inset_0_0_0_1px_#7c6f63] opacity-100"
                                    : "opacity-65"
                                }
              `}
                        >
                            {industryLabel(item.value)}
                        </Link>
                    );
                })}
            </div>

            <div className="mt-4 flex justify-end text-[12px]">
                <div className="flex border border-[#ded6cc] bg-[#fbf8f2]">
                    <Link
                        href={buildQnaUrl({
                            industry,
                            sort: "latest",
                            q,
                            location,
                        })}
                        className={
                            sort === "latest"
                                ? "bg-[#e9dfd3] px-3 py-1.5 text-[#4f4a45]"
                                : "px-3 py-1.5 text-[#aaa199]"
                        }
                    >
                        新着順
                    </Link>

                    <Link
                        href={buildQnaUrl({
                            industry,
                            sort: "views",
                            q,
                            location,
                        })}
                        className={
                            sort === "views"
                                ? "bg-[#e9dfd3] px-3 py-1.5 text-[#4f4a45]"
                                : "px-3 py-1.5 text-[#aaa199]"
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
        .eq("category", "qa");

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
        console.error("getQna error:", error);
        return {
            results: [] as (BoardPost & { pretty_slug: string })[],
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

export default async function QnaPage({
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
    const category = "qa";
    const industry = params.industry || "all";
    const location = params.location?.trim() || "";

    const industries =
        industry === "all" ? [] : industry.split(",").filter(Boolean);

    const page = Number(params.page || "1");
    const q = params.q?.trim() || "";

    const data = await getPosts(sort, industries, location, page, q);

    return (
        <main className="min-h-screen bg-[#f7f4ee] text-[#5f5a54]">
            <div className="mx-auto w-[92%] max-w-5xl py-8">
                <h1 className="mb-4 text-[22px] font-medium text-[#4f4a45]">
                    シドニー夜遊びQ&A
                </h1>

                <p className="mb-6 text-[12px] leading-6 text-[#9b948c]">
                    お店選び・料金・雰囲気・働き方など、気になることを日本語で質問できます。
                </p>

                <div className="space-y-6">
                    <SearchBar q={q} category={category} sort={sort} basePath="/qna" />

                    <LocationPills
                        category="qna"
                        basePath="/qna"
                        title="エリアで探す"
                        showTitle={false}
                        currentLocation={location}
                    />

                    <QnaFilter
                        industry={industry}
                        sort={sort}
                        q={q}
                        location={location}
                    />
                </div>

                {q && (
                    <p className="mb-5 text-[12px] text-[#948d85]">
                        「{q}」のQ&A検索結果
                    </p>
                )}

                {data.results.length === 0 ? (
                    <div className="py-20 text-sm text-[#948d85]">
                        まだ質問がありません。
                    </div>
                ) : (
                    <div className="border-t border-[#e7e0d7]">
                        {data.results.map((post) => {
                            const commentCount = post.comments?.length ?? 0;

                            return (
                                <div
                                    key={post.id}
                                    className="border-b border-[#e7e0d7] py-3.5"
                                >
                                    <div className="flex items-baseline gap-2">
                                        <span className="shrink-0 text-[11px] text-[#b8b0a8]">
                                            #{post.id}
                                        </span>

                                        <Link
                                            href={`/board/${post.pretty_slug}`}
                                            className="min-w-0 flex-1 truncate text-[15px] leading-6 text-[#4f4a45]"
                                        >
                                            {post.title}
                                        </Link>
                                    </div>

                                    <div className="ml-8 mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#9b948c]">
                                        {industryLabel(post.industry) && (
                                            <Link
                                                href={buildQnaUrl({
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
                                                href={buildQnaUrl({
                                                    industry,
                                                    sort,
                                                    q,
                                                    location: post.location,
                                                })}
                                                className="text-[#a59b91] underline decoration-dotted underline-offset-2"
                                            >
                                                {post.location}
                                            </Link>
                                        )}
                                        <span className="flex items-center gap-1.5">
                                            <span>💬</span>
                                            <span>{commentCount}</span>
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <span>❤️</span>
                                            <span>
                                                {(post.board_likes?.length ?? 0) + (post.like_boost ?? 0)}
                                            </span>
                                        </span>
                                        <span>
                                            {(post.views ?? 0) + (post.views_boost ?? 0)}閲覧
                                        </span>
                                        <span>{formatRelativeTime(post.created_at)}</span>

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
                                href={buildQnaUrl({
                                    industry,
                                    sort,
                                    page: data.page - 1,
                                    q,
                                    location,
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
                                href={buildQnaUrl({
                                    industry,
                                    sort,
                                    page: data.page + 1,
                                    q,
                                    location,
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
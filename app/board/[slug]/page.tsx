import type { Metadata } from "next";
import Link from "next/link";
import PostActions from "./PostActions";
import { supabaseServer } from "@/lib/supabase-server";
import BackButton from "./BackButton";
import MorePosts from "@/components/board/MorePosts";
import { categoryLabel, categoryColor } from "@/lib/category-style";
import { industryLabel, industryStyle } from "@/lib/industry-style";

type PublicProfile = {
  id: string;
  display_name: string | null;
};

type BoardDetail = {
  id: number;
  author_id: string;
  category: string;
  industry: string | null;
  title: string; 
  slug: string;
  body: string;
  excerpt: string | null;
  views: number;
  like_boost: number;
  views_boost: number;
  created_at: string;
  expires_at: string | null;
  thumbnail_url: string | null;
  profile: {
    display_name: string | null;
  } | null;
};


const SITE_URL = "https://www.oyasumi-club.com";

function getCanonicalSlug(post: { id: number; slug: string | null }) {
  return post.slug ? `${post.id}-${post.slug}` : String(post.id);
}

function getCanonicalUrl(post: { id: number; slug: string | null }) {
  return `${SITE_URL}/board/${getCanonicalSlug(post)}`;
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function getPost(prettySlug?: string): Promise<BoardDetail | null> {
  if (!prettySlug) return null;

  const postId = prettySlug.split("-")[0];

  if (!postId || Number.isNaN(Number(postId))) {
    return null;
  }

  try {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from("board_posts")
      .select(
        `
        id,
        author_id,
        category,
        industry,
        title,
        slug,
        body,
        excerpt,
        views,
        views_boost,
        created_at,
        expires_at,
        thumbnail_url,
        like_boost
        `
      )
      .eq("id", Number(postId))
      .eq("status", "approved")
      .single();

    if (error || !data) {
      console.error("getPost failed:", error);
      return null;
    }

    let profile: { display_name: string | null } | null = null;

    if (data.author_id && data.category !== "qa") {
      const { data: profileData, error: profileError } = await supabase
        .from("public_profiles")
        .select("id, display_name")
        .eq("id", data.author_id)
        .maybeSingle();

      if (profileError) {
        console.error("getPost profile fetch failed:", profileError);
      } else if (profileData) {
        profile = {
          display_name: (profileData as PublicProfile).display_name,
        };
      }
    }

    return {
      id: data.id,
      author_id: data.author_id,
      category: data.category,
      industry: data.industry ?? null,
      title: data.title,
      slug: data.slug,
      body: data.body,
      excerpt: data.excerpt ?? null,
      views: data.views ?? 0,
      views_boost: data.views_boost ?? 0,
      like_boost: data.like_boost ?? 0,
      created_at: data.created_at,
      expires_at: data.expires_at,
      thumbnail_url: data.thumbnail_url,
      profile,
    };
  } catch (error) {
    console.error("getPost failed:", error);
    return null;
  }
}


async function incrementViews(postId: number): Promise<boolean> {
  try {
    const supabase = await supabaseServer();

    const { error } = await supabase.rpc("increment_board_post_views", {
      post_id: postId,
    });

    if (error) {
      console.error("incrementViews failed:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("incrementViews failed:", error);
    return false;
  }
}

function formatDate(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  return `${day}${month}${year}`;
}
function getPromoRemainingLabel(expiresAt: string | null) {
  if (!expiresAt) return null;

  const diffMs = new Date(expiresAt).getTime() - Date.now();

  if (diffMs <= 0) return "掲載終了";

  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 1) return "本日終了";

  return `掲載終了まであと${days}日`;
}

function categorySeoLabel(cat: string) {
  switch (cat) {
    case "news":
      return "ニュース";
    case "blog":
      return "ブログ";
    case "jobs":
      return "求人";
    case "promo":
      return "プロモーション";
    case "qa":
      return "Q&A";
    default:
      return "情報";
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "投稿が見つかりません | おやすみクラブ",
      description:
        "シドニー風俗・夜遊び情報掲示板「おやすみクラブ」の投稿ページです。",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const categoryText = categorySeoLabel(post.category);
  const canonicalUrl = getCanonicalUrl(post);
  const plainBody = stripHtml(post.body || "");

  const descriptionBase =
  post.excerpt?.trim() ||
  plainBody.slice(0, 110) ||
  `シドニーの${categoryText}を掲載している投稿ページです。`;

  const title = `${post.title} | シドニー${categoryText} | おやすみクラブ`;
  const description = `${descriptionBase} シドニーの風俗・夜遊び情報をおやすみクラブでチェック。`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "おやすみクラブ",
      type: "article",
      images: post.thumbnail_url
        ? [
          {
            url: post.thumbnail_url,
            alt: post.title,
          },
        ]
        : undefined,
    },
    twitter: {
      card: post.thumbnail_url ? "summary_large_image" : "summary",
      title,
      description,
      images: post.thumbnail_url ? [post.thumbnail_url] : undefined,
    },
  };
}

export default async function BoardDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return (
      <main className="min-h-screen bg-[#f7f4ee] text-[#5f5a54]">
        <div className="mx-auto w-[92%] max-w-5xl py-6 md:w-[86%] md:py-10">
          <div className="mb-8">
            <Link href="/board" className="block w-fit text-[12px] text-[#8e8a84]">
              ← 掲示板に戻る
            </Link>
          </div>
          <p className="text-sm text-[#948d85]">Post not found.</p>
        </div>
      </main>
    );
  }

  const incremented = await incrementViews(post.id);
  const displayViews =
    (incremented ? post.views + 1 : post.views) + (post.views_boost ?? 0);
  const authorName = post.profile?.display_name || "不明";
  const canonicalUrl = getCanonicalUrl(post);

    return (
  <main className="relative min-h-dvh pb-32 text-[#d6dde7]">
    <div className="pointer-events-none fixed inset-0 -z-10 bg-[#151c28]" />

    <div className="mx-auto w-[92%] max-w-5xl py-6 md:w-[86%] md:py-10">
      <div className="mb-8">
        <BackButton />
      </div>

      <article>
        <h1 className="text-[30px] font-medium leading-[1.18] tracking-[-0.02em] text-slate-100 md:text-[40px]">
          {post.title}
        </h1>

        {post.excerpt?.trim() && (
          <p className="mt-5 max-w-3xl border-l border-slate-700 pl-4 text-[15px] leading-7 text-slate-400">
            {post.excerpt.trim()}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-slate-400">
          {industryLabel(post.industry) && (
            <span className={industryStyle(post.industry)}>
              {industryLabel(post.industry)}
            </span>
          )}

          <span className={categoryColor(post.category)}>
            {categoryLabel(post.category)}
          </span>

          {post.category === "promo" &&
            getPromoRemainingLabel(post.expires_at) && (
              <span className="ml-1 text-[10px] text-amber-300">
                {getPromoRemainingLabel(post.expires_at)}
              </span>
            )}

          {post.category !== "qa" && authorName !== "不明" && (
            <Link
              href={`/user/${encodeURIComponent(authorName)}`}
              className="border-b border-dotted border-cyan-400/40 text-cyan-300"
            >
              {authorName}
            </Link>
          )}

          <span>{formatDate(post.created_at)}</span>
          <span className="text-slate-500">{displayViews} 閲覧</span>
        </div>

        {post.thumbnail_url && (
          <img
            src={post.thumbnail_url}
            alt={post.title}
            className="mt-8 w-full max-w-3xl border border-slate-700 object-cover"
          />
        )}

        <div
          className="space-y-4 text-sm leading-7 text-slate-300
            [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-100
            [&_h3]:mt-6 [&_h3]:font-medium [&_h3]:text-slate-100
            [&_p]:my-3
            [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-5
            [&_li]:my-1
            [&_a]:cursor-pointer [&_a]:text-cyan-300 [&_a]:underline [&_a]:underline-offset-2
            [&_hr]:my-8 [&_hr]:border-slate-700
            [&_strong]:font-semibold [&_strong]:text-slate-100
            [&_img]:my-6
            [&_img]:h-auto
            [&_img]:w-full
            [&_img]:border
            [&_img]:border-dotted
            [&_img]:border-slate-700
            [&_img]:bg-[#1b2433]"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        <div className="mt-12 border-slate-700 pt-6">
          <PostActions
            url={canonicalUrl}
            title={post.title}
            postId={post.id}
            likeBoost={post.like_boost ?? 0}
          />
        </div>

        <MorePosts
          dark
          currentPostId={post.id}
          category={post.category}
          industry={post.industry}
        />
      </article>
    </div>
  </main>
);
}
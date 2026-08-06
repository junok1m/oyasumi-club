import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostActions from "@/app/board/[slug]/PostActions";
import MorePosts from "@/components/board/MorePosts";
import BottomNavGirls from "@/app/girls/_components/BottomNavGirls";
import { supabaseServer } from "@/lib/supabase-server";
import { categoryLabel, categoryColor } from "@/lib/category-style";
import { industryLabel, industryStyle } from "@/lib/industry-style";

type BoardDetail = {
  id: number;
  author_id: string;
  category: string;
  industry: string | null;
  title: string;
  slug: string | null;
  body: string;
  excerpt: string | null;
  views: number;
  like_boost: number;
  views_boost: number;
  created_at: string;
  expires_at: string | null;
  thumbnail_url: string | null;
};

const SITE_URL = "https://www.oyasumi-club.com";

function getCanonicalSlug(post: { id: number; slug: string | null }) {
  return post.slug ? `${post.id}-${post.slug}` : String(post.id);
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function getPost(prettySlug?: string): Promise<BoardDetail | null> {
  if (!prettySlug) return null;
  const postId = prettySlug.split("-")[0];
  if (!postId || Number.isNaN(Number(postId))) return null;

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("board_posts")
    .select(
      `
      id, author_id, category, industry, title, slug, body, excerpt,
      views, views_boost, created_at, expires_at, thumbnail_url, like_boost
      `
    )
    .eq("id", Number(postId))
    .eq("status", "approved")
    .eq("category", "jobs")
    .single();

  if (error || !data) return null;

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
  };
}

async function incrementViews(postId: number) {
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("increment_board_post_views", {
    post_id: postId,
  });
  if (error) {
    console.error("incrementViews failed:", error);
    return false;
  }
  return true;
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
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
      robots: { index: false, follow: false },
    };
  }

  const plainBody = stripHtml(post.body || "");
  const description =
    post.excerpt?.trim() ||
    plainBody.slice(0, 120) ||
    "シドニーで働く女の子向けの求人です。";
  const canonicalUrl = `${SITE_URL}/jobs/${getCanonicalSlug(post)}`;

  return {
    title: `${post.title} | 求人 | おやすみクラブ`,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: post.title,
      description,
      url: canonicalUrl,
      siteName: "おやすみクラブ",
      type: "article",
      images: post.thumbnail_url
        ? [{ url: post.thumbnail_url, alt: post.title }]
        : undefined,
    },
    twitter: {
      card: post.thumbnail_url ? "summary_large_image" : "summary",
      title: post.title,
      description,
      images: post.thumbnail_url ? [post.thumbnail_url] : undefined,
    },
  };
}

export default async function JobsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const incremented = await incrementViews(post.id);
  const displayViews =
    (incremented ? post.views + 1 : post.views) + (post.views_boost ?? 0);
  const canonicalUrl = `${SITE_URL}/jobs/${getCanonicalSlug(post)}`;

  return (
    <main className="-mb-24 min-h-dvh bg-[#fff3f8] pb-32 text-[#5f4d5c]">
      <div className="mx-auto w-[92%] max-w-5xl py-6 md:w-[86%] md:py-10">
        <div className="mb-8">
          <Link href="/jobs" className="block w-fit text-[12px] text-pink-500">
            ← 求人一覧へ戻る
          </Link>
        </div>

        <article>
          <div className="mb-3 text-[12px] font-medium text-pink-400">
            💜 Oyasumi Girls
          </div>

          <h1 className="text-[30px] font-medium leading-[1.18] tracking-[-0.02em] text-[#4f3a4f] md:text-[40px]">
            {post.title}
          </h1>

          {post.excerpt?.trim() && (
            <p className="mt-5 max-w-3xl border-l border-pink-200 pl-4 text-[15px] leading-7 text-[#9b7892]">
              {post.excerpt.trim()}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#9b7892]">
            {industryLabel(post.industry) && (
              <span className={industryStyle(post.industry)}>
                {industryLabel(post.industry)}
              </span>
            )}
            <span className={categoryColor(post.category)}>
              {categoryLabel(post.category)}
            </span>
            <span>{formatDate(post.created_at)}</span>
            <span className="text-[#b28aa8]">{displayViews} 閲覧</span>
          </div>

          {post.thumbnail_url && (
            <img
              src={post.thumbnail_url}
              alt={post.title}
              className="mt-8 w-full max-w-3xl rounded-3xl border border-pink-100 bg-white/70 object-cover"
            />
          )}

          <div
            className="
              mt-8 space-y-4 text-sm leading-7 text-[#5f4d5c]
              [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold
              [&_h3]:mt-6 [&_h3]:font-medium
              [&_p]:my-3
              [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-5
              [&_li]:my-1
              [&_a]:text-[#a8739b] [&_a]:underline [&_a]:underline-offset-2
              [&_hr]:my-8 [&_hr]:border-pink-100
              [&_strong]:font-semibold
              [&_img]:my-6 [&_img]:w-full [&_img]:h-auto
              [&_img]:border [&_img]:border-dotted [&_img]:border-pink-100
            "
            dangerouslySetInnerHTML={{ __html: post.body }}
          />

          <div className="mt-12 border-pink-100 pt-6">
            <PostActions
              url={canonicalUrl}
              title={post.title}
              postId={post.id}
              likeBoost={post.like_boost ?? 0}
            />
          </div>

          <MorePosts
            currentPostId={post.id}
            category={post.category}
            industry={post.industry}
            basePath="/jobs"
          />
        </article>
      </div>
      <BottomNavGirls />
    </main>
  );
}

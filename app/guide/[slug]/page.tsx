import { notFound } from "next/navigation";
import { supabasePublic } from "@/lib/supabase-public";
import PostActions from "./PostActions";
import type { Metadata } from "next";
import MoreGuides from "@/components/guide/MoreGuides";

export const revalidate = 60;

type GuidePost = {
  id: number;
  title: string;
  body: string | null;
  excerpt: string | null;
  industry: string | null;
  location: string | null;
  sponsor_name: string | null;
  website_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const id = Number(slug.split("-")[0]);

  if (!id) {
    return {
      title: "Guide | おやすみクラブ",
      description:
        "シドニーの夜遊び・夜職求人・ナイトライフ情報を日本語でチェック。",
    };
  }

  const supabase = supabasePublic();

  const { data: post } = await supabase
    .from("guide_posts")
    .select("id, title, body, excerpt, thumbnail_url")
    .eq("id", id)
    .eq("status", "approved")
    .single<Pick<GuidePost, "id" | "title" | "body" | "excerpt" | "thumbnail_url">>();

  if (!post) {
    return {
      title: "Guide | おやすみクラブ",
      description:
        "シドニーの夜遊び・夜職求人・ナイトライフ情報を日本語でチェック。",
    };
  }

  const description =
    post.excerpt ||
    post.body?.replace(/<[^>]*>/g, "").slice(0, 150) ||
    "シドニーの夜遊び・ナイトライフ情報を日本語で紹介。";

  const url = `https://www.oyasumi-club.com/guide/${slug}`;

  return {
    title: `${post.title} | おやすみクラブ`,
    description,
    openGraph: {
      title: post.title,
      description,
      url,
      siteName: "おやすみクラブ",
      type: "article",
      locale: "ja_JP",
      images: post.thumbnail_url
        ? [
            {
              url: post.thumbnail_url,
              width: 1200,
              height: 1800,
              alt: post.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: post.thumbnail_url ? [post.thumbnail_url] : [],
    },
  };
}
export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const id = Number(slug.split("-")[0]);

  if (!id) notFound();

  const supabase = supabasePublic();

  const { data: post, error } = await supabase
    .from("guide_posts")
    .select(
      `
      id,
      title,
      body,
      excerpt,
      industry,
      location,
      sponsor_name,
      website_url,
      thumbnail_url,
      created_at
      `
    )
    .eq("id", id)
    .eq("status", "approved")
    .single<GuidePost>();

  if (error || !post) notFound();

  return (
  <main className="relative min-h-dvh pb-32 text-[#d6dde7]">
  <div className="pointer-events-none fixed inset-0 -z-10 bg-[#151c28]" />

  <article className="mx-auto w-[92%] max-w-3xl py-8">
      {post.thumbnail_url && (
        <img
          src={post.thumbnail_url}
          alt={post.title}
          className="mb-6 aspect-[2/3] w-full bg-[#1b2433] object-cover"
        />
      )}

      <h1 className="text-[24px] font-medium leading-9 text-slate-100">
        {post.title}
      </h1>

      {post.excerpt && (
        <p className="mt-4 text-[14px] leading-7 text-slate-400">
          {post.excerpt}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-slate-500">
        {post.location && <span>{post.location}</span>}
        {post.sponsor_name && <span>紹介: {post.sponsor_name}</span>}
      </div>

      {post.website_url && (
        <a
          href={post.website_url}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-[13px] font-medium text-cyan-300 transition hover:bg-cyan-400/20"
        >
          公式サイトを見る
        </a>
      )}

      <div
        className="
          mt-8 space-y-5 text-[15px] leading-8 text-slate-300
          [&_a]:text-cyan-300 [&_a]:underline
          [&_h2]:mt-8 [&_h2]:text-[20px] [&_h2]:font-medium [&_h2]:text-slate-100
          [&_h3]:mt-6 [&_h3]:text-[17px] [&_h3]:font-medium [&_h3]:text-slate-100
          [&_li]:ml-5 [&_ul]:list-disc
          [&_strong]:text-slate-100
        "
        dangerouslySetInnerHTML={{ __html: post.body || "" }}
      />

      <PostActions
        url={`https://www.oyasumi-club.com/guide/${slug}`}
        title={post.title}
      />

      <MoreGuides
        currentGuideId={post.id}
        industry={post.industry}
        location={post.location}
      />

    </article>
  </main>
);
}

import React from "react";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import HomeFeedSection from "./HomeFeedSection";
import FeaturedCarousel from "./FeaturedCarousel";

type BoardPost = {
  id: number;
  title: string;
  category: string;
  views: number;
  created_at: string;
  pretty_slug: string;
};

type FeaturedPost = {
  id: number;
  title: string;
  category: string;
  views: number;
  created_at: string;
  pretty_slug: string;
  thumbnail: string | null;
};

type FeedPost = {
  id: number;
  image: string;
  caption?: string;
  created_at: string;
};

async function getFeaturedPosts(): Promise<FeaturedPost[]> {
  const { data, error } = await supabaseServer
    .from("board_posts")
    .select("id, title, category, views, created_at, slug, thumbnail_url")
    .eq("is_featured", true)
    .not("thumbnail_url", "is", null)
    .neq("thumbnail_url", "")
    .order("created_at", { ascending: false })
    .limit(3);

  if (error || !data) {
    console.error("getFeaturedPosts error:", error);
    return [];
  }

  return data.map((post) => ({
    id: post.id,
    title: post.title,
    category: post.category,
    views: post.views,
    created_at: post.created_at,
    pretty_slug: post.slug ? `${post.id}-${post.slug}` : `${post.id}`,
    thumbnail: post.thumbnail_url,
  }));
}

async function getPopularPosts(): Promise<BoardPost[]> {
  const { data, error } = await supabaseServer
    .from("board_posts")
    .select("id, title, category, views, created_at, slug")
    .order("views", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5);

  if (error || !data) {
    console.error("getPopularPosts error:", error);
    return [];
  }

  return data.map((post) => ({
    id: post.id,
    title: post.title,
    category: post.category,
    views: post.views,
    created_at: post.created_at,
    pretty_slug: post.slug ? `${post.id}-${post.slug}` : `${post.id}`,
  }));
}

async function getLatestFeed(): Promise<FeedPost[]> {
  const { data, error } = await supabaseServer
    .from("feed_posts")
    .select("id, image_url, caption, created_at")
    .order("created_at", { ascending: false })
    .limit(6);

  if (error || !data) {
    console.error("getLatestFeed error:", error);
    return [];
  }

  return data.map((post) => ({
    id: post.id,
    image: post.image_url,
    caption: post.caption ?? undefined,
    created_at: post.created_at,
  }));
}

export default async function HomePage() {
  const [featuredPosts, posts, feeds] = await Promise.all([
    getFeaturedPosts(),
    getPopularPosts(),
    getLatestFeed(),
  ]);

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#5f5a54]">
      <div className="mx-auto w-[92%] max-w-5xl py-10 space-y-14">
        {featuredPosts.length > 0 && (
          <FeaturedCarousel posts={featuredPosts} />
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] text-[#4f4a45]">Hot Posts ♡</h2>
            <Link href="/board" className="text-sm text-[#8b847b] hover:text-[#4f4a45]">
              View all
            </Link>
          </div>

          {posts.length === 0 ? (
            <p className="text-sm text-[#999]">No posts yet.</p>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/board/${post.pretty_slug}`}
                  className="block border-b border-[#e8e1d8] pb-3"
                >
                  <p className="text-[14px] text-[#4f4a45]">{post.title}</p>
                  <p className="mt-1 text-[11px] text-[#999]">
                    {post.category} · {post.views} views
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <HomeFeedSection />
      </div>
    </main>
  );
}
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type FeedPost = {
  id: number;
  image_url: string;
  caption: string | null;
  created_at: string;
  expires_at: string;
  author: {
    display_name: string | null;
  } | null;
};

type Me = {
  id: string;
  display_name: string | null;
  role: string | null;
};

type LikeRow = {
  post_id: number;
  user_id: string;
};

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "just now";
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString();
}

function formatTimeLeft(expiresAt: string) {
  const expires = new Date(expiresAt);
  const now = new Date();

  const diffMs = expires.getTime() - now.getTime();

  if (diffMs <= 0) return "expired";

  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

  return `${diffHours}h left`;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMemberOnly, setIsMemberOnly] = useState(false);

  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
  const [likedPostIds, setLikedPostIds] = useState<Set<number>>(new Set());
  const [likingPostId, setLikingPostId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setIsMemberOnly(true);
          return;
        }

        const { data: meData } = await supabase
          .from("profiles")
          .select("id, display_name, role")
          .eq("id", user.id)
          .single();

        setMe(meData ?? null);

        const { data: feedData, error: feedError } = await supabase
          .from("feed_posts")
          .select(`
  id,
  image_url,
  caption,
  created_at,
  expires_at,
  author:profiles (
    display_name
  )
`)
          .order("created_at", { ascending: false });

        if (feedError) {
          console.error("Failed to load feed:", feedError);
          return;
        }

        const safePosts = (feedData ?? []) as unknown as FeedPost[];
setPosts(safePosts);

        const postIds = safePosts.map((post) => post.id);

        if (postIds.length === 0) {
          setLikeCounts({});
          setLikedPostIds(new Set());
          return;
        }

        const { data: likesData, error: likesError } = await supabase
          .from("feed_likes")
          .select("post_id, user_id")
          .in("post_id", postIds);

        if (likesError) {
          console.error("Failed to load likes:", likesError);
          return;
        }

        const counts: Record<number, number> = {};
        const liked = new Set<number>();

        (likesData as LikeRow[] | null)?.forEach((like) => {
          counts[like.post_id] = (counts[like.post_id] ?? 0) + 1;

          if (like.user_id === user.id) {
            liked.add(like.post_id);
          }
        });

        setLikeCounts(counts);
        setLikedPostIds(liked);
      } catch (error) {
        console.error("Failed to load feed:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function toggleLike(postId: number) {
    if (!me || likingPostId) return;

    const alreadyLiked = likedPostIds.has(postId);

    setLikingPostId(postId);

    const nextLiked = new Set(likedPostIds);
    const nextCounts = { ...likeCounts };

    if (alreadyLiked) {
      nextLiked.delete(postId);
      nextCounts[postId] = Math.max((nextCounts[postId] ?? 1) - 1, 0);
    } else {
      nextLiked.add(postId);
      nextCounts[postId] = (nextCounts[postId] ?? 0) + 1;
    }

    setLikedPostIds(nextLiked);
    setLikeCounts(nextCounts);

    try {
      if (alreadyLiked) {
        const { error } = await supabase
          .from("feed_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", me.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("feed_likes").insert({
          post_id: postId,
          user_id: me.id,
        });

        if (error) throw error;
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);

      setLikedPostIds(likedPostIds);
      setLikeCounts(likeCounts);
    } finally {
      setLikingPostId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#5f5a54]">
      <div className="mx-auto w-[92%] max-w-5xl py-8 pb-28">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-medium text-[#4f4a45]">女の子の写メ日記</h1>
            <p className="mt-1 text-[12px] text-[#9a948d]">
              会員限定の画像フィードになります。
            </p>
          </div>

          {me?.role === "girl" && (
            <Link
  href="/feed/upload"
  className="relative text-[13px] text-[#5f5a54] border-b border-dotted border-[#cfc6bb] transition hover:text-[#4f4a45] hover:border-[#c78fa0] before:content-['✧'] before:absolute before:-left-4 before:-top-2 before:text-[10px] before:text-[#d2a6b4] before:animate-pulse after:content-['✦'] after:absolute after:-right-4 after:-top-2 after:text-[10px] after:text-[#c78fa0] after:animate-pulse"
>
  投稿
</Link>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-sm text-[#948d85]">Loading...</div>
        ) : isMemberOnly ? (
          <div className="rounded-3xl border border-[#e7e1d8] bg-[#fffaf2] px-5 py-16 text-center">
            <p className="text-[14px] text-[#6f6a64]">会員限定のスペースです。</p>
            <p className="mt-2 text-[12px] text-[#a39b92]">
              フィードを見るにはログインまたは会員登録をお願いします ✧
            </p>

            <div className="mt-5 flex justify-center gap-4">
              <Link href="/login" className="text-[13px] text-[#c78fa0]">
                login
              </Link>
              <Link href="/signup" className="text-[13px] text-[#c78fa0]">
                sign up
              </Link>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#ddd4ca] py-20 text-center text-sm text-[#948d85]">
            まだ投稿がありません。最初の投稿をしてみませんか？
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {posts.map((post) => {
              const liked = likedPostIds.has(post.id);
              const count = likeCounts[post.id] ?? 0;
              const displayName = post.author?.display_name ?? null;

              return (
                <article key={post.id} className="space-y-2">
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#eee8df]">
                    <img
                      src={post.image_url}
                      alt={post.caption || "feed image"}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => toggleLike(post.id)}
                      disabled={likingPostId === post.id}
                      className={`absolute bottom-2 right-2 rounded-full bg-white/70 px-3 py-1 text-[13px] shadow-sm backdrop-blur-md transition-transform duration-150 ease-out active:scale-75 active:brightness-90 hover:bg-white disabled:opacity-50 ${
                        liked ? "text-[#c78fa0]" : "text-[#c78fa0]"
                      }`}
                    >
                      {liked ? "♥" : "♡"} {count}
                    </button>
                  </div>

                  {(post.caption || displayName) && (
                    <p className="line-clamp-2 text-[13px] leading-5 text-[#5b5650]">
                      {displayName ? (
                        <Link href={`/user/${encodeURIComponent(displayName)}`}>
                          <span className="font-medium text-[#4f4a45] underline decoration-dotted underline-offset-2">
                            {displayName}
                          </span>
                        </Link>
                      ) : (
                        <span className="font-medium text-[#4f4a45]">
                          unknown
                        </span>
                      )}

                      {post.caption && (
                        <>
                          :{" "}
                          <span className="text-[#5b5650]">
                            {post.caption}
                          </span>
                        </>
                      )}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-[#a39b92]">
                    <span>{formatTime(post.created_at)}</span>
                    <span className="text-[#c78fa0]">
                      ⏳ {formatTimeLeft(post.expires_at)}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
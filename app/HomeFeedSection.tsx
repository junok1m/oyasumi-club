"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type FeedPost = {
  id: number;
  image: string;
  caption?: string;
  created_at: string;
};

export default function HomeFeedSection() {
  const [feeds, setFeeds] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    async function fetchFeed() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("feed_posts")
          .select("id, image_url, caption, created_at")
          .order("created_at", { ascending: false })
          .limit(6);

        if (error) {
          console.error("Failed to fetch feed:", error);
          setFeeds([]);
          return;
        }

        const mapped = (data ?? []).map((post) => ({
          id: post.id,
          image: post.image_url,
          caption: post.caption ?? undefined,
          created_at: post.created_at,
        }));

        setFeeds(mapped);
      } catch (error) {
        console.error("Failed to fetch feed:", error);
        setFeeds([]);
      } finally {
        setLoading(false);
      }
    }

    fetchFeed();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchFeed();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] text-[#4f4a45]">New Feed ♡</h2>
        <Link
          href="/feed"
          className="text-sm text-[#8b847b] hover:text-[#4f4a45]"
        >
          View all
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-[#999]">Loading...</p>
      ) : unauthorized ? (
        <p className="text-sm text-[#999]">
          Please{" "}
          <Link href="/login" className="underline hover:text-[#4f4a45]">
            log in
          </Link>{" "}
          to check what's HOT today.
        </p>
      ) : feeds.length === 0 ? (
        <p className="text-sm text-[#999]">No feed yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {feeds.map((post) => (
            <div
              key={post.id}
              className="aspect-square overflow-hidden bg-[#eee]"
            >
              <img
                src={post.image}
                alt={post.caption || "Feed image"}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
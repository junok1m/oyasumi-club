"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/api";

type FeedPost = {
  id: number;
  image: string;
  caption: string;
  created_at: string;
};

type Me = {
  id: number;
  username: string;
  role: string | null;
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

export default function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMemberOnly, setIsMemberOnly] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function load() {
      try {
        const feedRes = await fetch(`${API_BASE}/api/feed/`, {
          headers: token
            ? {
                Authorization: `Token ${token}`,
              }
            : {},
        });

        if (feedRes.status === 401) {
          setIsMemberOnly(true);
          setLoading(false);
          return;
        }

        if (!feedRes.ok) {
          setLoading(false);
          return;
        }

        const feedData = await feedRes.json();
        setPosts(feedData);

        if (token) {
          const meRes = await fetch(`${API_BASE}/api/me/`, {
            headers: {
              Authorization: `Token ${token}`,
            },
          });

          if (meRes.ok) {
            const meData = await meRes.json();
            setMe(meData);
          }
        }
      } catch (error) {
        console.error("Failed to load feed:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#5f5a54]">
      <div className="mx-auto w-[92%] max-w-5xl py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-[22px] font-medium text-[#4f4a45]">Feed</h1>

          {me?.role === "girl" && (
            <Link
              href="/feed/upload"
              className="text-[13px] text-[#24c256] hover:text-[#3f3a35] transition"
            >
              ✨ upload mine ✨
            </Link>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-sm text-[#948d85]">Loading...</div>
        ) : isMemberOnly ? (
          <div className="py-20 text-center">
            <p className="text-[14px] text-[#6f6a64]">회원 전용 공간입니다.</p>
            <p className="mt-2 text-[12px] text-[#a39b92]">
              피드를 보려면 로그인 또는 회원가입을 해주세요.
            </p>

            <div className="mt-5 flex justify-center gap-4">
              <Link
                href="/login"
                className="text-[13px] text-[#24c256] hover:text-[#3f3a35] transition"
              >
                login
              </Link>
              <Link
                href="/signup"
                className="text-[13px] text-[#24c256] hover:text-[#3f3a35] transition"
              >
                sign up
              </Link>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-sm text-[#948d85]">No feed yet.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {posts.map((post) => (
              <div key={post.id} className="space-y-2">
                <div className="aspect-square overflow-hidden bg-[#eee]">
                  <img
                    src={post.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>

                {post.caption && (
                  <p className="text-[13px] leading-5 text-[#5b5650] line-clamp-2">
                    {post.caption}
                  </p>
                )}

                <p className="text-[11px] text-[#a39b92]">
                  {formatTime(post.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
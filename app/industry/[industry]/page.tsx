// app/industry/[industry]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import {
  categoryLabel,
} from "@/lib/category-style";

type Params = {
  params: Promise<{
    industry: string;
  }>;
};

const industryMap: Record<
  string,
  {
    label: string;
    emoji: string;
  }
> = {
  fuzoku: {
    label: "風俗",
    emoji: "🏩",
  },
  massage: {
    label: "マッサージ",
    emoji: "💆🏻‍♂️",
  },
  karaoke: {
    label: "カラオケ",
    emoji: "🎤",
  },
  bar: {
    label: "バー・レストラン・クラブ",
    emoji: "🍺",
  },
  restaurant: {
    label: "レストラン",
    emoji: "🍜",
  },
  club: {
    label: "クラブ",
    emoji: "🪩",
  },
};

export default async function IndustryPage({ params }: Params) {
  const { industry } = await params;

  const industryInfo = industryMap[industry];

  if (!industryInfo) {
    notFound();
  }

  const supabase = await supabaseServer();

  const industries =
    industry === "bar"
      ? ["bar", "restaurant"]
      : [industry];

  const [{ data: guidePosts }, { data: boardPosts }] =
    await Promise.all([
      supabase
        .from("guide_posts")
        .select(`
          id,
          title,
          slug,
          excerpt,
          thumbnail_small_url,
          thumbnail_url,
          created_at
        `)
        .in("industry", industries)
        .order("created_at", { ascending: false })
        .limit(4),

      supabase
        .from("board_posts")
        .select(`
          id,
          title,
          slug,
          category,
          thumbnail_small_url,
          thumbnail_url,
          created_at
        `)
        .eq("status", "approved")
        .in("industry", industries)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  return (
  <main className="relative min-h-dvh text-[#d6dde7]">
    <div className="pointer-events-none fixed inset-0 z-0 bg-[#151c28]" />

    <div className="relative z-10 mx-auto w-[92%] max-w-5xl pb-32 pt-6">
      {/* header */}
      <section className="mb-8">
        <p className="text-[13px] text-slate-400">
          Industry Hub
        </p>

        <h1 className="mt-1 text-[24px] font-medium text-slate-100">
          {industryInfo.emoji} {industryInfo.label}
        </h1>

        <p className="mt-3 text-[14px] leading-7 text-slate-400">
          シドニーの{industryInfo.label}
          情報・求人・プロモーション・Q&Aをまとめています。
        </p>
      </section>

      {/* guides */}
      {!!guidePosts?.length && (
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[16px] font-medium text-slate-100">
              ガイド
            </h2>

            <Link href="/guide" className="text-[12px] text-cyan-300">
              もっと見る →
            </Link>
          </div>

          <div className="space-y-4">
            {guidePosts.map((post) => {
              const thumbnail = post.thumbnail_small_url || post.thumbnail_url;

              const prettySlug = post.slug
                ? `${post.id}-${post.slug}`
                : `${post.id}`;

              return (
                <Link
                  key={post.id}
                  href={`/guide/${prettySlug}`}
                  className="block rounded-2xl border border-slate-700 bg-[#1b2433] p-3 active:bg-[#202c3d]"
                >
                  <div className="flex gap-3">
                    {thumbnail && (
                      <img
                        src={thumbnail}
                        alt=""
                        className="h-20 w-28 shrink-0 rounded-xl bg-slate-800 object-cover"
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-[15px] font-medium leading-6 text-slate-100">
                        {post.title}
                      </h3>

                      {post.excerpt && (
                        <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-slate-400">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* board posts */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[16px] font-medium text-slate-100">
            最近の投稿
          </h2>

          <Link
            href={`/board?industry=${industry}`}
            className="text-[12px] text-cyan-300"
          >
            掲示板を見る →
          </Link>
        </div>

        <div className="space-y-3">
          {boardPosts?.map((post) => {
            const prettySlug = post.slug
              ? `${post.id}-${post.slug}`
              : `${post.id}`;

            const thumbnail = post.thumbnail_small_url || post.thumbnail_url;

            return (
              <Link
                key={post.id}
                href={`/board/${prettySlug}`}
                className="block rounded-2xl border border-slate-700 bg-[#1b2433] p-3 active:bg-[#202c3d]"
              >
                <div className="flex gap-3">
                  {thumbnail && (
                    <img
                      src={thumbnail}
                      alt=""
                      className="h-16 w-20 shrink-0 rounded-xl bg-slate-800 object-cover"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 text-[11px] text-cyan-300">
                      {categoryLabel(post.category)}
                    </div>

                    <h3 className="line-clamp-2 text-[14px] leading-6 text-slate-100">
                      {post.title}
                    </h3>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  </main>
);
}
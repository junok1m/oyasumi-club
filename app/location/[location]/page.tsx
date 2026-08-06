// app/location/[location]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { categoryLabel } from "@/lib/category-style";

type Params = {
  params: Promise<{
    location: string;
  }>;
};

export default async function LocationPage({ params }: Params) {
  const { location } = await params;

  const decodedLocation = decodeURIComponent(location);

  if (!decodedLocation) {
    notFound();
  }

  const supabase = await supabaseServer();

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
        .eq("location", decodedLocation)
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
        .eq("location", decodedLocation)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  return (
  // 1차 추천
// 2차 추천
<main className="min-h-dvh bg-[#151c28] pb-32 text-[#d6dde7]">
  <div className="mx-auto w-[92%] max-w-5xl pt-6">
      {/* header */}
      <section className="mb-8">
        <p className="text-[13px] text-slate-400">
          Location Hub
        </p>

        <h1 className="mt-1 text-[24px] font-medium text-slate-100">
          📍 {decodedLocation}
        </h1>

        <p className="mt-3 text-[14px] leading-7 text-slate-400">
          {decodedLocation}
          のガイド・求人・プロモーション・Q&Aをまとめています。
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
              const prettySlug = post.slug ? `${post.id}-${post.slug}` : `${post.id}`;

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
            href={`/board?location=${encodeURIComponent(decodedLocation)}`}
            className="text-[12px] text-cyan-300"
          >
            掲示板を見る →
          </Link>
        </div>

        <div className="space-y-3">
          {boardPosts?.map((post) => {
            const prettySlug = post.slug ? `${post.id}-${post.slug}` : `${post.id}`;
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
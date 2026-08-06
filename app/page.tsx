import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { industryLabel, industryStyle } from "@/lib/industry-style";
import SearchBar from "@/components/SearchBar";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "おやすみクラブ | シドニーで働く女の子の情報交換所",
  description:
    "シドニーで働く女の子のためのQ&A・求人・口コミ・ノウハウ。ひとりで抱え込まず、先輩のリアルな話を見ていってね。",
  alternates: {
    canonical: "https://www.oyasumi-club.com",
  },
};

const LINE_URL = "https://line.me/R/ti/p/@460vwxuh";

function prettySlug(post: { id: number; slug: string | null }) {
  return post.slug ? `${post.id}-${post.slug}` : `${post.id}`;
}

function formatDate(dateString?: string | null) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
  });
}

export default async function HomePage() {
  const [
    { data: qnaPosts },
    { data: tipsPosts },
    { data: jobs },
    { data: reviews },
    { count: qnaCount },
    { count: jobsCount },
    { count: reviewsCount },
    { count: blogCount },
  ] = await Promise.all([
    supabase
      .from("board_posts")
      .select("id, title, slug, created_at, comments(count)")
      .eq("status", "approved")
      .eq("category", "qa")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("board_posts")
      .select(
        "id, title, excerpt, slug, created_at, thumbnail_url, thumbnail_small_url"
      )
      .eq("status", "approved")
      .eq("category", "blog")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("board_posts")
      .select("id, title, slug, location, industry, created_at")
      .eq("status", "approved")
      .eq("category", "jobs")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("board_posts")
      .select("id, title, slug, location, industry, created_at")
      .eq("status", "approved")
      .eq("category", "review")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("board_posts")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")
      .eq("category", "qa"),
    supabase
      .from("board_posts")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")
      .eq("category", "jobs"),
    supabase
      .from("board_posts")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")
      .eq("category", "review"),
    supabase
      .from("board_posts")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")
      .eq("category", "blog"),
  ]);

  return (
    <main className="min-h-dvh bg-[#fff7fa] text-[#4f3a4f]">
      {/* Hero — compact */}
      <section className="mx-auto w-[92%] max-w-5xl pt-8 pb-4">
        <h1 className="text-[22px] font-bold leading-snug tracking-[-0.03em] md:text-[32px]">
          ひとりで抱えなくていいよ。
        </h1>
        <p className="mt-2 text-[13px] leading-6 text-[#9b7892] md:text-sm">
          シドニーで働く女の子の情報交換所。
          <br className="md:hidden" />
          先輩のリアルな話、見ていってね。
        </p>

        <div className="mt-5">
          <SearchBar audience="girls" placeholder="求人・Q&A・口コミを検索..." />
        </div>

        <div className="mt-5 flex gap-2">
          <Link
            href="/jobs"
            className="rounded-full bg-[#4f3a4f] px-5 py-2.5 text-sm font-bold text-white"
          >
            求人を見る
          </Link>
          <Link
            href="/board/write?category=qa"
            className="rounded-full border border-pink-200 bg-white px-5 py-2.5 text-sm font-bold text-[#4f3a4f]"
          >
            質問する
          </Link>
        </div>

        {/* Quick links — not fake stat cards */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-1 text-[13px]">
          {[
            { label: "Q&A", href: "/qna", count: qnaCount },
            { label: "求人", href: "/jobs", count: jobsCount },
            { label: "口コミ", href: "/reviews", count: reviewsCount },
            { label: "記事", href: "/blog", count: blogCount },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full border border-pink-100 bg-white px-4 py-2 font-medium text-[#4f3a4f]"
            >
              {item.label}
              {typeof item.count === "number" && item.count > 0 && (
                <span className="ml-1.5 text-[#b28aa8]">{item.count}</span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Q&A first */}
      <section className="mx-auto mt-8 w-[92%] max-w-5xl">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold text-pink-400">みんなの相談</p>
            <h2 className="text-lg font-bold">最近のQ&A</h2>
          </div>
          <Link href="/qna" className="text-[13px] font-bold text-pink-500">
            もっと見る →
          </Link>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white">
          {(qnaPosts ?? []).length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[#9b7892]">
              まだ質問がありません。最初の質問を書いてみてね。
            </p>
          ) : (
            <div className="divide-y divide-pink-50">
              {(qnaPosts ?? []).map((post) => {
                const replies = post.comments?.[0]?.count ?? 0;
                return (
                  <Link
                    key={post.id}
                    href={`/qna/${prettySlug(post)}#comments`}
                    className="block px-4 py-3.5 transition hover:bg-pink-50/50"
                  >
                    <div className="flex items-center gap-2 text-[11px] text-pink-500">
                      <span className="font-semibold">{replies}件の回答</span>
                      <span className="text-[#c4a8bc]">·</span>
                      <span className="text-[#b3a3b1]">
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                    <h3 className="mt-1 line-clamp-2 text-[14px] font-semibold leading-5 text-[#4f3a4f]">
                      {post.title}
                    </h3>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Safety mid-page */}
      <section className="mx-auto mt-8 w-[92%] max-w-5xl">
        <div className="rounded-2xl border border-pink-100 bg-[#fff0f5] px-5 py-4">
          <p className="text-[12px] font-bold text-pink-500">安全のために</p>
          <p className="mt-1.5 text-[13px] leading-6 text-[#8f6f89]">
            契約前に仕事内容・給与・ルールは必ず確認してね。
            困ったときは一人で抱え込まず、すぐ相談してOK。
          </p>
          <Link
            href="/blog"
            className="mt-2 inline-block text-[12px] font-bold text-pink-500"
          >
            安全の話をもっと見る →
          </Link>
        </div>
      </section>

      {/* Jobs */}
      <section className="mx-auto mt-10 w-[92%] max-w-5xl">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold text-pink-400">HIRING</p>
            <h2 className="text-lg font-bold">新着求人</h2>
          </div>
          <Link href="/jobs" className="text-[13px] font-bold text-pink-500">
            もっと見る →
          </Link>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white">
          {(jobs ?? []).length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[#9b7892]">
              まだ求人がありません。
            </p>
          ) : (
            <div className="divide-y divide-pink-50">
              {(jobs ?? []).map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${prettySlug(job)}`}
                  className="block px-4 py-3.5 transition hover:bg-pink-50/50"
                >
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    {job.industry && (
                      <span className={industryStyle(job.industry)}>
                        {industryLabel(job.industry)}
                      </span>
                    )}
                    {job.location && (
                      <span className="text-[#9b7892]">📍 {job.location}</span>
                    )}
                    <span className="text-[#b3a3b1]">
                      {formatDate(job.created_at)}
                    </span>
                  </div>
                  <h3 className="mt-1 line-clamp-2 text-[14px] font-semibold leading-5 text-[#4f3a4f]">
                    {job.title}
                  </h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Reviews */}
      <section className="mx-auto mt-10 w-[92%] max-w-5xl">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold text-pink-400">REAL VOICE</p>
            <h2 className="text-lg font-bold">お店の口コミ</h2>
          </div>
          <Link href="/reviews" className="text-[13px] font-bold text-pink-500">
            もっと見る →
          </Link>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white">
          {(reviews ?? []).length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[#9b7892]">
              まだ口コミがありません。
            </p>
          ) : (
            <div className="divide-y divide-pink-50">
              {(reviews ?? []).map((review) => (
                <Link
                  key={review.id}
                  href={`/reviews/${prettySlug(review)}`}
                  className="block px-4 py-3.5 transition hover:bg-pink-50/50"
                >
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    {review.industry && (
                      <span className={industryStyle(review.industry)}>
                        {industryLabel(review.industry)}
                      </span>
                    )}
                    {review.location && (
                      <span className="text-[#9b7892]">📍 {review.location}</span>
                    )}
                    <span className="text-[#b3a3b1]">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  <h3 className="mt-1 line-clamp-2 text-[14px] font-semibold leading-5 text-[#4f3a4f]">
                    {review.title}
                  </h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Blog */}
      <section className="mx-auto mt-10 w-[92%] max-w-5xl">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold text-pink-400">COLUMN</p>
            <h2 className="text-lg font-bold">ノウハウ記事</h2>
          </div>
          <Link href="/blog" className="text-[13px] font-bold text-pink-500">
            もっと見る →
          </Link>
        </div>

        <div className="space-y-3">
          {(tipsPosts ?? []).map((post) => (
            <Link
              key={post.id}
              href={`/blog/${prettySlug(post)}`}
              className="flex gap-3 rounded-2xl border border-pink-100 bg-white p-3 transition hover:bg-pink-50/40"
            >
              {(post.thumbnail_small_url || post.thumbnail_url) && (
                <img
                  src={post.thumbnail_small_url || post.thumbnail_url || ""}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-xl object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-[14px] font-semibold leading-5">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-[#9b7892]">
                    {post.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
          {(tipsPosts ?? []).length === 0 && (
            <p className="py-8 text-center text-sm text-[#9b7892]">
              まだ記事がありません。
            </p>
          )}
        </div>
      </section>

      {/* LINE CTA — no signup push */}
      <section className="mx-auto mt-12 mb-8 w-[92%] max-w-5xl">
        <div className="rounded-2xl border border-pink-100 bg-white px-6 py-8 text-center">
          <p className="text-[12px] font-bold text-pink-400">運営に相談</p>
          <h2 className="mt-2 text-[20px] font-bold leading-snug">
            わからないこと、
            <br />
            聞いてみてね。
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-[13px] leading-6 text-[#9b7892]">
            おやすみクラブの運営に、LINEで直接メッセージできます。
            気軽にどうぞ。
          </p>
          <a
            href={LINE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#06C755] px-8 py-3.5 text-sm font-bold text-white"
          >
            <img src="/line.png" alt="" className="h-5 w-5" />
            LINEで相談する
          </a>
        </div>
      </section>
    </main>
  );
}

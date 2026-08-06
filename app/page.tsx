import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { industryLabel, industryStyle } from "@/lib/industry-style";
import SearchBar from "@/components/SearchBar";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "おやすみクラブ | シドニーで働く女の子の居場所",
  description:
    "シドニーで働く女の子のための求人・Q&A・口コミ・ノウハウをまとめたサイトです。",
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
      .limit(6),
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
    <main className="min-h-dvh bg-[#fff4f8] text-[#4f3a4f]">
      {/* Hero — original tone */}
      <section className="relative overflow-hidden px-5 pb-6 pt-10">
        <div className="absolute -right-16 top-10 h-44 w-44 rounded-full bg-pink-200/60 blur-3xl" />
        <div className="absolute -left-16 top-52 h-44 w-44 rounded-full bg-purple-200/50 blur-3xl" />

        <div className="relative mx-auto max-w-5xl">
          <h1 className="max-w-3xl text-[24px] font-bold leading-[1.2] tracking-[-0.04em] md:text-5xl">
            シドニーで働く女の子の、
            <br />
            <span className="text-pink-400">もうひとつの居場所。</span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-[#9b7892] md:text-base">
            求人・Q&A・口コミ・ノウハウを、
            <br className="hidden md:block" />
            女の子目線でまとめました。
          </p>

          <div className="my-6">
            <SearchBar
              audience="girls"
              placeholder="求人・Q&A・口コミを検索..."
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/jobs"
              className="rounded-full bg-[#4f3a4f] px-6 py-3 text-sm font-bold text-white shadow-sm"
            >
              💼 求人を見る
            </Link>
            <Link
              href="/board/write?category=qa"
              className="rounded-full border border-pink-200 bg-white/80 px-6 py-3 text-sm font-bold text-[#4f3a4f]"
            >
              💬 質問する
            </Link>
          </div>

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
                className="shrink-0 rounded-full border border-pink-100 bg-white/80 px-4 py-2 font-medium text-[#4f3a4f]"
              >
                {item.label}
                {typeof item.count === "number" && item.count > 0 && (
                  <span className="ml-1.5 text-[#b28aa8]">{item.count}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Q&A — flat list */}
      <section className="mx-auto mt-8 w-[92%] max-w-5xl">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold text-pink-400">RECENT QUESTIONS</p>
            <h2 className="text-lg font-bold">最近のQ&A</h2>
          </div>
          <Link href="/qna" className="text-[13px] font-bold text-pink-500">
            もっと見る →
          </Link>
        </div>

        {(qnaPosts ?? []).length === 0 ? (
          <p className="py-6 text-sm text-[#9b7892]">まだ質問がありません。</p>
        ) : (
          <div className="divide-y divide-pink-100">
            {(qnaPosts ?? []).map((post) => {
              const replies = post.comments?.[0]?.count ?? 0;
              return (
                <Link
                  key={post.id}
                  href={`/qna/${prettySlug(post)}#comments`}
                  className="group block py-3.5"
                >
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-semibold text-pink-500">
                      {replies}件の回答
                    </span>
                    <span className="text-[#b3a3b1]">
                      {formatDate(post.created_at)}
                    </span>
                  </div>
                  <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-5 text-[#4f3a4f] group-hover:text-pink-500">
                    {post.title}
                  </h3>
                </Link>
              );
            })}
          </div>
        )}
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

      {/* Jobs — flat list */}
      <section className="mx-auto mt-10 w-[92%] max-w-5xl">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold text-pink-400">HIRING NOW</p>
            <h2 className="text-lg font-bold">新着求人</h2>
          </div>
          <Link href="/jobs" className="text-[13px] font-bold text-pink-500">
            もっと見る →
          </Link>
        </div>

        {(jobs ?? []).length === 0 ? (
          <p className="py-6 text-sm text-[#9b7892]">まだ求人がありません。</p>
        ) : (
          <div className="divide-y divide-pink-100">
            {(jobs ?? []).map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${prettySlug(job)}`}
                className="group block py-3.5"
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
                <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-5 text-[#4f3a4f] group-hover:text-pink-500">
                  {job.title}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Reviews — flat list */}
      <section className="mx-auto mt-10 w-[92%] max-w-5xl">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold text-pink-400">SHOP REVIEWS</p>
            <h2 className="text-lg font-bold">お店の口コミ</h2>
          </div>
          <Link href="/reviews" className="text-[13px] font-bold text-pink-500">
            もっと見る →
          </Link>
        </div>

        {(reviews ?? []).length === 0 ? (
          <p className="py-6 text-sm text-[#9b7892]">まだ口コミがありません。</p>
        ) : (
          <div className="divide-y divide-pink-100">
            {(reviews ?? []).map((review) => (
              <Link
                key={review.id}
                href={`/reviews/${prettySlug(review)}`}
                className="group block py-3.5"
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
                <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-5 text-[#4f3a4f] group-hover:text-pink-500">
                  {review.title}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Blog — horizontal carousel */}
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

        {(tipsPosts ?? []).length === 0 ? (
          <p className="py-6 text-sm text-[#9b7892]">まだ記事がありません。</p>
        ) : (
          <div className="-mx-1 overflow-x-auto px-1 pb-2">
            <div className="flex gap-3">
              {(tipsPosts ?? []).map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${prettySlug(post)}`}
                  className="w-[200px] shrink-0 overflow-hidden rounded-2xl border border-pink-100 bg-white/80"
                >
                  <div className="aspect-[16/10] w-full bg-pink-50">
                    {(post.thumbnail_small_url || post.thumbnail_url) ? (
                      <img
                        src={post.thumbnail_small_url || post.thumbnail_url || ""}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-2 text-[13px] font-bold leading-5 text-[#4f3a4f]">
                      {post.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* LINE CTA */}
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

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import BottomNavGirls from "@/app/girls/_components/BottomNavGirls";
import { industryLabel, industryStyle } from "@/lib/industry-style";
import SearchBar from "@/components/SearchBar";
import LineLoginButton from "@/components/LineLoginButton";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "おやすみクラブ | シドニーで働く女の子の居場所",
  description:
    "おやすみクラブは、シドニーで働く女の子のための求人・Q&A・口コミ・ノウハウをまとめたサイトです。",
  alternates: {
    canonical: "https://www.oyasumi-club.com",
  },
};

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
  const { data: qnaPosts } = await supabase
    .from("board_posts")
    .select("id, title, excerpt, body, category, slug, views, created_at, comments(count)")
    .eq("status", "approved")
    .eq("category", "qa")
    .order("created_at", { ascending: false })
    .limit(4);

  const { data: tipsPosts } = await supabase
    .from("board_posts")
    .select("id, title, excerpt, body, category, slug, views, created_at, thumbnail_url, thumbnail_small_url")
    .eq("status", "approved")
    .eq("category", "blog")
    .order("created_at", { ascending: false })
    .limit(4);

  const { data: jobs } = await supabase
    .from("board_posts")
    .select(`
      id,
      title,
      slug,
      views,
      location,
      industry,
      thumbnail_small_url,
      created_at
    `)
    .eq("status", "approved")
    .eq("category", "jobs")
    .order("created_at", { ascending: false })
    .limit(4);

  const { data: reviews } = await supabase
    .from("board_posts")
    .select("id, title, slug, views, location, industry, created_at")
    .eq("status", "approved")
    .eq("category", "review")
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <main className="-mb-24 min-h-dvh bg-[#fff4f8] pb-32 text-[#4f3a4f]">
      <section className="relative overflow-hidden px-5 pb-12 pt-10">
        <div className="absolute -right-16 top-10 h-44 w-44 rounded-full bg-pink-200/60 blur-3xl" />
        <div className="absolute -left-16 top-52 h-44 w-44 rounded-full bg-purple-200/50 blur-3xl" />

        <div className="relative mx-auto max-w-5xl">
          <h1 className="max-w-3xl text-[24px] font-bold leading-[1.2] tracking-[-0.04em] md:text-6xl">
            シドニーで働く女の子の、
            <br />
            <span className="text-pink-400">もうひとつの居場所。</span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-[#9b7892] md:text-base">
            求人・Q&A・口コミ・ノウハウを、
            <br className="hidden md:block" />
            女の子目線でまとめました。
          </p>

          <div className="my-6">
            <SearchBar
              audience="girls"
              placeholder="求人・Q&A・記事を検索..."
            />
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
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
        </div>
      </section>

      <section className="mx-auto grid w-[92%] max-w-5xl grid-cols-4 gap-3">
        {[
          ["47", "口コミ", "/reviews", "働きやすさ"],
          ["88", "Q&A", "/qna", "相談・質問"],
          ["25", "求人", "/jobs", "募集中"],
          ["12", "記事", "/blog", "ノウハウ"],
        ].map(([num, label, href, sub]) => (
          <Link
            key={label}
            href={href}
            className="rounded-3xl border border-pink-100 bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="text-3xl font-bold text-pink-400">{num}</div>
            <div className="mt-1 font-bold">{label}</div>
            <div className="mt-1 text-xs text-[#b28aa8]">{sub}</div>
          </Link>
        ))}
      </section>

      <section className="mx-auto mt-10 w-[92%] max-w-5xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-pink-400">MENU</p>
            <h2 className="mt-1 text-2xl font-bold">なにを探す？</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            {
              emoji: "💬",
              title: "お店の口コミ",
              desc: "働きやすさ・雰囲気・客層のリアルな声",
              badge: "誰でも閲覧OK",
              href: "/reviews",
              bg: "bg-[#fff0f6]",
            },
            {
              emoji: "💼",
              title: "求人情報",
              desc: "シドニーで募集中のお店をチェック",
              badge: "応募OK",
              href: "/jobs",
              bg: "bg-[#fff7e8]",
            },
            {
              emoji: "🙋‍♀️",
              title: "Q&A 掲示板",
              desc: "働く前の不安や疑問を匿名で相談",
              badge: "投稿は要登録",
              href: "/qna",
              bg: "bg-[#f5f0ff]",
            },
            {
              emoji: "📖",
              title: "ノウハウ記事",
              desc: "ビザ・安全・稼ぎ方・はじめかた",
              badge: "無料で読める",
              href: "/blog",
              bg: "bg-[#ecfbf7]",
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`group rounded-[30px] border border-white/80 ${item.bg} p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div className="text-4xl">{item.emoji}</div>
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-[#9b7892]">
                  {item.badge}
                </span>
              </div>

              <h3 className="mt-8 text-2xl font-bold text-[#4f3a4f]">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#8f6f89]">
                {item.desc}
              </p>

              <div className="mt-6 text-sm font-bold text-pink-500">
                詳しく見る →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Q&A */}
      <section className="mx-auto mt-14 w-[92%] max-w-5xl">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold text-pink-400">RECENT QUESTIONS</p>
            <h2 className="mt-1 text-2xl font-bold">最近のQ&A</h2>
          </div>

          <Link href="/qna" className="text-sm font-bold text-pink-500">
            もっと見る →
          </Link>
        </div>

        <div className="divide-y divide-pink-100">
          {(qnaPosts ?? []).map((post) => {
            const replies = post.comments?.[0]?.count ?? 0;

            return (
              <Link
                key={post.id}
                href={`/qna/${prettySlug(post)}#comments`}
                className="group block py-4 transition hover:bg-pink-50/60"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-semibold text-pink-500">
                      {replies}件の回答
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-4">
                    <h3 className="truncate font-semibold text-[#4f3a4f] group-hover:text-pink-500">
                      {post.title}
                    </h3>

                    <span className="shrink-0 text-xs text-[#b3a3b1]">
                      {formatDate(post.created_at)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* JOBS */}
      <section className="mx-auto mt-14 w-[92%] max-w-5xl">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold text-pink-400">HIRING NOW</p>
            <h2 className="mt-1 text-2xl font-bold">新着求人</h2>
          </div>

          <Link href="/jobs" className="text-sm font-bold text-pink-500">
            もっと見る →
          </Link>
        </div>

        <div className="divide-y divide-pink-100">
          {(jobs ?? []).map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${prettySlug(job)}`}
              className="group block py-4 transition hover:bg-pink-50/60"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3 text-xs">
                  {job.industry && (
                    <span className={industryStyle(job.industry)}>
                      {industryLabel(job.industry)}
                    </span>
                  )}

                  {job.location && (
                    <span className="text-[#9b7892]">📍 {job.location}</span>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between gap-4">
                  <h3 className="truncate font-semibold text-[#4f3a4f] group-hover:text-pink-500">
                    {job.title}
                  </h3>

                  <span className="shrink-0 text-xs text-[#b3a3b1]">
                    {formatDate(job.created_at)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="mx-auto mt-14 w-[92%] max-w-5xl">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold text-pink-400">SHOP REVIEWS</p>
            <h2 className="mt-1 text-2xl font-bold">お店の口コミ</h2>
          </div>

          <Link href="/reviews" className="text-sm font-bold text-pink-500">
            もっと見る →
          </Link>
        </div>

        <div className="divide-y divide-pink-100">
          {(reviews ?? []).map((review) => (
            <Link
              key={review.id}
              href={`/reviews/${prettySlug(review)}`}
              className="group block py-4 transition hover:bg-pink-50/60"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3 text-xs">
                  {review.industry && (
                    <span className={industryStyle(review.industry)}>
                      {industryLabel(review.industry)}
                    </span>
                  )}

                  {review.location && (
                    <span className="text-[#9b7892]">📍 {review.location}</span>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between gap-4">
                  <h3 className="truncate font-semibold text-[#4f3a4f] group-hover:text-pink-500">
                    {review.title}
                  </h3>

                  <span className="shrink-0 text-xs text-[#b3a3b1]">
                    {formatDate(review.created_at)}
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {(!reviews || reviews.length === 0) && (
            <div className="py-4 text-sm text-[#9b7892]">
              まだ口コミがありません。
            </div>
          )}
        </div>
      </section>

      {/* BLOG / TIPS */}
      <section className="mx-auto mt-14 w-[92%] max-w-5xl">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold text-pink-400">COLUMN</p>
            <h2 className="mt-1 text-2xl font-bold">ノウハウ記事</h2>
          </div>

          <Link href="/blog" className="text-sm font-bold text-pink-500">
            もっと見る →
          </Link>
        </div>

        <div className="-mx-4 overflow-x-auto px-4 pb-2">
          <div className="flex gap-4">
            {(tipsPosts ?? []).map((post) => (
              <Link
                key={post.id}
                href={`/blog/${prettySlug(post)}`}
                className="w-[240px] shrink-0 overflow-hidden rounded-3xl border border-pink-100 bg-white/80 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {(post.thumbnail_small_url || post.thumbnail_url) && (
                  <img
                    src={post.thumbnail_small_url || post.thumbnail_url || ""}
                    alt=""
                    className="aspect-[16/9] w-full object-cover"
                  />
                )}

                <div className="p-5">
                  <h3 className="mt-4 line-clamp-2 text-base font-bold leading-6">
                    {post.title}
                  </h3>

                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#9b7892]">
                    {post.excerpt || "excerptも追加してください。"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 w-[92%] max-w-5xl">
        <div className="rounded-[2rem] border border-pink-100 bg-white/80 p-8 shadow-sm">
          <p className="text-xs font-bold text-pink-400">SAFETY NOTE</p>
          <h2 className="mt-2 text-2xl font-bold">安全に働くために</h2>

          <ul className="mt-6 space-y-3 text-sm leading-7 text-[#8f6f89]">
            <li>・契約前に仕事内容、給与、ルールを必ず確認する。</li>
            <li>・学生ビザの就労制限に注意する。</li>
            <li>・給与や税務申告は自己管理が必要。</li>
            <li>・困ったときは一人で抱え込まず、すぐ相談する。</li>
          </ul>

          <Link
            href="/blog"
            className="mt-6 inline-block text-sm font-bold text-pink-500"
          >
            → 安全情報をもっと見る
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-14 w-[92%] max-w-5xl rounded-[2rem] bg-[#4f3a4f] p-9 text-center text-white shadow-sm">
        <p className="text-sm text-pink-200">JOIN OYASUMI GIRLS</p>

        <h2 className="mt-3 text-3xl font-bold leading-snug">
          無料で登録して
          <br />
          口コミや質問を投稿しよう
        </h2>

        <p className="mt-5 text-sm leading-7 text-pink-100">
          匿名OK。求人への応募やQ&A参加もできます。
        </p>

        <div className="mx-auto mt-8 max-w-md space-y-3">
          <LineLoginButton />

          <Link
            href="/login"
            className="block rounded-full border border-white/20 py-4 text-sm font-bold text-white"
          >
            メールアドレスで登録
          </Link>
        </div>
      </section>

      <BottomNavGirls />
    </main>
  );
}

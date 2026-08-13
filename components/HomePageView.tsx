import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { industryLabel, industryStyle } from "@/lib/industry-style";
import SearchBar from "@/components/SearchBar";
import { CITIES, cityLabelJa, type CitySlug } from "@/lib/cities";

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

export default async function HomePageView({
  city,
}: {
  city?: CitySlug;
}) {
  const cityName = city ? cityLabelJa(city) : null;

  const qnaBase = supabase
    .from("board_posts")
    .select("id, title, slug, created_at, comments(count)")
    .eq("status", "approved")
    .eq("category", "qa")
    .order("created_at", { ascending: false })
    .limit(5);

  const jobsBase = supabase
    .from("board_posts")
    .select("id, title, slug, location, industry, city, created_at")
    .eq("status", "approved")
    .eq("category", "jobs")
    .order("created_at", { ascending: false })
    .limit(5);

  const reviewsBase = supabase
    .from("board_posts")
    .select("id, title, excerpt, slug, location, industry, city, created_at")
    .eq("status", "approved")
    .eq("category", "review")
    .order("created_at", { ascending: false })
    .limit(5);

  const qnaCountBase = supabase
    .from("board_posts")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved")
    .eq("category", "qa");

  const jobsCountBase = supabase
    .from("board_posts")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved")
    .eq("category", "jobs");

  const reviewsCountBase = supabase
    .from("board_posts")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved")
    .eq("category", "review");

  // Blog: city page shows that city + nationwide (city is null)
  let tipsBase = supabase
    .from("board_posts")
    .select(
      "id, title, excerpt, slug, created_at, thumbnail_url, thumbnail_small_url"
    )
    .eq("status", "approved")
    .eq("category", "blog")
    .order("created_at", { ascending: false })
    .limit(6);

  if (city) {
    tipsBase = tipsBase.or(`city.eq.${city},city.is.null`);
  }

  let blogCountBase = supabase
    .from("board_posts")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved")
    .eq("category", "blog");

  if (city) {
    blogCountBase = blogCountBase.or(`city.eq.${city},city.is.null`);
  }

  const cityCountPromises = CITIES.map((c) =>
    supabase
      .from("board_posts")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")
      .eq("city", c.value)
      .in("category", ["jobs", "qa", "review"])
      .then((res) => ({ city: c.value, count: res.count ?? 0 }))
  );

  const [
    { data: qnaPosts },
    { data: tipsPosts },
    { data: jobs },
    { data: reviews },
    { count: qnaCount },
    { count: jobsCount },
    { count: reviewsCount },
    { count: blogCount },
    ...cityCounts
  ] = await Promise.all([
    city ? qnaBase.eq("city", city) : qnaBase,
    tipsBase,
    city ? jobsBase.eq("city", city) : jobsBase,
    city ? reviewsBase.eq("city", city) : reviewsBase,
    city ? qnaCountBase.eq("city", city) : qnaCountBase,
    city ? jobsCountBase.eq("city", city) : jobsCountBase,
    city ? reviewsCountBase.eq("city", city) : reviewsCountBase,
    blogCountBase,
    ...cityCountPromises,
  ]);

  const qnaHref = city ? `/${city}/qna` : "/qna";
  const jobsHref = city ? `/${city}/jobs` : "/jobs";
  const reviewsHref = city ? `/${city}/reviews` : "/reviews";
  const writeQaHref = city
    ? `/board/write?category=qa&city=${city}`
    : "/board/write?category=qa";

  const heroTitle = cityName
    ? `${cityName}で働く女の子の、`
    : "オーストラリアで働く女の子の、";

  const heroSub = cityName
    ? `求人・Q&A・口コミ・ノウハウを日本語でまとめた\n${cityName}で働く女の子のための総合ガイド`
    : "求人・Q&A・口コミ・ノウハウを日本語でまとめた\nシドニー・メルボルン・ブリスベンの女の子のための総合ガイド";

  return (
    <main className="min-h-dvh bg-[#fff4f8] text-[#4f3a4f]">
      <section className="relative overflow-hidden px-5 pb-8 pt-10">
        <div className="absolute -right-20 -top-8 h-56 w-56 rounded-full bg-pink-200/50 blur-3xl" />
        <div className="absolute -left-20 top-24 h-56 w-56 rounded-full bg-purple-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-5xl">
          <h1 className="mb-4 text-[24px] font-bold leading-[1.2] tracking-[-0.04em] md:text-6xl">
            {heroTitle}
            <br />
            <span className="text-pink-400">もうひとつの居場所。</span>
          </h1>

          <p className="whitespace-pre-line text-[13px] leading-relaxed text-[#9b7892] md:text-base">
            {heroSub.replace("\\n", "\n")}
          </p>

          <div className="my-6">
            <SearchBar
              audience="girls"
              placeholder="求人・Q&A・口コミを検索..."
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={jobsHref}
              className="rounded-full bg-[#4f3a4f] px-6 py-3 text-sm font-bold text-white shadow-sm"
            >
              💼 求人を見る
            </Link>
            <Link
              href={writeQaHref}
              className="rounded-full border border-pink-200 bg-white/80 px-6 py-3 text-sm font-bold text-[#4f3a4f]"
            >
              💬 質問する
            </Link>
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto pb-1 text-[13px]">
            {(cityCounts as { city: string; count: number }[]).map((item) => (
              <Link
                key={item.city}
                href={`/${item.city}`}
                className={`shrink-0 rounded-full border px-4 py-2 font-medium ${
                  city === item.city
                    ? "border-[#4f3a4f] bg-[#4f3a4f] text-white"
                    : "border-pink-100 bg-white/80 text-[#4f3a4f]"
                }`}
              >
                {cityLabelJa(item.city)}
                <span
                  className={`ml-1.5 ${
                    city === item.city ? "text-pink-200" : "text-[#b28aa8]"
                  }`}
                >
                  {item.count}
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 text-[13px]">
            {[
              { label: "Q&A", href: qnaHref, count: qnaCount },
              { label: "求人", href: jobsHref, count: jobsCount },
              { label: "口コミ", href: reviewsHref, count: reviewsCount },
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

      <section className="mx-auto mt-6 w-[92%] max-w-5xl">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-[20px] font-bold tracking-tight text-[#4f3a4f]">
            最近のQ&A
          </h2>
          <Link href={qnaHref} className="text-[13px] font-bold text-pink-500">
            もっと見る →
          </Link>
        </div>

        {(qnaPosts ?? []).length === 0 ? (
          <p className="py-6 text-sm text-[#9b7892]">まだ質問がありません。</p>
        ) : (
          <div className="space-y-0">
            {(qnaPosts ?? []).map((post, i) => {
              const replies = post.comments?.[0]?.count ?? 0;
              return (
                <Link
                  key={post.id}
                  href={`/qna/${prettySlug(post)}#comments`}
                  className={`group flex gap-3 border-b border-pink-100 py-3.5 ${
                    i === 0 ? "pt-0" : ""
                  }`}
                >
                  <div className="mt-0.5 w-0.5 shrink-0 self-stretch rounded-full bg-pink-300" />
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`line-clamp-2 font-semibold leading-5 text-[#4f3a4f] group-hover:text-pink-500 ${
                        i === 0 ? "text-[16px]" : "text-[15px]"
                      }`}
                    >
                      {post.title}
                    </h3>
                    <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                      <span className="rounded-full bg-pink-50 px-2 py-0.5 font-semibold text-pink-500">
                        💬 {replies}
                      </span>
                      <span className="text-[#b3a3b1]">
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="mx-auto mt-8 w-[92%] max-w-5xl">
        <div className="rounded-2xl border border-pink-100 bg-[#fff0f5] px-5 py-4">
          <p className="text-[13px] font-bold text-pink-500">安全のために</p>
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

      <section className="mt-10 bg-[#fff0f6]/60 py-8">
        <div className="mx-auto w-[92%] max-w-5xl">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-[20px] font-bold tracking-tight text-[#4f3a4f]">
              新着求人
            </h2>
            <Link href={jobsHref} className="text-[13px] font-bold text-pink-500">
              もっと見る →
            </Link>
          </div>

          {(jobs ?? []).length === 0 ? (
            <p className="py-6 text-sm text-[#9b7892]">まだ求人がありません。</p>
          ) : (
            <div className="divide-y divide-pink-100/80">
              {(jobs ?? []).map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${prettySlug(job)}`}
                  className="group block py-4"
                >
                  <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="rounded-full bg-[#4f3a4f] px-2 py-0.5 text-[10px] font-bold text-white">
                      求人
                    </span>
                    {!city && job.city && (
                      <span className="rounded-full bg-pink-50 px-2 py-0.5 font-medium text-pink-500">
                        {cityLabelJa(job.city)}
                      </span>
                    )}
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
                  <h3 className="line-clamp-2 text-[15px] font-semibold leading-5 text-[#4f3a4f] group-hover:text-pink-500">
                    {job.title}
                  </h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto mt-10 w-[92%] max-w-5xl">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-[20px] font-bold tracking-tight text-[#4f3a4f]">
            お店の口コミ
          </h2>
          <Link
            href={reviewsHref}
            className="text-[13px] font-bold text-pink-500"
          >
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
                  {!city && review.city && (
                    <span className="rounded-full bg-pink-50 px-2 py-0.5 font-medium text-pink-500">
                      {cityLabelJa(review.city)}
                    </span>
                  )}
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
                <h3 className="mt-1 line-clamp-1 text-[15px] font-semibold leading-5 text-[#4f3a4f] group-hover:text-pink-500">
                  {review.title}
                </h3>
                {review.excerpt && (
                  <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-[#9b7892]">
                    {review.excerpt}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto mt-10 w-[92%] max-w-5xl">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-[20px] font-bold tracking-tight text-[#4f3a4f]">
            ノウハウ記事
          </h2>
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
                  className="w-[200px] shrink-0 border border-pink-100 bg-white/80"
                >
                  <div className="aspect-[3/2] w-full bg-pink-50">
                    {(post.thumbnail_small_url || post.thumbnail_url) && (
                      <img
                        src={
                          post.thumbnail_small_url || post.thumbnail_url || ""
                        }
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    )}
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

      <section className="mx-auto mt-12 mb-8 w-[92%] max-w-5xl">
        <div className="rounded-2xl border border-pink-100 bg-white px-6 py-8 text-center">
          <p className="text-[13px] font-bold text-pink-400">運営に相談</p>
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

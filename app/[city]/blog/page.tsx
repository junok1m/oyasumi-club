import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { CITIES, cityLabelJa, isValidCity } from "@/lib/cities";

type BoardPost = {
  id: number;
  title: string;
  excerpt: string | null;
  created_at: string;
  slug: string | null;
  thumbnail_url: string | null;
  thumbnail_small_url: string | null;
  city: string | null;
};

function prettySlug(post: { id: number; slug: string | null }) {
  return post.slug ? `${post.id}-${post.slug}` : `${post.id}`;
}

function formatRelativeTime(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  if (hours < 24) return `${hours}時間前`;
  if (days < 7) return `${days}日前`;
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  if (!isValidCity(city)) return { title: "記事 | おやすみクラブ" };
  const name = cityLabelJa(city);
  return {
    title: `${name}の記事 | おやすみクラブ`,
    description: `${name}向けのノウハウ・読み物記事です。全国向けの記事も含みます。`,
    alternates: { canonical: `https://www.oyasumi-club.com/${city}/blog` },
  };
}

export default async function CityBlogPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  if (!isValidCity(city)) notFound();

  const name = cityLabelJa(city);
  const supabase = await supabaseServer();

  // This city + nationwide (city is null)
  const { data } = await supabase
    .from("board_posts")
    .select(
      `id, title, excerpt, created_at, slug, thumbnail_url, thumbnail_small_url, city`
    )
    .eq("status", "approved")
    .eq("category", "blog")
    .or(`city.eq.${city},city.is.null`)
    .order("created_at", { ascending: false })
    .limit(30);

  const results = (data ?? []) as BoardPost[];

  return (
    <main className="min-h-dvh bg-[#fff3f8] pb-28 text-[#5f4d5c]">
      <div className="mx-auto w-[92%] max-w-5xl py-8">
        <div className="mb-4 flex flex-wrap gap-2">
          {CITIES.map((c) => (
            <Link
              key={c.value}
              href={`/${c.value}/blog`}
              className={`rounded-full border px-3 py-1.5 text-[12px] font-medium ${
                c.value === city
                  ? "border-[#4f3a4f] bg-[#4f3a4f] text-white"
                  : "border-pink-100 bg-white/80"
              }`}
            >
              {c.labelJa}
            </Link>
          ))}
          <Link
            href="/blog"
            className="rounded-full border border-pink-100 bg-white/80 px-3 py-1.5 text-[12px] font-medium"
          >
            すべて
          </Link>
        </div>

        <h1 className="mb-2 text-[24px] font-semibold text-[#4f3a4f]">
          {name}の記事
        </h1>
        <p className="mb-6 text-[12px] leading-6 text-[#9b7892]">
          {name}向けのノウハウ・読み物です。全国向けの記事も含みます。
        </p>

        {results.length === 0 ? (
          <div className="rounded-3xl border border-pink-100 bg-white/70 px-6 py-16 text-center text-sm text-[#9b7892]">
            まだ{name}の記事がありません。
            <div className="mt-4">
              <Link href="/blog" className="font-bold text-pink-500">
                全記事を見る →
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-pink-100">
            {results.map((post) => {
              const thumb =
                post.thumbnail_small_url || post.thumbnail_url || null;
              return (
                <Link
                  key={post.id}
                  href={`/blog/${prettySlug(post)}`}
                  className="flex gap-3 py-4"
                >
                  {thumb && (
                    <div className="h-[72px] w-[108px] shrink-0 overflow-hidden bg-pink-50">
                      <img
                        src={thumb}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="line-clamp-2 text-[15px] font-semibold leading-6 text-[#4f3a4f]">
                      {post.title}
                    </h2>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] text-[#9b7892]">
                      {!post.city && (
                        <span className="rounded-full bg-pink-50 px-2 py-0.5 text-[11px] font-medium text-pink-500">
                          全国
                        </span>
                      )}
                      <span>{formatRelativeTime(post.created_at)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

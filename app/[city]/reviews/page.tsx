import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { industryLabel, industryStyle } from "@/lib/industry-style";
import { CITIES, cityLabelJa, isValidCity } from "@/lib/cities";

type BoardPost = {
  id: number;
  title: string;
  industry: string | null;
  location: string | null;
  created_at: string;
  slug: string | null;
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
  if (!isValidCity(city)) return { title: "口コミ | おやすみクラブ" };
  const name = cityLabelJa(city);
  return {
    title: `${name}の口コミ | おやすみクラブ`,
    description: `${name}のお店の口コミです。`,
    alternates: { canonical: `https://www.oyasumi-club.com/${city}/reviews` },
  };
}

export default async function CityReviewsPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  if (!isValidCity(city)) notFound();

  const name = cityLabelJa(city);
  const supabase = await supabaseServer();

  const { data } = await supabase
    .from("board_posts")
    .select(`id, title, industry, location, created_at, slug`)
    .eq("status", "approved")
    .eq("category", "review")
    .eq("city", city)
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
              href={`/${c.value}/reviews`}
              className={`rounded-full border px-3 py-1.5 text-[12px] font-medium ${
                c.value === city
                  ? "border-[#4f3a4f] bg-[#4f3a4f] text-white"
                  : "border-pink-100 bg-white/80"
              }`}
            >
              {c.labelJa}
            </Link>
          ))}
        </div>

        <h1 className="mb-2 text-[24px] font-semibold text-[#4f3a4f]">
          {name}の口コミ
        </h1>
        <p className="mb-6 text-[12px] leading-6 text-[#9b7892]">
          {name}のお店の口コミです。
        </p>

        {results.length === 0 ? (
          <div className="rounded-3xl border border-pink-100 bg-white/70 px-6 py-16 text-center text-sm text-[#9b7892]">
            まだ{name}の口コミがありません。
            <div className="mt-4">
              <Link
                href={`/board/write?category=review&city=${city}`}
                className="font-bold text-pink-500"
              >
                最初の口コミを書く →
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-pink-100">
            {results.map((post) => (
              <Link
                key={post.id}
                href={`/reviews/${prettySlug(post)}`}
                className="block py-4"
              >
                <h2 className="text-[15px] font-semibold leading-6 text-[#4f3a4f]">
                  {post.title}
                </h2>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#9b7892]">
                  {industryLabel(post.industry) && (
                    <span className={industryStyle(post.industry)}>
                      {industryLabel(post.industry)}
                    </span>
                  )}
                  {post.location && <span>📍 {post.location}</span>}
                  <span>{formatRelativeTime(post.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

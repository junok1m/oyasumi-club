import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { CITIES, cityLabelJa, isValidCity } from "@/lib/cities";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.value }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  if (!isValidCity(city)) return { title: "おやすみクラブ" };

  const name = cityLabelJa(city);
  const title = `${name}で働く女の子の居場所 | おやすみクラブ`;
  const description = `${name}の求人・Q&A・口コミをまとめた、女の子向け情報サイトです。`;

  return {
    title,
    description,
    alternates: { canonical: `https://www.oyasumi-club.com/${city}` },
    openGraph: {
      title,
      description,
      url: `https://www.oyasumi-club.com/${city}`,
      type: "website",
    },
  };
}

export default async function CityHomePage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  if (!isValidCity(city)) notFound();

  const name = cityLabelJa(city);
  const supabase = await supabaseServer();

  const [{ count: jobsCount }, { count: qnaCount }, { count: reviewsCount }] =
    await Promise.all([
      supabase
        .from("board_posts")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved")
        .eq("category", "jobs")
        .eq("city", city),
      supabase
        .from("board_posts")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved")
        .eq("category", "qa")
        .eq("city", city),
      supabase
        .from("board_posts")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved")
        .eq("category", "review")
        .eq("city", city),
    ]);

  const sections = [
    {
      href: `/${city}/jobs`,
      label: "求人",
      count: jobsCount ?? 0,
      desc: `${name}の募集中のお仕事`,
    },
    {
      href: `/${city}/qna`,
      label: "Q&A",
      count: qnaCount ?? 0,
      desc: `${name}で働く女の子の質問`,
    },
    {
      href: `/${city}/reviews`,
      label: "口コミ",
      count: reviewsCount ?? 0,
      desc: `${name}のお店の口コミ`,
    },
  ];

  return (
    <main className="min-h-dvh bg-[#fff4f8] pb-28 text-[#4f3a4f]">
      <section className="mx-auto w-[92%] max-w-5xl px-1 py-10">
        <p className="text-[12px] font-bold text-pink-400">CITY</p>
        <h1 className="mt-1 text-[28px] font-bold tracking-tight md:text-4xl">
          {name}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#9b7892]">
          {name}で働く女の子のための求人・Q&A・口コミです。
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {CITIES.map((c) => (
            <Link
              key={c.value}
              href={`/${c.value}`}
              className={`rounded-full border px-4 py-2 text-[13px] font-medium ${
                c.value === city
                  ? "border-[#4f3a4f] bg-[#4f3a4f] text-white"
                  : "border-pink-100 bg-white/80 text-[#4f3a4f]"
              }`}
            >
              {c.labelJa}
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {sections.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-pink-100 bg-white/80 px-5 py-5 transition hover:border-pink-200"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-lg font-bold">{item.label}</h2>
                <span className="text-sm font-semibold text-pink-500">
                  {item.count}
                </span>
              </div>
              <p className="mt-2 text-[13px] leading-5 text-[#9b7892]">
                {item.desc}
              </p>
              <p className="mt-4 text-[12px] font-bold text-pink-500">
                見る →
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/board/write?category=jobs&city=${city}`}
            className="rounded-full bg-[#4f3a4f] px-5 py-2.5 text-sm font-bold text-white"
          >
            求人を書く
          </Link>
          <Link
            href={`/board/write?category=qa&city=${city}`}
            className="rounded-full border border-pink-200 bg-white px-5 py-2.5 text-sm font-bold"
          >
            質問する
          </Link>
          <Link
            href="/"
            className="rounded-full border border-pink-100 px-5 py-2.5 text-sm font-medium text-[#9b7892]"
          >
            全国トップへ
          </Link>
        </div>
      </section>
    </main>
  );
}

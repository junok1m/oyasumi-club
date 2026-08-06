import { supabaseServer } from "@/lib/supabase-server";
import type { Metadata } from "next";
import IndustryBrowse from "@/components/IndustryBrowse";
import { HomeAdminPickShops } from "@/components/HomeAdminPickShops";
import LocationPills from "@/components/location/LocationPills";
import RecentBlogPosts from "@/components/RecentBlogPosts";
import SearchBar from "@/components/SearchBar";

export const metadata: Metadata = {
  title: "おやすみクラブ | シドニー夜遊び・ナイトライフ情報",
  description:
    "おやすみクラブは、シドニーの夜遊び・ナイトライフ情報を日本語で探せる掲示板サイトです。お店情報、ブログ、ガイドをまとめてチェックできます。",
  alternates: {
    canonical: "https://www.oyasumi-club.com",
  },
};

async function getAdminPickShops() {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("guide_posts")
    .select(`
      id,
      title,
      slug,
      industry,
      location,
      thumbnail_url,
      thumbnail_small_url,
      created_at,
      excerpt
    `)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error || !data) {
    console.error("getAdminPickShops error:", error);
    return [];
  }

  return data;
}

export default async function HomePage() {
  const supabase = await supabaseServer();

  const { data: recentBlogPosts } = await supabase
    .from("board_posts")
    .select(`
      id,
      title,
      slug,
      thumbnail_url,
      thumbnail_small_url,
      excerpt
    `)
    .eq("category", "blog")
    .eq("status", "approved")
    .in("audience", ["all", "men"])
    .order("created_at", { ascending: false })
    .limit(5);

  const [{ data: boardIndustryPosts }, { data: guideIndustryPosts }] =
    await Promise.all([
      supabase
        .from("board_posts")
        .select("industry")
        .eq("status", "approved")
        .in("audience", ["all", "men"]),

      supabase
        .from("guide_posts")
        .select("industry")
        .eq("status", "approved"),
    ]);

  const industryCounts = [
    ...(boardIndustryPosts ?? []),
    ...(guideIndustryPosts ?? []),
  ].reduce((acc, post) => {
    if (!post.industry) return acc;
    acc[post.industry] = (acc[post.industry] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const adminPickShops = await getAdminPickShops();

  return (
   <main className="-mb-24 min-h-dvh bg-[#151c28] text-[#d6dde7]">
  <div className="mx-auto w-[92%] max-w-5xl space-y-14 py-10">
    <section className="relative overflow-hidden">
      <div className="absolute -right-20 -top-8 h-56 w-56 rounded-full blur-3xl" />
      <div className="absolute -left-20 top-24 h-56 w-56 rounded-full  blur-3xl" />

      <div className="relative">
        <h1 className="mb-4 text-[24px] font-bold leading-[1.2] tracking-[-0.04em] text-[#f8fafc] md:text-6xl">
          シドニーで遊ぶ男の、
          <br />
          <span className="text-cyan-400">
            もうひとつの居場所。
          </span>
        </h1>

        <p className="text-[13px] leading-relaxed text-slate-400 md:text-base">
          お店情報・口コミ・読み物を日本語でまとめた
          <br />
          シドニー夜遊び・ナイトライフの総合ガイド
        </p>
      </div>
    </section>

    <SearchBar
      audience="men"
      placeholder="お店・記事・Q&Aを検索..."
    />

    <IndustryBrowse counts={industryCounts} />

    <LocationPills
      source="all"
      basePath="/location"
    />

    <HomeAdminPickShops posts={adminPickShops} />

   <section className="pb-24">
  <RecentBlogPosts posts={recentBlogPosts ?? []} />
</section>
  </div>
</main>
  );
}
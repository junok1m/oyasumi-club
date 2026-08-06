import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import { industryLabel, industryStyle } from "@/lib/industry-style";

type MoreGuide = {
  id: number;
  title: string;
  slug: string | null;
  industry: string | null;
  location: string | null;
  created_at: string;
};

type Props = {
  currentGuideId: number;
  industry?: string | null;
  location?: string | null;
};

async function getMoreGuides({
  currentGuideId,
  industry,
  location,
}: Props) {
  const supabase = await supabaseServer();

  const sameIndustryQuery = industry
    ? supabase
        .from("guide_posts")
        .select("id, title, slug, industry, location, created_at")
        .eq("status", "approved")
        .eq("industry", industry)
        .neq("id", currentGuideId)
        .order("created_at", { ascending: false })
        .limit(3)
    : null;

  const sameLocationQuery = location
    ? supabase
        .from("guide_posts")
        .select("id, title, slug, industry, location, created_at")
        .eq("status", "approved")
        .eq("location", location)
        .neq("id", currentGuideId)
        .order("created_at", { ascending: false })
        .limit(3)
    : null;

  const latestQuery = supabase
    .from("guide_posts")
    .select("id, title, slug, industry, location, created_at")
    .eq("status", "approved")
    .neq("id", currentGuideId)
    .order("created_at", { ascending: false })
    .limit(3);

  const [sameIndustryResult, sameLocationResult, latestResult] =
    await Promise.all([sameIndustryQuery, sameLocationQuery, latestQuery]);

  return {
    sameIndustry: (sameIndustryResult?.data ?? []) as MoreGuide[],
    sameLocation: (sameLocationResult?.data ?? []) as MoreGuide[],
    latest: (latestResult.data ?? []) as MoreGuide[],
  };
}

function guideHref(guide: MoreGuide) {
  return `/guide/${guide.id}-${encodeURIComponent(guide.slug || "guide")}`;
}

function MoreGuideList({ guides }: { guides: MoreGuide[] }) {
  if (!guides.length) {
    return (
      <p className="text-[13px] text-slate-500">
        まだガイドがありません。
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {guides.map((guide) => (
        <Link
          key={guide.id}
          href={guideHref(guide)}
          className="block border-b border-dotted border-slate-700 py-3 transition hover:bg-white/5"
        >
          <div className="text-[13px] font-medium text-slate-100 transition hover:text-cyan-300">
            {guide.title}
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function MoreGuides({
  currentGuideId,
  industry,
  location,
}: Props) {
  const { sameIndustry, sameLocation, latest } = await getMoreGuides({
    currentGuideId,
    industry,
    location,
  });

  return (
  <section className="mt-12 border-slate-700 pt-8">
    <h2 className="mb-5 text-[18px] font-bold text-slate-100">
      もっと見る . . .
    </h2>

    <div className="space-y-8">
      {industry && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-[16px] font-medium text-slate-300">
            <span>同じ業種のガイド</span>
            {industryLabel(industry) && (
              <Link href={`/industry/${industry}`}>
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[12px] font-semibold text-cyan-300">
                  {industryLabel(industry)}を見る ›
                </span>
              </Link>
            )}
          </h3>

          <MoreGuideList guides={sameIndustry} />
        </div>
      )}

      {location && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-[16px] font-medium text-slate-300">
            <span>同じエリアのガイド</span>
            <Link href={`/location/${encodeURIComponent(location)}`}>
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[12px] font-semibold text-cyan-300">
                {location}を見る ›
              </span>
            </Link>
          </h3>

          <MoreGuideList guides={sameLocation} />
        </div>
      )}

      <div>
        <h3 className="mb-3 text-[16px] font-medium text-slate-300">
          新着ガイド
        </h3>

        <MoreGuideList guides={latest} />
      </div>
    </div>
  </section>
);
}
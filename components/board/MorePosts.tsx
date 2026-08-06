import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import { categoryLabel, categoryColor } from "@/lib/category-style";
import { industryLabel, industryStyle } from "@/lib/industry-style";

type MorePost = {
  id: number;
  title: string;
  slug: string | null;
  category: string;
  industry: string | null;
  location: string | null;
  created_at: string;
};

type Props = {
  currentPostId: number;
  category: string;
  industry?: string | null;
  basePath?: string;
  dark?: boolean;
};

function girlsPathFromCategory(category: string) {
  if (category === "jobs") return "jobs";
  if (category === "qa") return "qna";
  if (category === "blog") return "blog";
  if (category === "review") return "reviews";

  return "qna";
}

function postHref(post: MorePost, basePath: string) {
  const slug = post.slug || "post";
  const prettySlug = `${post.id}-${encodeURIComponent(slug)}`;

  if (basePath === "/girls") {
    return `/girls/${girlsPathFromCategory(post.category)}/${prettySlug}`;
  }

  return `${basePath}/${prettySlug}`;
}

async function getMorePosts({
  currentPostId,
  category,
  industry,
}: Props) {
  const supabase = await supabaseServer();

  const baseSelect = "id, title, slug, category, industry, location, created_at";

  const sameCategoryQuery = supabase
    .from("board_posts")
    .select(baseSelect)
    .eq("status", "approved")
    .eq("category", category)
    .neq("id", currentPostId)
    .order("created_at", { ascending: false })
    .limit(3);

  const sameIndustryQuery = industry
    ? supabase
        .from("board_posts")
        .select(baseSelect)
        .eq("status", "approved")
        .eq("industry", industry)
        .neq("id", currentPostId)
        .order("created_at", { ascending: false })
        .limit(3)
    : null;

  const [sameCategoryResult, sameIndustryResult] = await Promise.all([
    sameCategoryQuery,
    sameIndustryQuery,
  ]);

  return {
    sameCategory: (sameCategoryResult.data ?? []) as MorePost[],
    sameIndustry: (sameIndustryResult?.data ?? []) as MorePost[],
  };
}

function MorePostList({
  posts,
  basePath,
  dark = false,
}: {
  posts: MorePost[];
  basePath: string;
  dark?: boolean;
}) {
  const colors = dark
  ? {
      border: "border-slate-700",
      text: "text-slate-100 hover:text-cyan-300",
      muted: "text-slate-500",
    }
  : {
      border: "border-[#d7cec3]",
      text: "text-[#4f4a45]",
      muted: "text-[#9a948c]",
    };
  if (!posts.length) {
  return (
    <p className={`text-[13px] ${colors.muted}`}>
      まだ投稿がありません。
    </p>
  );
}

return (
  <div>
    {posts.map((post) => (
      <Link
  key={post.id}
  href={postHref(post, basePath)}
  className={`block border-b border-dotted ${colors.border} py-3`}
>
  <div className="flex items-center gap-2">
    {industryLabel(post.industry) && (
      <span className={industryStyle(post.industry)}>
        {industryLabel(post.industry)}
      </span>
    )}

    <div className={`min-w-0 flex-1 truncate text-[12px] font-medium transition ${colors.text}`}>
      {post.title}
    </div>
  </div>
</Link>
    ))}
  </div>
);
}

export default async function MorePosts({
  currentPostId,
  category,
  industry,
  basePath = "/board",
  dark = false,
}: Props) {
  const { sameCategory, sameIndustry } = await getMorePosts({
    currentPostId,
    category,
    industry,
  });
  const colors = dark
  ? {
      sectionTitle: "text-slate-100",
      heading: "text-slate-300",
      border: "border-slate-700",
      text: "text-slate-100 hover:text-cyan-300",
      muted: "text-slate-500",
      pill: "border border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    }
  : {
      sectionTitle: "text-[#3f3a35]",
      heading: "text-[#6b6259]",
      border: "border-[#d7cec3]",
      text: "text-[#4f4a45]",
      muted: "text-[#9a948c]",
      pill: "rounded-full bg-[#efe7dd] px-2.5 py-1 text-[12px] text-[#7b6b5d]",
    };

  return (
  <section className="mt-12 pt-8">
    <h2 className={`mb-5 text-[18px] font-bold ${colors.sectionTitle}`}>
      もっと見る . . .
    </h2>

    <div className="space-y-8">
      {industry && (
        <div>
          <h3 className={`mb-3 flex items-center gap-2 text-[16px] font-medium ${colors.heading}`}>
            <span>同じ業種の新着</span>
            {industryLabel(industry) && (
              <span className={industryStyle(industry)}>
                {industryLabel(industry)}
              </span>
            )}
          </h3>

          <MorePostList posts={sameIndustry} basePath={basePath} dark={dark} />
        </div>
      )}

      <div>
        <h3 className={`mb-3 flex items-center gap-2 text-[16px] font-medium ${colors.heading}`}>
          <span>新着</span>
          <span className={categoryColor(category)}>
            {categoryLabel(category)}
          </span>
        </h3>

        <MorePostList posts={sameCategory} basePath={basePath} dark={dark} />
      </div>
    </div>
  </section>
);
}
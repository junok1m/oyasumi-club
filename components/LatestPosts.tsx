import Link from "next/link";
import {
  categoryLabel,
  categoryColor,
} from "@/lib/category-style";

import {
  industryLabel,
  industryStyle,
} from "@/lib/industry-style";

import {
  homeListTitle,
  homeListItem,
  homeMeta,
} from "@/lib/home-ui";

import { HomeSection } from "@/components/home/HomeSection";

type LatestPost = {
  id: number;
  title: string;
  category: string;
  industry: string | null;
  pretty_slug: string;
  thumbnail_url: string | null;
  thumbnail_small_url: string | null;
  created_at: string;
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);

  return d.toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
  });
}

export default function LatestPosts({ posts }: { posts: LatestPost[] }) {
  if (!posts.length) return null;

  return (
    <HomeSection title="新着投稿" href="/board">
      <div className="border-t border-[#e7e1d8]">
        {posts.map((post) => {
          const thumbnail =
            post.thumbnail_small_url || post.thumbnail_url;

          return (
            <Link
              key={post.id}
              href={`/board/${post.pretty_slug}`}
              className={`flex items-start gap-3 ${homeListItem}`}
            >
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={categoryColor(post.category)}>
                    {categoryLabel(post.category)}
                  </span>

                  {post.industry && (
                    <span className={industryStyle(post.industry)}>
                      {industryLabel(post.industry)}
                    </span>
                  )}

                  <span className={homeMeta}>
                    {formatDate(post.created_at)}
                  </span>
                </div>

                <h3 className={homeListTitle}>{post.title}</h3>
              </div>

              {thumbnail && (
                <div className="h-[74px] w-[100px] shrink-0 bg-[#e8e1d8]">
                  <img
                    src={thumbnail}
                    alt=""
                    loading="lazy"
                    className="block h-full w-full object-cover"
                  />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </HomeSection>
  );
}
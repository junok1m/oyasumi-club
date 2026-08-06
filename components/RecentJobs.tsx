// components/RecentJobs.tsx

import Link from "next/link";
import {
  industryLabel,
  industryStyle,
} from "@/lib/industry-style";
import { HomeSection } from "@/components/home/HomeSection";
import { homeListTitle, homeListItem } from "@/lib/home-ui";

type JobPost = {
  id: number;
  title: string;
  slug: string | null;
  industry: string | null;
  location: string | null;
  thumbnail_url: string | null;
  thumbnail_small_url: string | null;
  badges?: {
    badge: string;
  }[];
};

function badgeLabel(badge: string) {
  switch (badge) {
    case "new":
      return "新着";
    case "popular":
      return "人気";
    default:
      return badge;
  }
}

function badgeStyle(badge: string) {
  switch (badge) {
    case "new":
      return "px-2.5 py-1 text-[14px] border border-[#e4c8c3] bg-[#f8ece8] text-[#b46d63]";
    case "popular":
      return "px-2.5 py-1 text-[14px] border border-[#ccd8c8] bg-[#eef4ea] text-[#6f8b68]";
    default:
      return "px-2.5 py-1 text-[14px] border border-[#ddd7cf] bg-[#f8f6f2] text-[#8b7d68]";
  }
}

export default function RecentJobs({ posts }: { posts: JobPost[] }) {
  if (!posts.length) return null;

  return (
    <HomeSection title="最近の求人" href="/jobs">
      <div className="border-t border-[#e7e1d8]">
        {posts.map((post) => {
          const thumbnail =
            post.thumbnail_small_url || post.thumbnail_url;

          const prettySlug = post.slug
            ? `${post.id}-${post.slug}`
            : `${post.id}`;

          return (
            <Link
              key={post.id}
              href={`/board/${prettySlug}`}
              className={`flex items-start gap-3 ${homeListItem}`}
            >
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {post.badges?.map((b) => (
                    <span
                      key={b.badge}
                      className={badgeStyle(b.badge)}
                    >
                      {badgeLabel(b.badge)}
                    </span>
                  ))}

                  {post.industry && (
                    <span className={industryStyle(post.industry)}>
                      {industryLabel(post.industry)}
                    </span>
                  )}

                  {post.location && (
                    <span className="px-2.5 py-1 text-[14px] border border-[#e3d8cc] bg-[#f6f1ea] text-[#93897f]">
                      {post.location}
                    </span>
                  )}
                </div>

                <h3 className={homeListTitle}>
                  {post.title}
                </h3>
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
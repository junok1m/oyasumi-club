import Link from "next/link";
import { industryLabel } from "@/lib/industry-style";
import { HomeSection } from "@/components/home/HomeSection";

import {
  homeCard,
  homeCardTitle,
  homeChip,
} from "@/lib/home-ui";

type AdminPickGuide = {
  id: number;
  title: string;
  slug: string | null;
  industry: string | null;
  location: string | null;
  thumbnail_url: string | null;
  thumbnail_small_url: string | null;
  excerpt: string | null;
};

export function HomeAdminPickShops({
  posts,
}: {
  posts: AdminPickGuide[];
}) {
  if (!posts.length) return null;

  return (
    <HomeSection
      title="Adminおすすめのお店"
      href="/guide"
      linkText="すべて見る →"
    >
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto pb-3 pr-8">
          {posts.map((post) => {
            const thumbnail =
              post.thumbnail_small_url || post.thumbnail_url;

            const prettySlug = post.slug
              ? `${post.id}-${post.slug}`
              : `${post.id}`;

            return (
              <Link
                key={post.id}
                href={`/guide/${prettySlug}`}
                className={`w-[72%] max-w-[280px] shrink-0 ${homeCard}`}
              >
                <div className="aspect-[2/3] bg-[#e8e1d8]">
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt=""
                      loading="lazy"
                      className="block h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[22px] text-[#b8aea3]">
                      🌙
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <h3 className={`mb-3 ${homeCardTitle}`}>
                    {post.title}
                  </h3>
 {post.excerpt && (
    <p className="mb-3 line-clamp-2 text-[12px] leading-5 text-[#8d857d]">
      {post.excerpt}
    </p>
  )}
                  <div className="flex flex-wrap items-center gap-2">
                    {post.location && (
                      <span
                        className={`${homeChip} border-[#e3d8cc] bg-[#f6f1ea] text-[#93897f]`}
                      >
                        {post.location}
                      </span>
                    )}

                    {post.industry && (
                      <span
                        className={`${homeChip} border-[#d8cfc5] text-[#8a8279]`}
                      >
                        {industryLabel(post.industry)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-[#151c28] to-transparent" />
      </div>
    </HomeSection>
  );
}
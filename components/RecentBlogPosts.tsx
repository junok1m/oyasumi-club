// components/RecentBlogPosts.tsx

import Link from "next/link";
import { HomeSection } from "@/components/home/HomeSection";
import {
  homeCard,
  homeCardTitle,
} from "@/lib/home-ui";

type BlogPost = {
  id: number;
  title: string;
  slug: string | null;
  thumbnail_url: string | null;
  thumbnail_small_url: string | null;
  excerpt: string | null;
};

export default function RecentBlogPosts({
  posts,
}: {
  posts: BlogPost[];
}) {
  if (!posts.length) return null;

  return (
    <HomeSection
      title="コラム・読み物"
      href="/blog?audience=all,men"
      linkText="もっと読む →"
    >
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto pb-3 pr-8">
          {posts.map((post) => {
            const thumbnail =
              post.thumbnail_small_url ||
              post.thumbnail_url;

            const prettySlug = post.slug
              ? `${post.id}-${post.slug}`
              : `${post.id}`;

            return (
              <Link
                key={post.id}
                href={`/board/${prettySlug}`}
                className={`w-[76vw] max-w-[320px] shrink-0 ${homeCard}`}
              >
                <div className="aspect-[3/2] bg-[#e8e1d8]">
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
                  <h3 className={`${homeCardTitle} mb-3`}>
                    {post.title}
                  </h3>

                  {post.excerpt && (
                    <p className="line-clamp-2 text-[11px] leading-4 text-[#a79d94]">
                      {post.excerpt}
                    </p>
                  )}
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
// components/RecentQnaPosts.tsx

import Link from "next/link";
import { HomeSection } from "@/components/home/HomeSection";
import {
  homeListTitle,
  homeMeta,
  homeListItem,
} from "@/lib/home-ui";

type QnaPost = {
  id: number;
  title: string;
  slug: string | null;
  created_at: string;
  views: number | null;
  views_boost: number | null;
  comments?: {
    count: number;
  }[];
};

function formatRelativeTime(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) return `${diffMinutes}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;

  return date.toLocaleDateString("ja-JP");
}

export default function RecentQnaPosts({
  posts,
}: {
  posts: QnaPost[];
}) {
  if (!posts.length) return null;

  return (
    <HomeSection
      title="みんなのQ&A"
      href="/qna"
    >
      <div className="space-y-0 border-t border-[#e7e1d8]">
        {posts.map((post) => {
          const prettySlug = post.slug
            ? `${post.id}-${post.slug}`
            : `${post.id}`;

          const views =
            (post.views ?? 0) +
            (post.views_boost ?? 0);

          const replies =
            post.comments?.[0]?.count ?? 0;

          return (
            <Link
              key={post.id}
              href={`/board/${prettySlug}#comments`}
              className={`block ${homeListItem}`}
            >
              <div className="flex items-start gap-3">
                <span className="pt-0.5 text-[16px] font-bold text-[#a78865]">
                  Q:
                </span>

                <div className="min-w-0 flex-1">
                  <p className={homeListTitle}>
                    {post.title}
                  </p>

                  <div
                    className={`mt-2 flex items-center gap-4 ${homeMeta}`}
                  >
                    <span className="text-[#03c75a]">
                      {replies}件の回答
                    </span>

                    <span>
                      👀 {views}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </HomeSection>
  );
}
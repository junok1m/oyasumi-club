import Link from "next/link";
import { categoryLabel, categoryStyle, formatDate } from "./profile-utils";

type MyPost = {
  id: number;
  title: string;
  category: string;
  created_at: string;
  expires_at: string | null;
  views: number;
  slug: string;
  status: string;
};
function getPromoRemainingLabel(expiresAt: string | null) {
  if (!expiresAt) return null;

  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return "終了";

  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 1) return "本日終了";

  return `あと${days}日`;
}
export default function ProfileSavedList({
  loading,
  posts,
}: {
  loading: boolean;
  posts: MyPost[];
}) {
  return loading ? (
    <div className="py-10 text-sm text-[#948d85]">Loading...</div>
  ) : posts.length === 0 ? (
    <div className="py-10 text-sm text-[#948d85]">No saved posts yet.</div>
  ) : (
    <div className="space-y-1">
      {posts.map((post) => (
        <div key={post.id} className="border-b border-[#e4ddd4] py-4">
          <div className="flex items-center justify-between text-[11px]">
            <span className={categoryStyle(post.category)}>
              {categoryLabel(post.category)}
            </span>{post.category === "promo" &&
  getPromoRemainingLabel(post.expires_at) && (
    <span className="ml-1 text-[10px] text-[#a80237]">
    {getPromoRemainingLabel(post.expires_at)}
    </span>
)}

            <div className="flex items-center gap-2 text-[#928b83]">
              <span>{formatDate(post.created_at)}</span>
              <span>·</span>
              <span>(post.views ?? 0) + (post.views_boost ?? 0)</span>
            </div>
          </div>

          <Link
            href={`/board/${post.slug ? `${post.id}-${post.slug}` : post.id}`}
            className="mt-2 block text-[15px] text-[#57514b]"
          >
            {post.title}
          </Link>
        </div>
      ))}
    </div>
  );
}
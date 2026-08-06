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
export default function ProfilePostsList({
  loading,
  posts,
  onDeletePost,
}: {
  loading: boolean;
  posts: MyPost[];
  onDeletePost: (postId: number) => void;
}) {
  return loading ? (
    <div className="py-10 text-sm text-[#948d85]">Loading...</div>
  ) : posts.length === 0 ? (
    <div className="space-y-3 py-10">
      <div className="text-sm text-[#948d85]">No posts yet.</div>
      <Link
        href="/board/write"
        className="inline-block border-b border-[#bfb6aa] pb-0.5 text-[12px] uppercase tracking-[0.12em] text-[#5f5a54]"
      >
        Write your first post
      </Link>
    </div>
  ) : (
    <div className="space-y-1">
      {posts.map((post) => {
        const status = post.status?.toLowerCase();

        return (
          <div key={post.id} className="border-b border-[#e4ddd4] py-4">
            <div className="flex items-center justify-between text-[11px]">
              <span className={categoryStyle(post.category)}>
                {categoryLabel(post.category)}
              </span>
{post.category === "promo" &&
  getPromoRemainingLabel(post.expires_at) && (
    <span className="ml-1 text-[10px] text-[#a80237]">
    {getPromoRemainingLabel(post.expires_at)}
    </span>
)}
              <div className="flex items-center gap-2 text-[#928b83]">
                <span>{formatDate(post.created_at)}</span>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-2">
              <Link
                href={`/board/${post.slug ? `${post.id}-${post.slug}` : post.id}`}
                className="block text-[15px] tracking-[-0.01em] text-[#57514b]"
              >
                {post.title}
              </Link>

              {status === "pending" && (
                <span className="rounded-full bg-[#f6e3e3] px-2 py-0.5 text-[10px] text-[#a25c5c]">
                  Pending
                </span>
              )}

              {status === "approved" && (
                <span className="rounded-full bg-[#e4f1e7] px-2 py-0.5 text-[10px] text-[#4f7a5c]">
                  Approved
                </span>
              )}

              {status === "rejected" && (
                <span className="rounded-full bg-[#eee5f6] px-2 py-0.5 text-[10px] text-[#7c669b]">
                  Rejected
                </span>
              )}

              <Link
                href={`/board/${post.id}/edit`}
                className="ml-1 text-[11px] text-[#8e8a84]"
              >
                Edit
              </Link>

              <button
                type="button"
                onClick={() => onDeletePost(post.id)}
                className="text-[11px] text-[#c78fa0]"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
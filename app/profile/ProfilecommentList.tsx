import Link from "next/link";
import { formatDate } from "./profile-utils";

type MyComment = {
  id: number;
  body: string;
  created_at: string;
  post_id: number;
    guide_post_id: number | null;
  status: string;
  board_posts: {
    id: number;
    title: string;
    slug: string | null;
  } | null;
  guide_posts: {
    id: number;
    title: string;
    slug: string | null;
  } | null;
};

export default function ProfileCommentsList({
  loading,
  comments,
}: {
  loading: boolean;
  comments: MyComment[];
}) {
  return loading ? (
    <div className="py-10 text-sm text-[#948d85]">Loading...</div>
  ) : comments.length === 0 ? (
    <div className="space-y-3 py-10">
      <div className="text-sm text-[#948d85]">No comments yet.</div>

      <Link
        href="/board"
        className="inline-block border-b border-[#bfb6aa] pb-0.5 text-[12px] uppercase tracking-[0.12em] text-[#5f5a54]"
      >
        Browse posts
      </Link>
    </div>
  ) : (
    <div className="space-y-1">
      {comments.map((comment) => {
        const boardPost = comment.board_posts;
const guidePost = comment.guide_posts;

const boardSlug = boardPost?.slug
  ? `${boardPost.id}-${boardPost.slug}`
  : boardPost?.id;

const guideSlug = guidePost?.slug
  ? `${guidePost.id}-${guidePost.slug}`
  : guidePost?.id;

const targetHref = boardPost
  ? `/board/${boardSlug}#comments`
  : guidePost
    ? `/guide/${guideSlug}#comments`
    : null;

const targetTitle = boardPost?.title || guidePost?.title;

        return (
          <div
            key={comment.id}
            className="border-b border-[#e4ddd4] py-4"
          >
            <div className="mb-2 flex items-center justify-between text-[11px] text-[#928b83]">
              <span>#{comment.id}</span>
              <span>{formatDate(comment.created_at)}</span>
            </div>

            <p className="whitespace-pre-wrap text-[14px] leading-6 text-[#57514b]">
  {comment.status === "deleted"
    ? "削除されたコメントです"
    : comment.body}
</p>

            {targetHref && targetTitle && (
  <div className="mt-3 text-[12px] text-[#8e8a84]">
    <span className="mr-1">on</span>

    <Link
      href={targetHref}
      className="border-b border-dotted border-[#cfc6bb] text-[#5f5a54]"
    >
      {targetTitle}
    </Link>
  </div>
)}
          </div>
        );
      })}
    </div>
  );
}
import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  hideCommentAction,
  restoreCommentAction,
} from "./actions";

type AdminComment = {
  id: number;
  body: string;
  status: string;
  created_at: string;
  post_id: number;
  board_posts:
    | {
        id: number;
        title: string;
        slug: string | null;
      }
    | {
        id: number;
        title: string;
        slug: string | null;
      }[]
    | null;
  profiles:
    | {
        display_name: string | null;
        email: string | null;
      }
    | {
        display_name: string | null;
        email: string | null;
      }[]
    | null;
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);

  return d.toLocaleString("en-AU", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getOne<T>(value: T | T[] | null) {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

async function requireAdminPage() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }
}

async function getAdminComments(statusFilter: string) {
  const admin = supabaseAdmin();

  let query = admin
    .from("comments")
    .select(`
      id,
      body,
      status,
      created_at,
      post_id,
      board_posts:post_id (
        id,
        title,
        slug
      ),
      profiles:author_id (
        display_name,
        email
      )
    `)
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query.limit(100);

  if (error || !data) {
    console.error("admin comments fetch error:", error);
    return [];
  }

  return data as AdminComment[];
}

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdminPage();

  const params = await searchParams;

  const status =
    params.status && ["all", "visible", "deleted"].includes(params.status)
      ? params.status
      : "visible";

  const comments = await getAdminComments(status);

  const tabs = [
    { label: "Visible", value: "visible" },
    { label: "Deleted", value: "deleted" },
    { label: "All", value: "all" },
  ];

  return (
    <main className="relative left-1/2 min-h-screen w-screen -translate-x-1/2 bg-[#f7f4ee] text-[#5f5a54]">
      <div className="w-full px-6 py-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-medium text-[#4f4a45]">
              Admin / Comments
            </h1>

            <p className="mt-1 text-[12px] text-[#948d85]">
              Manage user comments and hide inappropriate replies.
            </p>
          </div>

          <Link
            href="/profile"
            className="text-[12px] text-[#8e8a84] hover:underline"
          >
            ← Back to profile
          </Link>
        </div>

        <div className="mb-4 flex flex-wrap gap-2 text-[12px]">
          <Link
            href="/admin/posts"
            className="border border-[#ddd6cc] px-3 py-1.5 text-[#8e8a84]"
          >
            Posts
          </Link>

          <Link
            href="/admin/comments"
            className="border border-[#5f5a54] px-3 py-1.5 text-[#4f4a45]"
          >
            Comments
          </Link>

          <Link
            href="/admin/users"
            className="border border-[#ddd6cc] px-3 py-1.5 text-[#8e8a84]"
          >
            Users
          </Link>

          <Link
            href="/admin/guide"
            className="border border-[#ddd6cc] px-3 py-1.5 text-[#8e8a84]"
          >
            Guide
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 text-[12px]">
          {tabs.map((tab) => {
            const active = status === tab.value;

            return (
              <Link
                key={tab.value}
                href={`/admin/comments?status=${tab.value}`}
                className={`border px-3 py-1.5 ${
                  active
                    ? "border-[#5f5a54] text-[#4f4a45]"
                    : "border-[#ddd6cc] text-[#8e8a84]"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {comments.length === 0 ? (
          <div className="py-20 text-sm text-[#948d85]">
            No comments.
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#e7e0d7] bg-[#fbf8f3]">
            <table className="w-full min-w-[980px] text-left text-[13px]">
              <thead className="border-b border-[#e7e0d7] text-[#8e8a84]">
                <tr>
                  <th className="px-3 py-3 font-normal">ID</th>
                  <th className="px-3 py-3 font-normal">Comment</th>
                  <th className="px-3 py-3 font-normal">Author</th>
                  <th className="px-3 py-3 font-normal">Post</th>
                  <th className="px-3 py-3 font-normal">Status</th>
                  <th className="px-3 py-3 font-normal">Created</th>
                  <th className="px-3 py-3 font-normal">Actions</th>
                </tr>
              </thead>

              <tbody>
                {comments.map((comment) => {
                  const post = getOne(comment.board_posts);
                  const author = getOne(comment.profiles);

                  const prettySlug = post?.slug
                    ? `${post.id}-${post.slug}`
                    : post?.id;

                  const authorName =
                    author?.display_name?.trim() ||
                    author?.email ||
                    "Unknown";

                  return (
                    <tr
                      key={comment.id}
                      className="border-b border-[#eee7de] align-top"
                    >
                      <td className="px-3 py-3 text-[#948d85]">
                        {comment.id}
                      </td>

                      <td className="px-3 py-3">
                        <div className="max-w-[420px] whitespace-pre-wrap text-[#4f4a45]">
                          {comment.body}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-[#5f5a54]">
                        {authorName}
                      </td>

                      <td className="px-3 py-3">
                        {post ? (
                          <Link
                            href={`/board/${prettySlug}#comments`}
                            className="text-[#4f4a45] hover:underline"
                          >
                            {post.title}
                          </Link>
                        ) : (
                          <span className="text-[#948d85]">
                            Unknown post
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-3 text-[#948d85]">
                        {comment.status}
                      </td>

                      <td className="px-3 py-3 text-[#948d85]">
                        {formatDate(comment.created_at)}
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          {comment.status !== "deleted" ? (
                            <form action={hideCommentAction}>
                              <input
                                type="hidden"
                                name="commentId"
                                value={comment.id}
                              />

                              <button
                                type="submit"
                                className="border border-[#d8d1c8] px-2 py-1 text-[12px] text-[#9e6d6d]"
                              >
                                hide
                              </button>
                            </form>
                          ) : (
                            <form action={restoreCommentAction}>
                              <input
                                type="hidden"
                                name="commentId"
                                value={comment.id}
                              />

                              <button
                                type="submit"
                                className="border border-[#d8d1c8] px-2 py-1 text-[12px]"
                              >
                                restore
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
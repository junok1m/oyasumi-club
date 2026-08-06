import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  approvePostAction,
  rejectPostAction,
  deletePostAction,
  toggleFeaturedAction,
} from "./actions";

type AdminPost = {
  id: number;
  title: string;
  excerpt: string | null;
  category: string;
  status: string;
  is_featured: boolean;
  created_at: string;
  slug: string;
  views: number;
  profiles:
  | {
    display_name: string | null;
  }
  | {
    display_name: string | null;
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

function getAuthorName(profile: AdminPost["profiles"]) {
  if (!profile) return "Unknown";

  const p = Array.isArray(profile) ? profile[0] : profile;
  if (!p) return "Unknown";

  return p.display_name?.trim() || "Unknown";
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

async function getAdminPosts(
  statusFilter: string,
  categoryFilter: string
) {
  const admin = supabaseAdmin();

  let query = admin
    .from("board_posts")
    .select(
      `
      id,
      title,
      excerpt,
      category,
      status,
      is_featured,
      created_at,
      slug,
      views,
      profiles:author_id (
        display_name
      )
    `
    )
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }
if (categoryFilter !== "all") {
  query = query.eq("category", categoryFilter);
}
  const { data, error } = await query.limit(100);

  if (error || !data) {
    console.error("admin posts fetch error:", error);
    return [];
  }

  return data as AdminPost[];
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    category?: string;
  }>;
}) {
  await requireAdminPage();

  
  const params = await searchParams;
  const status =
    params.status && ["all", "pending", "approved", "rejected", "deleted"].includes(params.status)
      ? params.status
      : "pending";
  const category =
    params.category &&
      ["all", "blog", "jobs", "promo", "qa", "news"].includes(params.category)
      ? params.category
      : "all";
  const categories = [
  { label: "All", value: "all" },
  { label: "Blog", value: "blog" },
  { label: "Jobs", value: "jobs" },
  { label: "Promo", value: "promo" },
  { label: "Q&A", value: "qa" },
  { label: "News", value: "news" },
];
  const posts = await getAdminPosts(
    status, category);

  const tabs = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
    { label: "Deleted", value: "deleted" },
    { label: "All", value: "all" },
  ];

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#5f5a54] relative left-1/2 w-screen -translate-x-1/2">
      <div className="w-full px-6 py-8">        <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-medium text-[#4f4a45]">Admin / Posts</h1>
          <p className="mt-1 text-[12px] text-[#948d85]">
            Manage pending, featured, and moderation status.
          </p>
        </div>

        <Link href="/profile" className="text-[12px] text-[#8e8a84] hover:underline">
          ← Back to profile
        </Link>
      </div>

        <div className="mb-6 flex flex-wrap gap-2 text-[12px]">
          {tabs.map((tab) => {
            const active = status === tab.value;

            return (
              <Link
                key={tab.value}
                href={`/admin/posts?status=${tab.value}`}
                className={`border px-3 py-1.5 ${active
                  ? "border-[#5f5a54] text-[#4f4a45]"
                  : "border-[#ddd6cc] text-[#8e8a84]"
                  }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
<div className="mb-6 flex flex-wrap gap-2 text-[12px]">
  {categories.map((cat) => {
    const active = category === cat.value;

    return (
      <Link
        key={cat.value}
        href={`/admin/posts?status=${status}&category=${cat.value}`}
        className={`border px-3 py-1.5 ${
          active
            ? "border-[#5f5a54] text-[#4f4a45]"
            : "border-[#ddd6cc] text-[#8e8a84]"
        }`}
      >
        {cat.label}
      </Link>
    );
  })}
</div>
        {posts.length === 0 ? (
          <div className="py-20 text-sm text-[#948d85]">No posts.</div>
        ) : (
          <div className="overflow-x-auto border border-[#e7e0d7] bg-[#fbf8f3]">
            <table className="w-full min-w-[980px] text-left text-[13px]">
              <thead className="border-b border-[#e7e0d7] text-[#8e8a84]">
                <tr>
                  <th className="px-3 py-3 font-normal">ID</th>
                  <th className="px-3 py-3 font-normal">Title</th>
                  <th className="px-3 py-3 font-normal">TL;DR</th>
                  <th className="px-3 py-3 font-normal">Author</th>
                  <th className="px-3 py-3 font-normal">Category</th>
                  <th className="px-3 py-3 font-normal">Status</th>
                  <th className="px-3 py-3 font-normal">Featured</th>
                  <th className="px-3 py-3 font-normal">Views</th>
                  <th className="px-3 py-3 font-normal">Created</th>
                  <th className="px-3 py-3 font-normal">Actions</th>
                </tr>
              </thead>

              <tbody>
                {posts.map((post) => {
                  const prettySlug = post.slug ? `${post.id}-${post.slug}` : String(post.id);

                  return (
                    <tr key={post.id} className="border-b border-[#eee7de] align-top">
                      <td className="px-3 py-3 text-[#948d85]">{post.id}</td>

                      <td className="px-3 py-3">
                        <div className="max-w-[320px]">
                          <Link
                            href={`/board/${prettySlug}`}
                            className="text-[#4f4a45] hover:underline"
                          >
                            {post.title}
                          </Link>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[#948d85]">
                        {post.excerpt?.trim() ? (
                          <span className="text-[#6f8a6a]">yes</span>
                        ) : (
                          <span className="text-[#b88989]">missing</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-[#5f5a54]">
                        {getAuthorName(post.profiles)}
                      </td>

                      <td className="px-3 py-3 text-[#948d85]">{post.category}</td>
                      <td className="px-3 py-3 text-[#948d85]">{post.status}</td>
                      <td className="px-3 py-3 text-[#948d85]">
                        {post.is_featured ? "yes" : "no"}
                      </td>
                      <td className="px-3 py-3 text-[#948d85]">{post.views}</td>
                      <td className="px-3 py-3 text-[#948d85]">{formatDate(post.created_at)}</td>

                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/board/${prettySlug}/edit`}
                            className="border border-[#d8d1c8] px-2 py-1 text-[12px] text-[#5f5a54]"
                          >
                            edit
                          </Link>
                          {post.status !== "approved" && post.status !== "deleted" && (
                            <form action={approvePostAction}>
                              <input type="hidden" name="postId" value={post.id} />
                              <button
                                type="submit"
                                className="border border-[#d8d1c8] px-2 py-1 text-[12px]"
                              >
                                approve
                              </button>
                            </form>
                          )}

                          {post.status !== "rejected" && post.status !== "deleted" && (
                            <form action={rejectPostAction}>
                              <input type="hidden" name="postId" value={post.id} />
                              <button
                                type="submit"
                                className="border border-[#d8d1c8] px-2 py-1 text-[12px]"
                              >
                                reject
                              </button>
                            </form>
                          )}

                          {post.status !== "deleted" && (
                            <form action={toggleFeaturedAction}>
                              <input type="hidden" name="postId" value={post.id} />
                              <input
                                type="hidden"
                                name="currentValue"
                                value={String(post.is_featured)}
                              />
                              <button
                                type="submit"
                                className="border border-[#d8d1c8] px-2 py-1 text-[12px]"
                              >
                                {post.is_featured ? "unfeature" : "feature"}
                              </button>
                            </form>
                          )}

                          {post.status !== "deleted" && (
                            <form action={deletePostAction}>
                              <input type="hidden" name="postId" value={post.id} />
                              <button
                                type="submit"
                                className="border border-[#d8d1c8] px-2 py-1 text-[12px] text-[#9e6d6d]"
                              >
                                delete
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
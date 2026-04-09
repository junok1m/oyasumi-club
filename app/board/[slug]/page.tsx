import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";

type BoardDetail = {
  id: number;
  author_id: string;
  category: string;
  title: string;
  slug: string;
  body: string;
  views: number;
  created_at: string;
  thumbnail_url: string | null;
  profile: {
    username: string | null;
    display_name: string | null;
  } | null;
};

async function getPost(prettySlug?: string): Promise<BoardDetail | null> {
  if (!prettySlug) return null;

  const postId = prettySlug.split("-")[0];

  if (!postId || Number.isNaN(Number(postId))) {
    return null;
  }

  try {
    const supabase = await supabaseServer();

const { data, error } = await supabase
  .from("board_posts")
      .select(`
        id,
        author_id,
        category,
        title,
        slug,
        body,
        views,
        created_at,
        thumbnail_url,
        profiles:author_id (
          username,
          display_name
        )
      `)
      .eq("id", Number(postId))
      .single();

    if (error || !data) {
      console.error("getPost failed:", error);
      return null;
    }

    const profile = Array.isArray(data.profiles) ? data.profiles[0] ?? null : null;

    return {
      id: data.id,
      author_id: data.author_id,
      category: data.category,
      title: data.title,
      slug: data.slug,
      body: data.body,
      views: data.views,
      created_at: data.created_at,
      thumbnail_url: data.thumbnail_url,
      profile,
    };
  } catch (error) {
    console.error("getPost failed:", error);
    return null;
  }
}

function formatDate(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  return `${day}${month}${year}`;
}

function categoryStyle(cat: string) {
  switch (cat) {
    case "news":
      return "text-[#7da6c6]";
    case "blog":
      return "text-[#8fb39a]";
    case "jobs":
      return "text-[#c78fa0]";
    case "promo":
      return "text-[#b49ac8]";
    default:
      return "text-[#8e8a84]";
  }
}

function categoryLabel(cat: string) {
  switch (cat) {
    case "news":
      return "News";
    case "blog":
      return "Blog";
    case "jobs":
      return "Jobs";
    case "promo":
      return "Promo";
    default:
      return cat;
  }
}

export default async function BoardDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return (
      <main className="min-h-screen bg-[#f7f4ee] text-[#5f5a54]">
        <div className="mx-auto w-[92%] max-w-5xl py-6 md:w-[86%] md:py-10">
          <div className="mb-8">
            <Link href="/board" className="block w-fit text-[12px] text-[#8e8a84]">
              ← Back to board
            </Link>
          </div>
          <p className="text-sm text-[#948d85]">Post not found.</p>
        </div>
      </main>
    );
  }

  const incomingId = slug.split("-")[0];
  const incomingTail = slug.includes("-") ? slug.slice(slug.indexOf("-") + 1) : "";
  const canonicalTail = post.slug || "";
  const canonicalSlug = canonicalTail ? `${post.id}-${canonicalTail}` : `${post.id}`;

  const shouldRedirect =
    incomingId !== String(post.id) ||
    (canonicalTail !== "" && incomingTail !== canonicalTail);

  if (shouldRedirect) {
    redirect(`/board/${canonicalSlug}`);
  }

  const authorName =
    post.profile?.display_name ||
    post.profile?.username ||
    "Unknown";

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#5f5a54]">
      <div className="mx-auto w-[92%] max-w-5xl py-6 md:w-[86%] md:py-10">
        <div className="mb-8">
          <Link href="/board" className="block w-fit text-[12px] text-[#8e8a84]">
            &lt;&lt; BACK TO BOARD
          </Link>
        </div>

        <article>
          <h1 className="text-[30px] font-medium leading-[1.18] tracking-[-0.02em] text-[#4f4a45] md:text-[40px]">
            {post.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#8e8a84]">
            <span className={categoryStyle(post.category)}>
              {categoryLabel(post.category)}
            </span>
            <span className="text-[#5f5a54]">{authorName}</span>
            <span>{formatDate(post.created_at)}</span>
            <span className="text-[#b5aea6]">{post.views} views</span>
          </div>

          {post.thumbnail_url && (
            <img
              src={post.thumbnail_url}
              alt={post.title}
              className="mt-8 w-full max-w-3xl object-cover"
            />
          )}

          <div className="mt-8 whitespace-pre-wrap text-[16px] leading-8 text-[#5b5650]">
            {post.body}
          </div>
        </article>
      </div>
    </main>
  );
}
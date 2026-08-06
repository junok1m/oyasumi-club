import { supabaseServer } from "@/lib/supabase-server";
import Link from "next/link";
import { notFound } from "next/navigation";

type Profile = {
  id: string;
  display_name: string | null;
  bio: string | null;
  work_category: string | null;
  location: string | null;
  website: string | null;
  phone: string | null;
};

type Post = {
  id: number;
  title: string;
  slug: string | null;
  created_at: string;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function workCategoryLabel(category: string | null) {
  switch (category) {
    case "fuzoku":
      return "風俗";
    case "karaoke":
      return "カラオケ";
    case "ktv":
      return "KTV";
    case "massage":
      return "マッサージ";
    case "club":
      return "クラブ";
    case "restaurant":
      return "レストラン";
    case "bar":
      return "バー";
    case "full_service":
      return "Full Service";
    case "escort":
      return "Escort";
    case "independent":
      return "Independent";
    default:
      return null;
  }
}
async function getProfile(displayName: string): Promise<Profile | null> {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("public_profiles")
    .select("id, display_name, work_category, bio, location, website, phone")
    .eq("display_name", displayName)
    .maybeSingle();

  if (error) {
    console.error("getProfile error:", error);
    return null;
  }

  return data;
}

async function getUserPosts(userId: string): Promise<Post[]> {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("board_posts")
    .select("id, title, slug, created_at")
    .eq("author_id", userId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) {
    console.error("getUserPosts error:", error);
    return [];
  }

  return data;
}

export default async function Page({
  params,
}: {
  params: Promise<{ display_name: string }>;
}) {
  const { display_name } = await params;
  const decodedName = decodeURIComponent(display_name);

  const profile = await getProfile(decodedName);

  if (!profile) {
    notFound();
  }

  const posts = await getUserPosts(profile.id);

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#5f5a54]">
      <div className="mx-auto w-[92%] max-w-3xl py-10">
        <div className="mb-10 border-b border-[#ece6de] pb-6">
          <h1 className="text-[20px] font-medium text-[#4f4a45]">
            {profile.display_name || "unknown"}
          </h1>
{workCategoryLabel(profile.work_category) && (
  <div className="mt-2 text-[13px] text-[#9b948c]">
    🏷️ {workCategoryLabel(profile.work_category)}
  </div>
)}
          {profile.location && (
            <div className="mt-2 text-[13px] text-[#9b948c]">
              📍 {profile.location}
            </div>
          )}

          {profile.bio && (
            <p className="mt-3 text-[13px] leading-relaxed text-[#7f776f]">
              {profile.bio}
            </p>
          )}
          {profile.website && (
  <div className="mt-2 text-[13px] text-[#7f776f]">
    🌐 <a
      href={profile.website}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-2"
    >
      {profile.website}
    </a>
  </div>
)}

{profile.phone && (
  <div className="mt-2 text-[13px] text-[#7f776f]">
    ☎️ {profile.phone}
  </div>
)}
        </div>

        <div>
          <h2 className="mb-4 text-[14px] text-[#7f776f]">
            Posts ({posts.length})
          </h2>

          {posts.length === 0 ? (
            <div className="text-[13px] text-[#9b948c]">No posts yet.</div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => {
                const prettySlug = post.slug
                  ? `${post.id}-${post.slug}`
                  : `${post.id}`;

                return (
                  <div
                    key={post.id}
                    className="border-b border-[#e7e0d7] pb-3"
                  >
                    <Link
                      href={`/board/${prettySlug}`}
                      className="text-[14px] text-[#4f4a45]"
                    >
                      {post.title}
                    </Link>

                    <div className="mt-1 text-[12px] text-[#9b948c]">
                      {formatDate(post.created_at)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
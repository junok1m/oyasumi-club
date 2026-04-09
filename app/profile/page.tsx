"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getMyProfile } from "@/lib/auth";

type MyPost = {
  id: number;
  title: string;
  category: string;
  created_at: string;
  views: number;
  slug: string;
  status: string;
};

type MyProfile = {
  id: string;
  email: string | null;
  role: string;
  display_name: string | null;
  work_category: string | null;
  location: string | null;
  bio: string | null;
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function categoryStyle(cat: string) {
  switch (cat) {
    case "news":
      return "text-[#7da6c6]";
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
    case "jobs":
      return "Jobs";
    case "promo":
      return "Promo";
    case "blog":
      return "Blog";
    default:
      return cat;
  }
}

export default function ProfilePage() {
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [workCategory, setWorkCategory] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getMyProfile();

        if (!data) {
          setProfile(null);
          return;
        }

        setProfile(data);
        setDisplayName(data.display_name || "");
        setWorkCategory(data.work_category || "");
        setLocation(data.location || "");
        setBio(data.bio || "");
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setProfile(null);
      } finally {
        setProfileLoading(false);
      }
    }

    async function fetchMyPosts() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setPosts([]);
          return;
        }

        const { data, error } = await supabase
          .from("board_posts")
          .select("id, title, category, created_at, views, slug, status")
          .eq("author_id", user.id)
          .neq("status", "deleted")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Failed to fetch my posts:", error);
          setPosts([]);
          return;
        }

        setPosts(data ?? []);
      } catch (error) {
        console.error("Failed to fetch my posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
    fetchMyPosts();
  }, []);

  async function handleSaveProfile() {
    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please log in.");
        return;
      }

      const trimmedDisplayName = displayName.trim();

      const { data, error } = await supabase
        .from("profiles")
        .update({
          display_name: trimmedDisplayName || null,
          work_category: workCategory || null,
          location: location.trim() || null,
          bio: bio.trim() || null,
        })
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        alert(error.message || "Failed to save profile");
        return;
      }

      setProfile(data);
      setDisplayName(data.display_name || "");
      setWorkCategory(data.work_category || "");
      setLocation(data.location || "");
      setBio(data.bio || "");
      alert("License updated.");
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePost(postId: number) {
    const ok = window.confirm("Delete this post?");
    if (!ok) return;

    try {
      const { error } = await supabase.rpc("soft_delete_board_post", {
        target_post_id: postId,
      });

      if (error) {
        alert(error.message || "Failed to delete post.");
        return;
      }

      setPosts((prev) => prev.filter((post) => post.id !== postId));
      alert("Post deleted.");
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Something went wrong.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-4 py-8 text-[#5f5a54]">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="flex items-center justify-between">
          <Link href="/board" className="text-[12px] text-[#8e8a84]">
            &lt;&lt; BACK
          </Link>
          <Link href="/board/write" className="text-[12px] text-[#7d766e]">
            Write Post
          </Link>
        </div>

        <section className="overflow-hidden rounded-[24px] border border-[#d7cec3] bg-[#fffaf3] shadow-[0_8px_30px_rgba(95,90,84,0.08)]">
          <div className="border-b border-[#d7cec3] bg-[linear-gradient(90deg,#b98d3d_0%,#c99ebd_35%,#9db4d8_68%,#e8d2a8_100%)] px-5 py-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/80">
                  Oyasumi Club
                </p>
                <h1 className="text-[32px] font-black tracking-[0.04em] text-[#2f2a26]">
                  MEMBER LICENSE
                </h1>
              </div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#2f2a26]">
                profile card
              </p>
            </div>
          </div>

          {profileLoading ? (
            <div className="p-6 text-sm text-[#948d85]">Loading license...</div>
          ) : !profile ? (
            <div className="p-6 text-sm text-[#948d85]">Failed to load profile.</div>
          ) : (
            <div className="grid gap-6 p-5 md:grid-cols-[190px_1fr]">
              <div className="space-y-3">
                <div className="flex aspect-[3/4] items-center justify-center rounded-[18px] border border-[#d7cec3] bg-[#efe7dc] text-center text-[12px] uppercase tracking-[0.16em] text-[#9a9187]">
                  photo
                  <br />
                  coming soon
                </div>

                <div className="rounded-[18px] border border-[#d7cec3] bg-white px-3 py-3">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#9a9187]">
                    role
                  </p>
                  <p className="mt-1 text-[15px] font-medium capitalize text-[#4f4a45]">
                    {profile.role}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-[#9a9187]">
                      display name
                    </label>
                    <input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      maxLength={20}
                      className="w-full rounded-[14px] border border-[#d7cec3] bg-white px-3 py-2 text-[15px] outline-none"
                      placeholder="e.g. さくら"
                    />
                    <p className="mt-1 text-right text-[10px] text-[#9a9187]">
                      {displayName.length}/20
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-[#9a9187]">
                      email
                    </label>
                    <div className="rounded-[14px] border border-[#d7cec3] bg-[#f8f4ee] px-3 py-2 text-[14px] text-[#57514b]">
                      {profile.email}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-[#9a9187]">
                      location
                    </label>
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full rounded-[14px] border border-[#d7cec3] bg-white px-3 py-2 text-[14px] outline-none"
                      placeholder="e.g. Sydney"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-[#9a9187]">
                      work category
                    </label>
                    <select
                      value={workCategory}
                      onChange={(e) => setWorkCategory(e.target.value)}
                      className="w-full rounded-[14px] border border-[#d7cec3] bg-white px-3 py-2 text-[14px] outline-none"
                    >
                      <option value="">Select category</option>
                      <option value="ktv">KTV</option>
                      <option value="massage">Massage</option>
                      <option value="full_service">Full Service</option>
                      <option value="escort">Escort</option>
                      <option value="independent">Independent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-[#9a9187]">
                    bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full rounded-[16px] border border-[#d7cec3] bg-white px-3 py-3 text-[14px] outline-none"
                    placeholder="short intro..."
                  />
                </div>

                <div className="flex items-center justify-between border-t border-dashed border-[#d7cec3] pt-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#9a9187]">
                      status
                    </p>
                    <p className="text-[14px] text-[#4f4a45]">valid member</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="rounded-full border border-[#bba781] bg-[#f3e7d2] px-4 py-2 text-[12px] uppercase tracking-[0.12em] text-[#6f5e44] disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save License"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-[13px] uppercase tracking-[0.16em] text-[#8e8a84]">
              My Posts
            </h2>
          </div>

          {loading ? (
            <div className="py-10 text-sm text-[#948d85]">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="py-10 text-sm text-[#948d85]">No posts yet.</div>
          ) : (
            <div className="space-y-1">
              {posts.map((post) => {
                const status = post.status?.toLowerCase();

                return (
                  <div key={post.id} className="border-b border-[#e4ddd4] py-4">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className={categoryStyle(post.category)}>
                          {categoryLabel(post.category)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[#928b83]">
                        <span>{formatDate(post.created_at)}</span>
                        <span>·</span>
                        <span>{post.views}</span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <Link
                        href={`/board/${post.slug ? `${post.id}-${post.slug}` : post.id}`}
                        className="block text-[15px] tracking-[-0.01em] text-[#57514b]"
                      >
                        {post.title}
                      </Link>

                      {status === "pending" && (
                        <span className="rounded-full bg-[#f6e3e3] px-2 py-[2px] text-[10px] text-[#a25c5c]">
                          Pending
                        </span>
                      )}

                      {status === "approved" && (
                        <span className="rounded-full bg-[#e4f1e7] px-2 py-[2px] text-[10px] text-[#4f7a5c]">
                          Approved
                        </span>
                      )}

                      {status === "rejected" && (
                        <span className="rounded-full bg-[#eee5f6] px-2 py-[2px] text-[10px] text-[#7c669b]">
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
                        onClick={() => handleDeletePost(post.id)}
                        className="text-[11px] text-[#c78fa0]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
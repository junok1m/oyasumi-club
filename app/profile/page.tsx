"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProfileForm from "./ProfileForm";
import ProfilePostsList from "./ProfilePostList";
import ProfileSavedList from "./ProfileSavedList";
import { Suspense } from "react";
import ProfileCommentsList from "./ProfilecommentList";

type MyPost = {
  id: number;
  title: string;
  category: string;
  created_at: string;
  views: number;
  views_boost: number;
  slug: string;
  status: string;
  expires_at: string | null;
};

type MyProfile = {
  id: string;
  email: string | null;
  role: string;
  display_name: string | null;
  work_category: string | null;
  location: string | null;
  bio: string | null;
  website: string | null;
  phone: string | null;
};

type MessageState = {
  text: string;
  type: "success" | "error";
} | null;

function ProfileContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] =
    useState<"posts" | "comments" | "saved">("posts");

  const [posts, setPosts] = useState<MyPost[]>([]);
  const [loading, setLoading] = useState(true);

  const [savedPosts, setSavedPosts] = useState<MyPost[]>([]);
  const [savedLoading, setSavedLoading] = useState(true);

  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);

  const [role, setRole] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [workCategory, setWorkCategory] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");

  const [message, setMessage] = useState<MessageState>(null);
  const searchParams = useSearchParams();
  const posted = searchParams.get("posted");

  const pendingMessage =
    posted === "pending"
      ? "投稿が完了しました。"
      : posted === "edited"
        ? "投稿を更新しました。"
        : null;

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage(null);
    }, 2500);

    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    let cancelled = false;

    async function loadProfilePage() {
      try {
        setProfileLoading(true);
        setLoading(true);
        setSavedLoading(true);
        setCommentsLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (userError || !user) {
          router.replace("/login?next=/profile");
          return;
        }

        setAuthReady(true);

        const [
          profileResult,
          postsResult,
          savedResult,
          commentsResult,
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select(
              "id, email, role, display_name, work_category, location, bio, website, phone"
            )
            .eq("id", user.id)
            .single(),

          supabase
            .from("board_posts")
            .select(
              "id,title, category, created_at, expires_at, views, views_boost, slug, status"
            )
            .eq("author_id", user.id)
            .neq("status", "deleted")
            .order("created_at", { ascending: false }),

          supabase
            .from("saved_posts")
            .select(`
              post_id,
              board_posts (
                id,
                title,
                category,
                created_at,
                expires_at,
                views,
                views_boost,
                slug,
                status
              )
            `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),

          supabase
            .from("comments")
            .select(`
              id,
              body,
              created_at,
              status,
              post_id,
              board_posts (
                id,
                title,
                slug
              ),
              guide_post_id,
              guide_posts (
                id,
                title,
                slug
              )
            `)
            .eq("author_id", user.id)
            .order("created_at", { ascending: false }),
        ]);

        if (cancelled) return;

        if (profileResult.error) {
          console.error("Failed to fetch profile:", profileResult.error);
          setProfile(null);
        } else {
          const data = profileResult.data;

          setProfile(data);
          setRole(data.role || "");
          setDisplayName(data.display_name || "");
          setWorkCategory(data.work_category || "");
          setLocation(data.location || "");
          setBio(data.bio || "");
          setWebsite(data.website || "");
          setPhone(data.phone || "");
        }

        if (postsResult.error) {
          console.error("Failed to fetch my posts:", postsResult.error);
          setPosts([]);
        } else {
          setPosts(postsResult.data ?? []);
        }

        if (commentsResult.error) {
          setComments([]);
        } else {
          setComments(commentsResult.data ?? []);
        }

        if (savedResult.error) {
          console.error("Failed to fetch saved posts:", savedResult.error);
          setSavedPosts([]);
        } else {
          const mapped = (savedResult.data ?? [])
            .map((item: any) => item.board_posts)
            .filter(Boolean);

          setSavedPosts(mapped);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load profile page:", error);
          setProfile(null);
          setPosts([]);
          setSavedPosts([]);
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
          setLoading(false);
          setSavedLoading(false);
          setCommentsLoading(false);
        }
      }
    }

    loadProfilePage();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setMessage({
        text: "ログアウトに失敗しました。",
        type: "error",
      });
      setLoggingOut(false);
    }
  }

  async function handleSaveProfile() {
    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage({
          text: "ログインが必要です。",
          type: "error",
        });
        router.replace("/login?next=/profile");
        return;
      }

      if (!role) {
        setMessage({
          text: "ロールを選択してください。",
          type: "error",
        });
        return;
      }

      const trimmedDisplayName = displayName.trim();
      const trimmedWebsite = website.trim();
      const trimmedPhone = phone.trim();

      const { data, error } = await supabase
        .from("profiles")
        .update({
          role,
          display_name: trimmedDisplayName || null,
          work_category: workCategory || null,
          location: location.trim() || null,
          bio: bio.trim() || null,
          website: trimmedWebsite || null,
          phone: trimmedPhone || null,
        })
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        setMessage({
          text: error.message || "プロフィールを保存できませんでした。",
          type: "error",
        });
        return;
      }

      setProfile(data);
      setRole(data.role || "");
      setDisplayName(data.display_name || "");
      setWorkCategory(data.work_category || "");
      setLocation(data.location || "");
      setBio(data.bio || "");
      setWebsite(data.website || "");
      setPhone(data.phone || "");
      setMessage({
        text: "プロフィールを更新しました。",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to save profile:", error);
      setMessage({
        text: "エラーが発生しました。",
        type: "error",
      });
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
        setMessage({
          text: error.message || "投稿を削除できませんでした。",
          type: "error",
        });
        return;
      }

      setPosts((prev) => prev.filter((post) => post.id !== postId));
      setMessage({
        text: "投稿を削除しました。",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to delete post:", error);
      setMessage({
        text: "エラーが発生しました。",
        type: "error",
      });
    }
  }

  if (!authReady) {
    return (
      <main className="min-h-screen bg-[#f7f4ee] px-4 pt-10 text-[#5f5a54]">
        <p className="text-center text-sm text-[#8e8a84]">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-4 pb-24 pt-6 text-[#5f5a54]">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-[12px] tracking-[0.08em] text-[#8e8a84]"
          >
            << HOME
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              href="/board/write"
              className="rounded-full border border-[#cfc6bb] bg-white px-4 py-2 text-[13px] font-semibold text-[#5f5a54]"
            >
              Write Post
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-full bg-[#4f3a4f] px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
            >
              {loggingOut ? "..." : "Logout"}
            </button>
          </div>
        </div>

        {pendingMessage && (
          <div className="border border-dotted border-[#d8cfc3] bg-[#fffaf4] px-4 py-3 text-[13px] leading-relaxed text-[#5f5a54]">
            <p>{pendingMessage}</p>
            <p className="mt-1 text-[12px] text-[#8d857c]">
              記事は管理者の承認後に公開されます。
            </p>

            <div className="mt-3 flex gap-4 text-[12px]">
              <Link href="/" className="border-b border-dotted border-[#cfc6bb]">
                ホームを見る
              </Link>

              <Link
                href="/board/write"
                className="border-b border-dotted border-[#cfc6bb]"
              >
                新しい投稿を書く
              </Link>
            </div>
          </div>
        )}

        <ProfileForm
          profileLoading={profileLoading}
          profile={profile}
          role={role}
          setRole={setRole}
          displayName={displayName}
          setDisplayName={setDisplayName}
          location={location}
          setLocation={setLocation}
          workCategory={workCategory}
          setWorkCategory={setWorkCategory}
          bio={bio}
          setBio={setBio}
          website={website}
          setWebsite={setWebsite}
          phone={phone}
          setPhone={setPhone}
          saving={saving}
          onSave={handleSaveProfile}
        />

        {message && (
          <div
            className={`rounded-lg px-3 py-2 text-[12px] ${
              message.type === "success"
                ? "bg-[#eef6ee] text-[#4f7a5c]"
                : "bg-[#fbefea] text-[#b1643d]"
            }`}
          >
            {message.text}
          </div>
        )}

        {profile?.role === "admin" && (
          <section className="rounded-2xl border border-[#e0d7cc] bg-[#fffaf4] px-4 py-4">
            <p className="mb-3 text-[13px] font-bold text-[#4f3a4f]">
              🚪 アドミン区画
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/posts"
                className="rounded-full border border-[#ddd4c9] bg-white px-3 py-1.5 text-[12px] font-medium"
              >
                Posts
              </Link>
              <Link
                href="/admin/comments"
                className="rounded-full border border-[#ddd4c9] bg-white px-3 py-1.5 text-[12px] font-medium"
              >
                Comments
              </Link>
              <Link
                href="/admin/users"
                className="rounded-full border border-[#ddd4c9] bg-white px-3 py-1.5 text-[12px] font-medium"
              >
                Users
              </Link>
              <Link
                href="/admin/guide"
                className="rounded-full border border-[#ddd4c9] bg-white px-3 py-1.5 text-[12px] font-medium"
              >
                Guide
              </Link>
            </div>
          </section>
        )}

        <section>
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("posts")}
              className={`rounded-full px-3 py-1.5 text-[12px] transition ${
                activeTab === "posts"
                  ? "bg-[#e9e3dc] font-semibold text-[#4f4a45]"
                  : "text-[#9b948c]"
              }`}
            >
              My Posts
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("comments")}
              className={`rounded-full px-3 py-1.5 text-[12px] transition ${
                activeTab === "comments"
                  ? "bg-[#e9e3dc] font-semibold text-[#4f4a45]"
                  : "text-[#9b948c]"
              }`}
            >
              Comments
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("saved")}
              className={`rounded-full px-3 py-1.5 text-[12px] transition ${
                activeTab === "saved"
                  ? "bg-[#e9e3dc] font-semibold text-[#4f4a45]"
                  : "text-[#9b948c]"
              }`}
            >
              Saved
            </button>
          </div>

          {activeTab === "posts" ? (
            <ProfilePostsList
              loading={loading}
              posts={posts}
              onDeletePost={handleDeletePost}
            />
          ) : activeTab === "comments" ? (
            <ProfileCommentsList
              loading={commentsLoading}
              comments={comments}
            />
          ) : (
            <ProfileSavedList loading={savedLoading} posts={savedPosts} />
          )}
        </section>
      </div>

      <Link
        href="/board/write"
        className="
          fixed bottom-20 right-4 z-30
          border border-[#cfc6bb]
          bg-[#f7f4ee]
          px-4 py-2 text-[12px]
          tracking-[0.12em]
          text-[#5f5a54]
          shadow-[0_0_14px_rgba(207,198,187,0.7)]
          sm:hidden
        "
      >
        投稿
      </Link>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f7f4ee]" />}>
      <ProfileContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type BoardPost = {
  id: number;
  title: string;
  body: string;
  category: string;
  author_id: string;
};

export default function EditPage() {
  const params = useParams();
  const router = useRouter();

  const slug = params.slug as string;
  const postId = Number(slug.split("-")[0]);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          alert("login required");
          router.push("/login");
          return;
        }

        const { data, error } = await supabase
          .from("board_posts")
          .select("id, title, body, category, author_id")
          .eq("id", postId)
          .single<BoardPost>();

        if (error || !data) {
          console.error(error);
          alert("post not found");
          router.push("/board");
          return;
        }

        if (data.author_id !== user.id) {
          alert("not allowed");
          router.push(`/board/${slug}`);
          return;
        }

        setTitle(data.title);
        setBody(data.body);
        setCategory(data.category);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    if (!Number.isNaN(postId)) {
      fetchPost();
    } else {
      setLoading(false);
      alert("invalid post");
      router.push("/board");
    }
  }, [postId, router, slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("login required");
        router.push("/login");
        return;
      }

      const { error } = await supabase
        .from("board_posts")
        .update({
          title,
          body,
          category,
        })
        .eq("id", postId)
        .eq("author_id", user.id);

      if (error) {
        console.error(error);
        alert("failed to update");
        return;
      }

      router.push(`/board/${slug}`);
    } catch (err) {
      console.error(err);
      alert("something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-6 text-sm">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#5f5a54]">
      <div className="mx-auto w-[92%] max-w-3xl py-8">
        <div className="mb-6 text-[12px] text-[#8e8a84]">
          Editing post
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-[#ddd6cc] px-3 py-2 text-sm"
          />

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="w-full border border-[#ddd6cc] px-3 py-2 text-sm"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-[#ddd6cc] px-3 py-2 text-sm"
          >
            <option value="news">News</option>
            <option value="blog">Blog</option>
            <option value="jobs">Jobs</option>
            <option value="promo">Promo</option>
          </select>

          <button
            type="submit"
            disabled={submitting}
            className="text-sm text-[#5f5a54]"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </main>
  );
}
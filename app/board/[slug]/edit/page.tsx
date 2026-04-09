"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";

export default function EditPage() {
  const params = useParams();
  const router = useRouter();

  const slug = params.slug as string;
  const postId = slug.split("-")[0];

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(
          `${API_BASE}/api/board/${slug}/`,
          { cache: "no-store" }
        );

        if (!res.ok) return;

        const data = await res.json();

        setTitle(data.title);
        setBody(data.body);
        setCategory(data.category);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/board/${postId}/edit/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Token ${token}` } : {}),
          },
          body: JSON.stringify({
            title,
            body,
            category,
          }),
        }
      );

      if (!res.ok) {
        alert("failed to update");
        return;
      }

      // 수정 후 detail 페이지로 이동
      router.push(`/board/${slug}`);
    } catch (err) {
      console.error(err);
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
            className="text-sm text-[#5f5a54]"
          >
            Save
          </button>

        </form>
      </div>
    </main>
  );
}
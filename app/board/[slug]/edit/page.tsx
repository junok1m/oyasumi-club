"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import RichTextEditor from "@/components/RichTextEditor";
import { CITIES, isCityRequiredCategory } from "@/lib/cities";

type BoardPost = {
  id: number;
  title: string;
  body: string | null;
  excerpt: string | null;
  category: string;
  author_id: string;
  thumbnail_url: string | null;
  thumbnail_small_url: string | null;
  industry: string | null;
  city: string | null;
  location: string | null;
};

type UploadedBoardImages = {
  thumbnailUrl: string;
  thumbnailSmallUrl: string;
};

type ProfileRole = {
  role: string | null;
};

const MAX_IMAGE_SIZE = 12 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function EditPage() {
  const params = useParams();
  const router = useRouter();

  const slug = params.slug as string;
  const postId = Number(slug.split("-")[0]);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailSmallUrl, setThumbnailSmallUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  function stripHtml(html: string) {
    return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  }

  async function getCurrentUserRole(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single<ProfileRole>();

    if (error || !data) {
      return null;
    }

    return data.role;
  }
  function getIndustries() {
    return [
      { value: "fuzoku", label: "風俗" },
      { value: "karaoke", label: "カラオケ" },
      { value: "massage", label: "マッサージ" },
      { value: "club", label: "クラブ" },
      { value: "restaurant", label: "レストラン" },
      { value: "bar", label: "バー" },
    ];
  }
  function handleThumbnailFileChange(file: File | null) {
    if (thumbnailPreviewUrl) {
      URL.revokeObjectURL(thumbnailPreviewUrl);
    }

    if (!file) {
      setThumbnailFile(null);
      setThumbnailPreviewUrl("");
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setThumbnailFile(null);
      setThumbnailPreviewUrl("");
      alert("JPG / PNG / WEBP 画像を選択してください。");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setThumbnailFile(null);
      setThumbnailPreviewUrl("");
      alert("元画像は12MB以下にしてください。");
      return;
    }

    setThumbnailFile(file);
    setThumbnailPreviewUrl(URL.createObjectURL(file));
  }

  async function compressImage(
    file: File,
    options: {
      maxWidth: number;
      quality: number;
    }
  ): Promise<Blob> {
    const objectUrl = URL.createObjectURL(file);

    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        const scale = Math.min(1, options.maxWidth / image.width);
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("画像の処理に失敗しました。"));
          return;
        }

        ctx.drawImage(image, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);

            if (!blob) {
              reject(new Error("画像の圧縮に失敗しました。"));
              return;
            }

            resolve(blob);
          },
          "image/webp",
          options.quality
        );
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("画像を読み込めませんでした。"));
      };

      image.src = objectUrl;
    });
  }

  async function uploadBoardImages(
    file: File,
    userId: string
  ): Promise<UploadedBoardImages> {
    const stamp = Date.now();
    const randomId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

    const mainBlob = await compressImage(file, {
      maxWidth: 1200,
      quality: 0.82,
    });

    const smallBlob = await compressImage(file, {
      maxWidth: 360,
      quality: 0.76,
    });

    const mainPath = `${userId}/${stamp}-${randomId}-main.webp`;
    const smallPath = `${userId}/${stamp}-${randomId}-small.webp`;

    const { error: mainError } = await supabase.storage
      .from("board-images")
      .upload(mainPath, mainBlob, {
        contentType: "image/webp",
        upsert: false,
      });

    if (mainError) {
      throw new Error(mainError.message || "画像のアップロードに失敗しました。");
    }

    const { error: smallError } = await supabase.storage
      .from("board-images")
      .upload(smallPath, smallBlob, {
        contentType: "image/webp",
        upsert: false,
      });

    if (smallError) {
      await supabase.storage.from("board-images").remove([mainPath]);
      throw new Error(
        smallError.message || "サムネイルのアップロードに失敗しました。"
      );
    }

    const { data: mainPublicUrl } = supabase.storage
      .from("board-images")
      .getPublicUrl(mainPath);

    const { data: smallPublicUrl } = supabase.storage
      .from("board-images")
      .getPublicUrl(smallPath);

    return {
      thumbnailUrl: mainPublicUrl.publicUrl,
      thumbnailSmallUrl: smallPublicUrl.publicUrl,
    };
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchPost() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (userError || !user) {
          alert("login required");
          router.push("/login");
          return;
        }

        const userRole = await getCurrentUserRole(user.id);

        if (cancelled) return;

        if (!userRole) {
          alert("profile not found");
          router.push("/board");
          return;
        }

        const { data, error } = await supabase
          .from("board_posts")
          .select(
            "id, title, body, excerpt, category, industry, city, location, author_id, thumbnail_url, thumbnail_small_url"
          )
          .eq("id", postId)
          .single<BoardPost>();

        if (cancelled) return;

        if (error || !data) {
          console.error(error);
          alert("post not found");
          router.push("/board");
          return;
        }

        if (data.author_id !== user.id && userRole !== "admin") {
          alert("not allowed");
          router.push(`/board/${slug}`);
          return;
        }

        setTitle(data.title ?? "");
        setBody(data.body ?? "");
        setExcerpt(data.excerpt ?? "");
        setCategory(data.category ?? "blog");
        setIndustry(data.industry ?? "");
        setCity(data.city ?? "");
        setLocation(data.location ?? "");
        setThumbnailUrl(data.thumbnail_url ?? "");
        setThumbnailSmallUrl(data.thumbnail_small_url ?? "");
      } catch (e) {
        if (!cancelled) {
          console.error(e);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (!Number.isNaN(postId)) {
      fetchPost();
    } else {
      setLoading(false);
      alert("invalid post");
      router.push("/board");
    }

    return () => {
      cancelled = true;
    };
  }, [postId, router, slug]);

  useEffect(() => {
    return () => {
      if (thumbnailPreviewUrl) {
        URL.revokeObjectURL(thumbnailPreviewUrl);
      }
    };
  }, [thumbnailPreviewUrl]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !stripHtml(body)) {
      alert("title and body required");
      return;
    }

    if (isCityRequiredCategory(category) && !city) {
      alert("求人・Q&A・口コミには都市を選択してください。");
      return;
    }

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

      const userRole = await getCurrentUserRole(user.id);

      if (!userRole) {
        alert("profile not found");
        return;
      }

      let finalThumbnailUrl = thumbnailUrl.trim() || null;
      let finalThumbnailSmallUrl = thumbnailSmallUrl.trim() || null;

      if (thumbnailFile) {
        const uploaded = await uploadBoardImages(thumbnailFile, user.id);
        finalThumbnailUrl = uploaded.thumbnailUrl;
        finalThumbnailSmallUrl = uploaded.thumbnailSmallUrl;
      }

      const resolvedCity = city || null;

      let updateQuery = supabase
        .from("board_posts")
        .update({
          title: title.trim(),
          body: body.trim(),
          excerpt: excerpt.trim() || null,
          category,
          audience: "all",
          industry: industry || null,
          city: resolvedCity,
          location: location.trim() || null,
          thumbnail_url: finalThumbnailUrl,
          thumbnail_small_url: finalThumbnailSmallUrl,
          status: userRole === "admin" ? "approved" : "pending",
        })
        .eq("id", postId);

      if (userRole !== "admin") {
        updateQuery = updateQuery.eq("author_id", user.id);
      }

      const { error } = await updateQuery;

      if (error) {
        console.error(error);
        alert("failed to update");
        return;
      }

      router.push("/profile?posted=edited");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-6 text-sm">Loading...</div>;
  }

  const currentImageUrl = thumbnailPreviewUrl || thumbnailUrl || thumbnailSmallUrl;
  const showCityRequired = isCityRequiredCategory(category);

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#5f5a54]">
      <div className="mx-auto w-[92%] max-w-3xl py-8">
        <div className="mb-6 text-[12px] text-[#8e8a84]">Editing post</div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-[#ddd6cc] bg-white px-3 py-2 text-sm outline-none"
          />

          <div>
            <label className="mb-1 block text-xs text-[#8e8a84]">
              画像を選択してください
            </label>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                handleThumbnailFileChange(e.target.files?.[0] ?? null);
              }}
              className="w-full border border-[#ddd6cc] bg-white px-3 py-2 text-sm outline-none"
            />

            <p className="mt-1 text-xs text-[#aaa39b]">
              画像は自動で圧縮されて保存されます。
            </p>
            <p className="mt-1 text-xs text-[#aaa39b]">
              JPG / PNG / WEBP、元画像は12MB以下
            </p>

            {currentImageUrl && (
              <div className="mt-4">
                <img
                  src={currentImageUrl}
                  alt=""
                  className="w-full max-w-xs bg-[#e8e1d8] object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#8e8a84]">
              Image URL
            </label>

            <input
              value={thumbnailUrl}
              onChange={(e) => {
                setThumbnailUrl(e.target.value);
                setThumbnailSmallUrl("");
              }}
              placeholder="https://..."
              className="w-full border border-[#ddd6cc] bg-white px-3 py-2 text-sm outline-none"
            />

            <p className="mt-1 text-xs text-[#aaa39b]">
              Optional. If you choose an image file above, uploaded image will be used instead.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#8e8a84]">
              Excerpt
            </label>

            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              maxLength={200}
              placeholder="Google検索結果に表示される短い説明文"
              className="w-full border border-[#ddd6cc] bg-white px-3 py-2 text-sm outline-none"
            />

            <p className="mt-1 text-xs text-[#aaa39b]">
              SEO用の説明文です。未入力の場合は本文から自動生成されます。
            </p>
          </div>
          <RichTextEditor
            key={`editor-${postId}`}
            value={body}
            onChange={setBody}
          />
          <div>
            <label className="mb-1 block text-xs text-[#8e8a84]">
              City{showCityRequired ? " *" : ""}
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border border-[#ddd6cc] bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="">指定なし（全国）</option>
              {CITIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.labelJa} / {item.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[#aaa39b]">
              {showCityRequired
                ? "求人・Q&A・口コミは都市の選択が必要です。"
                : "未選択の場合は全国向けとして扱います。"}
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#8e8a84]">
              Location
            </label>

            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="CBD / Chatswood / Marrickville..."
              className="w-full border border-[#ddd6cc] bg-white px-3 py-2 text-sm outline-none"
            />

            <p className="mt-1 text-xs text-[#aaa39b]">
              任意です。都市の中のエリアを書けます。
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#8e8a84]">
              Industry
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full border border-[#ddd6cc] bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="">なし</option>
              {getIndustries().map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#8e8a84]">
              Category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-[#ddd6cc] bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="news">News</option>
              <option value="blog">Blog</option>
              <option value="jobs">Jobs</option>
              <option value="promo">Promo</option>
              <option value="qa">Q&A</option>
              <option value="review">Review</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="text-sm underline disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </main>
  );
}

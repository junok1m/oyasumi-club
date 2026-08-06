"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getMyProfile } from "@/lib/auth";
import RichTextEditor from "@/components/RichTextEditor";

type MessageType = "error" | "success";

const MAX_IMAGE_SIZE = 12 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type UploadedGuideImages = {
  thumbnailUrl: string;
  thumbnailSmallUrl: string;
  paths: string[];
};

const industries = [
  { value: "fuzoku", label: "風俗" },
  { value: "karaoke", label: "カラオケ" },
  { value: "massage", label: "マッサージ" },
  { value: "club", label: "クラブ" },
  { value: "restaurant", label: "レストラン" },
  { value: "bar", label: "バー" },
];

export default function GuideWritePage() {
  const router = useRouter();

  const [role, setRole] = useState<string | null>(null);
const [industry, setIndustry] = useState<string | null>(null);  
const [location, setLocation] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [sponsorName, setSponsorName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState<{
    type: MessageType;
    text: string;
  } | null>(null);

  function stripHtml(html: string) {
    return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  }

  function handleThumbnailFileChange(file: File | null) {
    setMessage(null);

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
      setMessage({
        type: "error",
        text: "JPG / PNG / WEBP 画像を選択してください。",
      });
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setThumbnailFile(null);
      setThumbnailPreviewUrl("");
      setMessage({
        type: "error",
        text: "元画像は12MB以下にしてください。",
      });
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

  async function uploadGuideImages(
    file: File,
    userId: string
  ): Promise<UploadedGuideImages> {
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

    const mainPath = `${userId}/guide-${stamp}-${randomId}-main.webp`;
    const smallPath = `${userId}/guide-${stamp}-${randomId}-small.webp`;

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
      throw new Error(smallError.message || "サムネイルのアップロードに失敗しました。");
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
      paths: [mainPath, smallPath],
    };
  }

  useEffect(() => {
    async function fetchMe() {
      const profile = await getMyProfile();

      if (!profile) {
        setMessage({
          type: "error",
          text: "ログイン後にご利用ください。",
        });
        router.push("/login");
        return;
      }

      setRole(profile.role);

      if (profile.role !== "admin") {
        setMessage({
          type: "error",
          text: "ガイド記事は管理者のみ作成できます。",
        });
        router.push("/guide");
      }
    }

    fetchMe();
  }, [router]);

  useEffect(() => {
    return () => {
      if (thumbnailPreviewUrl) {
        URL.revokeObjectURL(thumbnailPreviewUrl);
      }
    };
  }, [thumbnailPreviewUrl]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!title.trim() || !excerpt.trim() || !stripHtml(body)) {
      setMessage({
        type: "error",
        text: "タイトル・紹介文・本文を入力してください。",
      });
      return;
    }

    if (!thumbnailFile && !thumbnailUrl.trim()) {
      setMessage({
        type: "error",
        text: "ガイド記事にはサムネイル画像を設定してください。",
      });
      return;
    }

    setLoading(true);

    let uploadedPaths: string[] = [];

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage({
          type: "error",
          text: "ログイン後にご利用ください。",
        });
        router.push("/login");
        return;
      }

      let finalThumbnailUrl = thumbnailUrl.trim() || null;
      let finalThumbnailSmallUrl: string | null = null;

      if (thumbnailFile) {
        const uploaded = await uploadGuideImages(thumbnailFile, user.id);
        uploadedPaths = uploaded.paths;
        finalThumbnailUrl = uploaded.thumbnailUrl;
        finalThumbnailSmallUrl = uploaded.thumbnailSmallUrl;
      }

      const { data, error } = await supabase
        .from("guide_posts")
        .insert({
          title: title.trim(),
          excerpt: excerpt.trim(),
          body: body.trim(),
          industry,
          location: location.trim() || null,
          sponsor_name: sponsorName.trim() || null,
          website_url: websiteUrl.trim() || null,
          thumbnail_url: finalThumbnailUrl,
          thumbnail_small_url: finalThumbnailSmallUrl,
          status: "approved",
          views_boost: Math.floor(Math.random() * 20),
        })
        .select("id, slug")
        .single();

      if (error) {
        if (uploadedPaths.length > 0) {
          await supabase.storage.from("board-images").remove(uploadedPaths);
        }

        setMessage({
          type: "error",
          text: error.message || "ガイド記事の作成に失敗しました。",
        });
        return;
      }

      setMessage({
        type: "success",
        text: "ガイド記事を作成しました。",
      });

      const prettySlug = data.slug ? `${data.id}-${data.slug}` : `${data.id}`;
      router.push(`/guide/${prettySlug}`);
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "エラーが発生しました。",
      });
    } finally {
      setLoading(false);
    }
  }

  if (role === null) {
    return (
      <main className="mx-auto w-[80%] px-6 py-8">
        <p className="text-sm text-gray-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-[80%] px-6 py-8">
      <h1 className="mb-2 text-2xl font-semibold">Guide Write</h1>

      <p className="mb-8 text-sm text-gray-500">
        スポンサー紹介・おすすめ店・エリア案内など、ガイド記事を作成します。
      </p>

      {message && (
        <div
          className={`mb-6 rounded-md px-4 py-3 text-sm ${
            message.type === "error"
              ? "border border-orange-200 bg-orange-50 text-orange-700"
              : "border border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-1 block text-xs text-gray-500">Industry</label>
          <select
  value={industry ?? ""}
  onChange={(e) => {
    setIndustry(e.target.value || null);
    setMessage(null);
  }}
  className="w-full border-b py-2 text-sm outline-none"
><option value="">業種を選択</option>
            {industries.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-500">Location</label>
          <input
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setMessage(null);
            }}
            placeholder="Sydney CBD / Chatswood / Haymarket..."
            className="w-full border-b py-2 text-sm outline-none"
          />
          <p className="mt-1 text-xs text-gray-400">
            任意です。未入力の場合は表示されません。
          </p>
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-500">Title</label>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setMessage(null);
            }}
            placeholder="ガイド記事のタイトル"
            className="w-full border-b py-2 text-lg outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-500">Excerpt</label>
          <textarea
            value={excerpt}
            onChange={(e) => {
              setExcerpt(e.target.value);
              setMessage(null);
            }}
            placeholder="一覧ページに表示する短い紹介文"
            rows={3}
            className="w-full resize-none border-b py-2 text-sm leading-6 outline-none"
          />
          <p className="mt-1 text-xs text-gray-400">
            1〜2行くらいの短い説明がおすすめです。
          </p>
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-500">
            Sponsor / Shop Name
          </label>
          <input
            value={sponsorName}
            onChange={(e) => {
              setSponsorName(e.target.value);
              setMessage(null);
            }}
            placeholder="紹介するお店・スポンサー名"
            className="w-full border-b py-2 text-sm outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-500">
            Website / Booking URL
          </label>
          <input
            value={websiteUrl}
            onChange={(e) => {
              setWebsiteUrl(e.target.value);
              setMessage(null);
            }}
            placeholder="https://..."
            className="w-full border-b py-2 text-sm outline-none"
          />
          <p className="mt-1 text-xs text-gray-400">
            公式サイト・LINE・予約ページなど。任意です。
          </p>
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-500">
            画像を選択してください
          </label>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              handleThumbnailFileChange(e.target.files?.[0] ?? null);
            }}
            className="w-full border-b py-2 text-sm outline-none"
          />

          <p className="mt-1 text-xs text-gray-400">
            画像は自動で圧縮されて保存されます。
          </p>
          <p className="mt-1 text-xs text-gray-400">
            JPG / PNG / WEBP、元画像は12MB以下
          </p>

          {thumbnailPreviewUrl && (
            <div className="mt-4">
              <img
                src={thumbnailPreviewUrl}
                alt=""
                className="aspect-[3/2] w-full max-w-xs bg-[#e8e1d8] object-cover"
              />
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-500">Image URL</label>
          <input
            value={thumbnailUrl}
            onChange={(e) => {
              setThumbnailUrl(e.target.value);
              setMessage(null);
            }}
            placeholder="https://..."
            className="w-full border-b py-2 text-sm outline-none"
          />
          <p className="mt-1 text-xs text-gray-400">
            画像をアップロードした場合は、そちらが優先して使用されます。
          </p>
        </div>

        <div>
          <label className="mb-2 block text-xs text-gray-500">Body</label>
          <RichTextEditor value={body} onChange={setBody} />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="text-sm underline disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post Guide"}
          </button>
        </div>
      </form>
    </main>
  );
}
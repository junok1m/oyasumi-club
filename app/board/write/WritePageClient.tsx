"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getMyProfile } from "@/lib/auth";
import RichTextEditor from "@/components/RichTextEditor";
import { AU_CITIES, CITIES, NZ_CITIES, isCityRequiredCategory } from "@/lib/cities";

type MessageType = "error" | "success";

const MAX_IMAGE_SIZE = 12 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type UploadedBoardImages = {
  thumbnailUrl: string;
  thumbnailSmallUrl: string;
  paths: string[];
};

export default function WritePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<string | null>(null);
  const [category, setCategory] = useState("news");
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [title, setTitle] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState("");

  const [message, setMessage] = useState<{
    type: MessageType;
    text: string;
  } | null>(null);

  const [jobPostCount, setJobPostCount] = useState<number | null>(null);

  function stripHtml(html: string) {
    return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  }

  function getAllowedCategories(role: string | null) {
    switch (role) {
      case "admin":
        return ["news", "blog", "jobs", "promo", "qa", "review"];
      case "shop":
        return ["blog", "jobs", "promo"];
      case "girl":
        return ["blog", "qa", "review"];
      default:
        return [];
    }
  }
  function categoryLabel(cat: string) {
    switch (cat) {
      case "news":
        return "ニュース";
      case "blog":
        return "ブログ";
      case "jobs":
        return "求人";
      case "promo":
        return "プロモーション";
      case "qa":
        return "Q&A";
      case "review":
        return "口コミ";
      default:
        return cat;
    }
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

  async function fetchJobPostCount(userId: string) {
    const nowIso = new Date().toISOString();

    const { count, error } = await supabase
      .from("board_posts")
      .select("*", { count: "exact", head: true })
      .eq("author_id", userId)
      .eq("category", "jobs")
      .in("status", ["pending", "approved"])
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`);

    if (error) {
      setJobPostCount(null);
      return;
    }

    setJobPostCount(count ?? 0);
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

      if (profile.role === "client") {
        setMessage({
          type: "error",
          text: "クライアントは投稿できません。",
        });
        router.push("/board");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && profile.role === "shop") {
        fetchJobPostCount(user.id);
      }
    }

    fetchMe();
  }, [router]);

  useEffect(() => {
    const categoryParam = searchParams.get("category");

    if (
      categoryParam &&
      ["news", "blog", "jobs", "promo", "qa", "review"].includes(categoryParam)
    ) {
      setCategory(categoryParam);
    }

    const cityParam = searchParams.get("city");
    if (cityParam && CITIES.some((c) => c.value === cityParam)) {
      setCity(cityParam);
    }
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (thumbnailPreviewUrl) {
        URL.revokeObjectURL(thumbnailPreviewUrl);
      }
    };
  }, [thumbnailPreviewUrl]);

  useEffect(() => {
    const allowed = getAllowedCategories(role);

    if (allowed.length > 0 && !allowed.includes(category)) {
      setCategory(allowed[0]);
    }
  }, [role, category]);

  useEffect(() => {
    async function refreshJobCountIfNeeded() {
      if (role !== "shop" && role !== "admin") return;
      if (category !== "jobs") return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      fetchJobPostCount(user.id);
    }

    refreshJobCountIfNeeded();
  }, [category, role]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!title.trim() || !stripHtml(body)) {
      setMessage({
        type: "error",
        text: "タイトルと本文を入力してください。",
      });
      return;
    }

    if ((category === "jobs" || category === "promo") && !industry) {
      setMessage({
        type: "error",
        text: "求人・プロモーションには業種を選択してください。",
      });
      return;
    }

    if (isCityRequiredCategory(category) && !city) {
      setMessage({
        type: "error",
        text: "求人・口コミには都市を選択してください。",
      });
      return;
    }

    const allowed = getAllowedCategories(role);

    if (!allowed.includes(category)) {
      setMessage({
        type: "error",
        text: "このカテゴリには投稿できません。",
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

      if (category === "jobs") {
        const nowIso = new Date().toISOString();

        const { count, error: countError } = await supabase
          .from("board_posts")
          .select("*", { count: "exact", head: true })
          .eq("author_id", user.id)
          .eq("category", "jobs")
          .in("status", ["pending", "approved"])
          .or(`expires_at.is.null,expires_at.gt.${nowIso}`);

        if (countError) {
          setMessage({
            type: "error",
            text: "求人投稿数の確認に失敗しました。",
          });
          setLoading(false);
          return;
        }

        const currentCount = count ?? 0;
        setJobPostCount(currentCount);

        if (currentCount >= 2) {
          setMessage({
            type: "error",
            text: "求人投稿は最大2件までです。公開中または審査中の投稿をご確認ください。",
          });
          setLoading(false);
          return;
        }
      }

      let finalThumbnailUrl = thumbnailUrl.trim() || null;
      let finalThumbnailSmallUrl: string | null = null;

      if (thumbnailFile) {
        const uploaded = await uploadBoardImages(thumbnailFile, user.id);
        uploadedPaths = uploaded.paths;
        finalThumbnailUrl = uploaded.thumbnailUrl;
        finalThumbnailSmallUrl = uploaded.thumbnailSmallUrl;
      }

      const resolvedCity = city || null;

      const { data, error } = await supabase
        .from("board_posts")
        .insert({
          author_id: user.id,
          like_boost: Math.floor(Math.random() * 8),
          category,
          audience: "all",
          industry: industry || null,
          city: resolvedCity,
          location: location.trim() || null,
          title: title.trim(),
          body: body.trim(),
          thumbnail_url: finalThumbnailUrl,
          thumbnail_small_url: finalThumbnailSmallUrl,
          status: role === "admin" ? "approved" : "pending",
        })
        .select("id, slug")
        .single();

      if (error) {
        if (uploadedPaths.length > 0) {
          await supabase.storage.from("board-images").remove(uploadedPaths);
        }

        setMessage({
          type: "error",
          text: error.message || "投稿の作成に失敗しました。",
        });
        return;
      }

      if (category === "jobs") {
        setJobPostCount((prev) => (prev ?? 0) + 1);
      }

      setMessage({
        type: "success",
        text: "投稿を作成しました。",
      });

      if (role === "admin") {
        const prettySlug = data.slug ? `${data.id}-${data.slug}` : `${data.id}`;
        router.push(`/board/${prettySlug}`);
        return;
      }

      router.push("/profile?posted=pending");
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "エラーが発生しました。",
      });
    } finally {
      setLoading(false);
    }
  }

  if (role === null) {
    return (
      <main className="w-[80%] mx-auto px-6 py-8">
        <p className="text-sm text-gray-500">Loading...</p>
      </main>
    );
  }

  const allowedCategories = getAllowedCategories(role);
  const showCityRequired = isCityRequiredCategory(category);

  return (
    <main className="w-[80%] mx-auto px-6 py-8">
      <h1 className="mb-8 text-2xl font-semibold">Write</h1>

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
          <label className="mb-1 block text-xs text-gray-500">Category</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setMessage(null);
            }}
            className="w-full border-b py-2 text-sm outline-none"
          >
            {allowedCategories.map((cat) => (
              <option key={cat} value={cat}>
                {categoryLabel(cat)}
              </option>
            ))}
          </select>

          {category === "jobs" && (
            <p className="mt-2 text-xs text-gray-500">
              求人投稿の使用状況: {jobPostCount ?? "-"} / 2
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-500">Industry</label>
          <select
            value={industry}
            onChange={(e) => {
              setIndustry(e.target.value);
              setMessage(null);
            }}
            className="w-full border-b py-2 text-sm outline-none"
          >
            <option value="">業種を選択</option>
            {getIndustries().map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-500">
            City{showCityRequired ? " *" : ""}
          </label>
          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setMessage(null);
            }}
            className="w-full border-b py-2 text-sm outline-none"
          >
            <option value="">指定なし（全国）</option>
            <optgroup label="Australia">
              {AU_CITIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.labelJa} / {item.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="New Zealand">
              {NZ_CITIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.labelJa} / {item.label}
                </option>
              ))}
            </optgroup>
          </select>
          <p className="mt-1 text-xs text-gray-400">
            {showCityRequired
              ? "求人・口コミは都市の選択が必要です。"
              : "任意です。未選択の場合は全国向けとして扱います。"}
          </p>
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
            任意です。都市の中のエリアを書けます。未入力の場合は表示されません。
          </p>
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-500">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Write a title"
            className="w-full border-b py-2 text-lg outline-none"
          />
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
                className="w-full max-w-xs bg-[#e8e1d8] object-cover"
              />
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-500">Image URL</label>
          <input
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
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
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </main>
  );
}

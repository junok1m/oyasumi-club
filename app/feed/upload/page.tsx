"use client";

import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import { supabase } from "@/lib/supabase";

type Me = {
  id: string;
  role: string | null;
  display_name: string | null;
};

export default function FeedUploadPage() {
  const router = useRouter();

  const [me, setMe] = useState<Me | null>(null);
  const [checking, setChecking] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function checkMe() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setMe(null);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("id, role, display_name")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error(error);
          setMe(null);
          return;
        }

        setMe(data);
      } catch (error) {
        console.error(error);
        setMe(null);
      } finally {
        setChecking(false);
      }
    }

    checkMe();
  }, []);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setErrorMessage("");
    setSuccessMessage("");

    const selected = event.target.files?.[0];

    if (!selected) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(selected.type)) {
      setErrorMessage("JPG, PNG, WEBP 이미지만 업로드할 수 있어요.");
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    if (selected.size > 12 * 1024 * 1024) {
      setErrorMessage("원본 이미지는 12MB 이하만 선택할 수 있어요.");
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!me) {
      setErrorMessage("로그인이 필요합니다.");
      return;
    }

    if (me.role !== "girl") {
      setErrorMessage("피드 업로드는 girl 계정만 가능합니다.");
      return;
    }

    if (!file) {
      setErrorMessage("이미지를 선택해주세요.");
      return;
    }

    if (caption.length > 30) {
      setErrorMessage("캡션은 30자 이하로 입력해주세요.");
      return;
    }

    try {
      setUploading(true);

      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: "image/webp",
      });

      const fileName = `${crypto.randomUUID()}.webp`;
      const filePath = `${me.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("feed-images")
        .upload(filePath, compressedFile, {
          contentType: "image/webp",
          upsert: false,
        });

      if (uploadError) {
        console.error(uploadError);
        setErrorMessage("이미지 업로드에 실패했어요.");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("feed-images")
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { error: insertError } = await supabase.from("feed_posts").insert({
        author_id: me.id,
        image_url: imageUrl,
        caption: caption.trim() || null,
        expires_at: expiresAt.toISOString(),
      });

      if (insertError) {
        console.error(insertError);
        setErrorMessage("피드 저장에 실패했어요.");
        return;
      }

      setSuccessMessage("업로드 완료!");
      setCaption("");
      setFile(null);
      setPreviewUrl(null);

      router.push("/feed");
    } catch (error) {
      console.error(error);
      setErrorMessage("업로드 중 문제가 생겼어요.");
    } finally {
      setUploading(false);
    }
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-[#f7f4ee] text-[#5f5a54]">
        <div className="mx-auto w-[92%] max-w-xl py-12 text-sm text-[#948d85]">
          Loading...
        </div>
      </main>
    );
  }

  if (!me) {
    return (
      <main className="min-h-screen bg-[#f7f4ee] text-[#5f5a54]">
        <div className="mx-auto w-[92%] max-w-xl py-16 text-center">
          <p className="text-[14px] text-[#6f6a64]">로그인이 필요합니다.</p>
          <Link href="/login" className="mt-4 inline-block text-[13px] text-[#24a64d]">
            login
          </Link>
        </div>
      </main>
    );
  }

  if (me.role !== "girl") {
    return (
      <main className="min-h-screen bg-[#f7f4ee] text-[#5f5a54]">
        <div className="mx-auto w-[92%] max-w-xl py-16 text-center">
          <p className="text-[14px] text-[#6f6a64]">
            피드 업로드는 girl 계정만 가능합니다.
          </p>
          <Link href="/feed" className="mt-4 inline-block text-[13px] text-[#24a64d]">
            back to feed
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#5f5a54]">
      <div className="mx-auto w-[92%] max-w-xl py-8 pb-28">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-medium text-[#4f4a45]">
              Upload Feed ✨
            </h1>
            <p className="mt-1 text-[12px] text-[#9a948d]">
              画像は自動で圧縮されて保存されます。
            </p>
          </div>

          <Link href="/feed" className="text-[13px] text-[#24a64d]">
            back
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-[13px] text-[#6f6a64]">Image</span>

            <div className="flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-3xl border border-dashed border-[#d7cec3] bg-[#fffaf2]">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="px-6 text-center">
                  <p className="text-[13px] text-[#7c746c]">
                    画像を選択してください。
                  </p>
                  <p className="mt-2 text-[11px] text-[#aaa199]">
                    JPG / PNG / WEBP、元画像は12MB以下
                  </p>
                </div>
              )}
            </div>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="mt-3 block w-full text-[12px] text-[#7c746c] file:mr-3 file:rounded-full file:border-0 file:bg-[#efe8df] file:px-4 file:py-2 file:text-[12px] file:text-[#5f5a54]"
            />
          </label>

          <label className="block">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] text-[#6f6a64]">Caption</span>
              <span className="text-[11px] text-[#aaa199]">
                {caption.length}/30
              </span>
            </div>

            <input
              value={caption}
              onChange={(event) => setCaption(event.target.value.slice(0, 30))}
              placeholder="一言コメントを書いてください。"
              className="w-full rounded-2xl border border-[#ddd4ca] bg-[#fffaf2] px-4 py-3 text-[14px] outline-none placeholder:text-[#b3aaa1] focus:border-[#b8aa9c]"
            />
          </label>

          {errorMessage && (
            <p className="rounded-2xl bg-[#fff2e8] px-4 py-3 text-[12px] text-[#c46a2b]">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="rounded-2xl bg-[#edfbea] px-4 py-3 text-[12px] text-[#24a64d]">
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="w-full rounded-full bg-[#5f5a54] px-5 py-3 text-[13px] text-white transition hover:bg-[#47423d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getMyProfile } from "@/lib/auth";

type Me = {
  id: string;
  username?: string | null;
  display_name?: string | null;
  role: string | null;
};

export default function FeedUploadPage() {
  const router = useRouter();

  const [me, setMe] = useState<Me | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      try {
        const profile = await getMyProfile();

        if (!profile) {
          router.replace("/login");
          return;
        }

        setMe(profile);

        if (profile.role !== "girl") {
          router.replace("/feed");
          return;
        }
      } catch (err) {
        console.error("me check failed:", err);
        router.replace("/feed");
        return;
      } finally {
        setAuthChecked(true);
      }
    }

    checkAccess();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!file) {
      alert("Please select image.");
      return;
    }

    if (caption.length > 30) {
      alert("Caption must be 30 characters or less.");
      return;
    }

    try {
      setSubmitting(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      if (me?.role !== "girl") {
        alert("Only girl users can upload.");
        router.replace("/feed");
        return;
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `feed/${user.id}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("oyasumi")
        .upload(filePath, file, {
          upsert: false,
        });

      if (uploadError) {
        alert(uploadError.message || "Image upload failed.");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("oyasumi")
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      const { error: insertError } = await supabase
        .from("feed_posts")
        .insert({
          author_id: user.id,
          image_url: imageUrl,
          caption: caption.trim() || null,
        });

      if (insertError) {
        alert(insertError.message || "Feed insert failed.");
        return;
      }

      router.push("/feed");
      router.refresh();
    } catch (err) {
      console.error("upload catch error:", err);
      alert("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-[#f7f4ee] text-[#5f5a54]">
        <div className="mx-auto w-[92%] max-w-md py-10">
          <p className="text-sm text-[#948d85]">Checking access...</p>
        </div>
      </main>
    );
  }

  if (me?.role !== "girl") {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#5f5a54]">
      <div className="mx-auto w-[92%] max-w-md py-10 space-y-6">
        <h1 className="text-[18px] font-medium">Upload</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <textarea
            placeholder="caption... max 30 characters"
            value={caption}
            maxLength={30}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full border border-[#ddd6cc] px-3 py-2 text-sm"
          />
          <p className="text-xs text-[#948d85]">{caption.length}/30</p>

          <button
            type="submit"
            disabled={submitting}
            className="text-sm text-[#5f5a54] disabled:opacity-50"
          >
            {submitting ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>
    </main>
  );
}
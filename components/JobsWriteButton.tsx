"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { getMyProfile } from "@/lib/auth";

const WRITE_JOBS_PATH = "/board/write?category=jobs";

export default function JobsWriteButton({
  className = "",
  label = "求人を出す",
}: {
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(
          `/login?next=${encodeURIComponent(WRITE_JOBS_PATH)}`
        );
        return;
      }

      const profile = await getMyProfile();
      const role = profile?.role;

      if (role === "shop" || role === "admin") {
        router.push(WRITE_JOBS_PATH);
        return;
      }

      alert("求人の投稿は店舗アカウント（Shop）のみ可能です。");
    } catch (error) {
      console.error(error);
      router.push(`/login?next=${encodeURIComponent(WRITE_JOBS_PATH)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={
        className ||
        "shrink-0 rounded-full bg-[#4f3a4f] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm disabled:opacity-60"
      }
    >
      {loading ? "..." : label}
    </button>
  );
}

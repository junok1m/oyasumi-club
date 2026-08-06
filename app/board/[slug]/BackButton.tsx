"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="text-[12px] text-[#8e8a84]"
    >
      ← 戻る
    </button>
  );
}
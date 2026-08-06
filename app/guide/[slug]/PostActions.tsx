"use client";

import { useState } from "react";

type PostActionsProps = {
  url: string;
  title: string;
};

export default function PostActions({ url, title }: PostActionsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }

  function handleShareX() {
    const shareUrl = encodeURIComponent(url);
    const shareText = encodeURIComponent(title);
    const xUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;

    window.open(xUrl, "_blank", "noopener,noreferrer");
  }

  function handleShareThreads() {
    const text = encodeURIComponent(`${title}\n${url}`);
    const threadsUrl = `https://www.threads.net/intent/post?text=${text}`;

    window.open(threadsUrl, "_blank", "noopener,noreferrer");
  }

  return (
  <div className="mt-10 space-y-2 text-[11px] text-slate-500">
    <div className="flex items-center">
      <div className="flex-1 border-t border-dashed border-slate-700" />

      <div className="ml-3 flex shrink-0 items-center gap-2 whitespace-nowrap">
        <button
          type="button"
          onClick={handleCopy}
          className={`transition ${
            copied ? "text-cyan-300" : "text-slate-400 hover:text-cyan-300"
          }`}
        >
          {copied ? "コピーしました ✓" : "リンクコピー"}
        </button>
      </div>
    </div>

    <div className="flex items-center">
      <div className="flex-1 border-t border-dashed border-slate-700" />

      <div className="ml-3 flex shrink-0 items-center gap-2 whitespace-nowrap">
        <button
          type="button"
          onClick={handleShareThreads}
          className="text-slate-400 hover:text-cyan-300 transition"
        >
          <span className="border-b border-dotted border-cyan-400/40 font-bold text-cyan-300">
            Threads
          </span>
          で共有
        </button>

        <span className="text-slate-600">·</span>

        <button
          type="button"
          onClick={handleShareX}
          className="text-slate-400 hover:text-cyan-300 transition"
        >
          <span className="border-b border-dotted border-cyan-400/40 font-bold text-cyan-300">
            X
          </span>
          で共有
        </button>
      </div>
    </div>
  </div>
);
}
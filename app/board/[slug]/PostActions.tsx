"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PostActions({
  url,
  title,
  postId,
  likeBoost = 0,
}: {
  url: string;
  title: string;
  postId: number;
  likeBoost?: number;
}) {
  const [copied, setCopied] = useState(false);

  const [saved, setSaved] = useState(false);
  const [checkingSaved, setCheckingSaved] = useState(true);
  const [saving, setSaving] = useState(false);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [checkingLike, setCheckingLike] = useState(true);
  const [liking, setLiking] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function checkActions() {
      try {
        setCheckingSaved(true);
        setCheckingLike(true);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (cancelled) return;

        const user = session?.user;

        if (!user) {
          setUserId(null);
          setSaved(false);
          setLiked(false);
        } else {
          setUserId(user.id);
        }

        const { count, error: countError } = await supabase
          .from("board_likes")
          .select("id", { count: "exact", head: true })
          .eq("post_id", postId);

        if (cancelled) return;

        if (countError) {
          console.error("like count failed:", countError);
          setLikeCount(0);
        } else {
          setLikeCount((count ?? 0) + likeBoost);
        }

        if (!user) return;

        const [savedResult, likedResult] = await Promise.all([
          supabase
            .from("saved_posts")
            .select("id")
            .eq("user_id", user.id)
            .eq("post_id", postId)
            .maybeSingle(),

          supabase
            .from("board_likes")
            .select("id")
            .eq("user_id", user.id)
            .eq("post_id", postId)
            .maybeSingle(),
        ]);

        if (cancelled) return;

        if (savedResult.error) {
          console.error("checkSaved failed:", savedResult.error);
          setSaved(false);
        } else {
          setSaved(!!savedResult.data);
        }

        if (likedResult.error) {
          console.error("checkLiked failed:", likedResult.error);
          setLiked(false);
        } else {
          setLiked(!!likedResult.data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("checkActions error:", error);
          setUserId(null);
          setSaved(false);
          setLiked(false);
          setLikeCount(0);
        }
      } finally {
        if (!cancelled) {
          setCheckingSaved(false);
          setCheckingLike(false);
        }
      }
    }

    checkActions();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  function showMessage(text: string) {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 1600);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  }

  function handleShareX() {
    const shareUrl = encodeURIComponent(url);
    const shareText = encodeURIComponent(title);
    const xUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;

    window.open(xUrl, "_blank");
  }

  function handleShareThreads() {
    const text = encodeURIComponent(`${title}\n${url}`);
    const threadsUrl = `https://www.threads.com/intent/post?text=${text}`;

    window.open(threadsUrl, "_blank");
  }

  async function handleLike() {
    if (!userId) {
      showMessage("いいねするにはログインが必要です。");
      return;
    }

    if (liking) return;
    setLiking(true);

    try {
      if (liked) {
        const { error } = await supabase
          .from("board_likes")
          .delete()
          .eq("user_id", userId)
          .eq("post_id", postId);

        if (error) {
          console.error("unlike failed:", error);
          showMessage("いいねを外せませんでした。");
          return;
        }

        setLiked(false);
        setLikeCount((current) => Math.max(0, current - 1));
      } else {
        const { error } = await supabase.from("board_likes").insert({
          user_id: userId,
          post_id: postId,
        });

        if (error) {
          console.error("like failed:", error);
          showMessage("いいねできませんでした。");
          return;
        }

        setLiked(true);
        setLikeCount((current) => current + 1);
      }
    } finally {
      setLiking(false);
    }
  }

  async function handleSave() {
    if (!userId) {
      showMessage("保存するにはログインが必要です。");
      return;
    }

    if (saving) return;
    setSaving(true);

    try {
      if (saved) {
        const { error } = await supabase
          .from("saved_posts")
          .delete()
          .eq("user_id", userId)
          .eq("post_id", postId);

        if (error) {
          console.error("unsave failed:", error);
          showMessage("保存を外せませんでした。");
          return;
        }

        setSaved(false);
      } else {
        const { error } = await supabase.from("saved_posts").insert({
          user_id: userId,
          post_id: postId,
        });

        if (error) {
          console.error("save failed:", error);
          showMessage("保存できませんでした。");
          return;
        }

        setSaved(true);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-10 space-y-2 text-[11px] text-[#9a948d]">
      {/* 1st line: like / save / copy */}
      <div className="flex items-center">
        <div className="flex-1 border-t border-dashed border-[#d7cec3]" />

        <div className="ml-3 flex shrink-0 items-center gap-2 whitespace-nowrap">
          <button
            type="button"
            onClick={handleLike}
            disabled={checkingLike || liking}
            className={`transition ${liked ? "text-[#a15470]" : "text-[#9a948d]"
              } disabled:opacity-50`}
          >
            {checkingLike ? (
              "..."
            ) : (
              <>
                <span className="text-[13px]">{liked ? "♥" : "♡"}</span>
                <span className="ml-1">
                  {liked ? "いいね済み" : "いいね"}
                </span>
                <span className="ml-1 text-[#c0b7ad]">{likeCount}</span>
              </>
            )}
          </button>

          <span className="text-[#d6cec4]">·</span>

          <button
            type="button"
            onClick={handleSave}
            disabled={checkingSaved || saving}
            className={`transition ${saved ? "text-[#a15470]" : "text-[#9a948d]"
              } disabled:opacity-50`}
          >
            {checkingSaved ? "..." : saved ? "保存済み ♡" : "保存する"}
          </button>

          <span className="text-[#d6cec4]">·</span>

          <button
            type="button"
            onClick={handleCopy}
            className={`transition ${copied ? "text-[#6f8660]" : "text-[#9a948d]"
              }`}
          >
            {copied ? "コピーしました ♡" : "リンクコピー"}
          </button>
        </div>
      </div>

      {/* 2nd line: external share */}
      <div className="flex items-center">
        <div className="flex-1 border-t border-dashed border-[#eadfd4]" />

        <div className="ml-3 flex shrink-0 items-center gap-2 whitespace-nowrap">
          <button
            type="button"
            onClick={handleShareThreads}
            className="text-[#9a948d]"
          >
            <span className="border-b border-dotted border-[#b8ada1] font-bold text-[#5f5a54]">
              Threads
            </span>
            で共有
          </button>

          <span className="text-[#d6cec4]">·</span>

          <button
            type="button"
            onClick={handleShareX}
            className="text-[#9a948d]"
          >
            <span className="border-b border-dotted border-[#b8ada1] font-bold text-[#5f5a54]">
              X
            </span>
            で共有
          </button>
        </div>
      </div>

      {message && (
        <p className="text-right text-[11px] text-[#a15470]">{message}</p>
      )}
    </div>
  );
}
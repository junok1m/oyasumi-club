"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import CommentActionButton from "@/components/comments/CommentActionButton";

type TargetType = "board" | "guide";

type Comment = {
  id: number;
  post_id: number | null;
  guide_post_id: number | null;
  author_id: string | null;
  parent_id: number | null;
  body: string;
  is_anon: boolean;
  user_mask: string | null;
  status: string;
  created_at: string;
  edited_at: string | null;
};

function makeAnonMask() {
  const animals = [
    "猫", "犬", "狐", "兎", "コアラ", "ペンギン",
    "タヌキ", "キツネザル", "カンガルー", "ウォンバット",
    "クオッカ", "ハリネズミ", "リス", "モモンガ",
    "アライグマ", "カワウソ", "ラッコ", "ビーバー",
    "フクロウ", "カラス", "ハト", "スズメ",
    "パンダ", "シロクマ", "クマ", "オオカミ",
    "ヤギ", "アルパカ", "ラマ", "ヒツジ",
    "カピバラ", "ナマケモノ",
  ];

  const n = Math.floor(Math.random() * 900) + 100;
  return `匿名${animals[Math.floor(Math.random() * animals.length)]}${n}`;
}

function formatCommentTime(dateString: string) {
  return new Date(dateString).toLocaleString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommentThread({
  targetType,
  targetId,
  sectionClassName = "mt-10 border-t border-[#e4ddd4] pt-6",
}: {
  targetType: TargetType;
  targetId: number;
  sectionClassName?: string;
}) {
  const targetColumn =
    targetType === "guide" ? "guide_post_id" : "post_id";

  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [replyBody, setReplyBody] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingBody, setEditingBody] = useState("");

  // Board Q&A/review: anonymous OK. Guide: still requires login (RLS).
  const allowAnonymous = targetType === "board";

  const parentComments = comments.filter((comment) => comment.parent_id === null);

  function getReplies(parentId: number) {
    return comments.filter((comment) => comment.parent_id === parentId);
  }

  async function loadComments() {
    setLoading(true);

    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq(targetColumn, targetId)
      .in("status", ["visible", "deleted"])
      .order("created_at", { ascending: true });

    if (error) {
      console.error("loadComments error:", error);
      setComments([]);
    } else {
      setComments(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentUserId(user?.id ?? null);
      await loadComments();
    }

    init();
  }, [targetId, targetColumn]);

  async function submitComment() {
    const text = body.trim();

    if (!text) {
      setMessage("コメントを入力してください。");
      return;
    }

    setPosting(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && !allowAnonymous) {
      setMessage("ログインが必要です。");
      setPosting(false);
      return;
    }

    const { error } = await supabase.from("comments").insert({
      [targetColumn]: targetId,
      author_id: user?.id ?? null,
      parent_id: null,
      body: text,
      is_anon: true,
      user_mask: makeAnonMask(),
      status: "visible",
    });

    if (error) {
      console.error("submitComment error:", error);
      setMessage(error.message || "コメントを投稿できませんでした。");
      setPosting(false);
      return;
    }

    setBody("");
    setMessage("コメントを投稿しました。");
    await loadComments();
    setPosting(false);
  }

  async function submitReply(parentId: number) {
    const text = replyBody.trim();

    if (!text) {
      setMessage("返信を入力してください。");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && !allowAnonymous) {
      setMessage("ログインが必要です。");
      return;
    }

    const { error } = await supabase.from("comments").insert({
      [targetColumn]: targetId,
      author_id: user?.id ?? null,
      parent_id: parentId,
      body: text,
      is_anon: true,
      user_mask: makeAnonMask(),
      status: "visible",
    });

    if (error) {
      console.error("submitReply error:", error);
      setMessage(error.message || "返信を投稿できませんでした。");
      return;
    }

    setReplyBody("");
    setReplyToId(null);
    setMessage("返信を投稿しました。");
    await loadComments();
  }

  async function updateComment(commentId: number) {
    const text = editingBody.trim();

    if (!text) {
      setMessage("コメントを入力してください。");
      return;
    }

    if (!currentUserId) return;

    const { error } = await supabase
      .from("comments")
      .update({
        body: text,
        edited_at: new Date().toISOString(),
      })
      .eq("id", commentId)
      .eq("author_id", currentUserId)
      .eq("status", "visible");

    if (error) {
      console.error("updateComment error:", error);
      setMessage(error.message || "コメントを編集できませんでした。");
      return;
    }

    setEditingId(null);
    setEditingBody("");
    setMessage("コメントを編集しました。");
    await loadComments();
  }

  async function deleteComment(commentId: number) {
    if (!currentUserId) return;

    const confirmed = window.confirm(
      "本当にコメントを削除しますか？\n\nこの操作は取り消せません。"
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("comments")
      .update({ status: "deleted" })
      .eq("id", commentId)
      .eq("author_id", currentUserId);

    if (error) {
      console.error("deleteComment error:", error);
      setMessage(error.message || "コメントを削除できませんでした。");
      return;
    }

    setMessage("コメントを削除しました。");
    await loadComments();
  }

  function renderComment(comment: Comment, isReply = false) {
    const isOwner =
      !!currentUserId && comment.author_id === currentUserId;

    return (
      <div
        key={comment.id}
        className={
          isReply
            ? "ml-5 border-l border-dotted border-[#d7cec3] pl-4"
            : "pb-4"
        }
      >
        <div className="mb-1 flex flex-wrap items-center gap-2 text-[12px] text-[#9b948c]">
          <span>
            {comment.status === "deleted"
              ? "削除済み"
              : comment.user_mask || "匿名さん"}
          </span>

          <span className="text-[#c1b8ae]">·</span>
          <span>{formatCommentTime(comment.created_at)}</span>

          {comment.status !== "deleted" && isOwner && (
            <>
              <span className="text-[#c1b8ae]">·</span>

              <CommentActionButton
                variant="edit"
                onClick={() => {
                  setEditingId(comment.id);
                  setEditingBody(comment.body);
                  setReplyToId(null);
                  setMessage("");
                }}
              >
                編集
              </CommentActionButton>
            </>
          )}
        </div>

        {comment.status === "deleted" ? (
          <p className="italic text-[13px] text-[#a8a199]">
            削除されたコメントです
          </p>
        ) : editingId === comment.id ? (
          <div className="mt-2">
            <textarea
              value={editingBody}
              onChange={(e) => setEditingBody(e.target.value)}
              rows={3}
              className="w-full resize-none border border-[#d7cec3] bg-white px-3 py-2 text-[13px] outline-none"
            />

            <div className="mt-2 flex gap-3">
              <CommentActionButton
                variant="save"
                onClick={() => updateComment(comment.id)}
              >
                保存
              </CommentActionButton>

              <CommentActionButton
                variant="cancel"
                onClick={() => {
                  setEditingId(null);
                  setEditingBody("");
                }}
              >
                キャンセル
              </CommentActionButton>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[#5f5a54]">
            {comment.body}
            {comment.edited_at && (
              <span className="ml-2 text-[11px] text-[#aaa199]">
                編集済み
              </span>
            )}
          </p>
        )}

        {comment.status !== "deleted" && (
          <div className="mt-2 flex gap-3">
            {!isReply && (
              <CommentActionButton
                variant="reply"
                onClick={() => {
                  setReplyToId(comment.id);
                  setReplyBody("");
                  setEditingId(null);
                  setMessage("");
                }}
              >
                返信
              </CommentActionButton>
            )}

            {isOwner && (
              <CommentActionButton
                variant="delete"
                onClick={() => deleteComment(comment.id)}
              >
                削除
              </CommentActionButton>
            )}
          </div>
        )}

        {replyToId === comment.id && (
          <div className="mt-3 border-l border-dotted border-[#d7cec3] pl-3">
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              rows={2}
              className="w-full resize-none border border-[#d7cec3] bg-white px-3 py-2 text-[13px] outline-none"
              placeholder="匿名で返信を書く..."
            />

            <div className="mt-2 flex gap-3">
              <CommentActionButton
                variant="save"
                onClick={() => submitReply(comment.id)}
              >
                投稿
              </CommentActionButton>

              <CommentActionButton
                variant="cancel"
                onClick={() => {
                  setReplyToId(null);
                  setReplyBody("");
                }}
              >
                キャンセル
              </CommentActionButton>
            </div>
          </div>
        )}

        {!isReply && getReplies(comment.id).length > 0 && (
          <div className="mt-4 space-y-3">
            {getReplies(comment.id).map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  }

  return (
    <section className={sectionClassName}>
      <h2 className="mb-4 text-[20px] font-bold text-[#4f4a45]">
        匿名コメント
      </h2>

      <div className="mb-6 space-y-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className="w-full resize-none border border-[#d7cec3] bg-white px-3 py-2 text-[14px] outline-none"
          placeholder="匿名でコメントを書く..."
        />

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-[#7d572a]">
            {allowAnonymous
              ? "ログインなしで投稿できます。表示名はランダムです。編集・削除はできません。"
              : "コメントは匿名で表示されます。"}
          </p>

          <CommentActionButton
            variant="save"
            onClick={submitComment}
            disabled={posting}
          >
            {posting ? "投稿中..." : "投稿"}
          </CommentActionButton>
        </div>

        {message && (
          <div className="text-[12px] text-[#8d857c]">{message}</div>
        )}
      </div>

      {loading ? (
        <div className="text-[13px] text-[#9b948c]">
          Loading comments...
        </div>
      ) : parentComments.length === 0 ? (
        <div className="text-[13px] text-[#9b948c]">
          まだコメントはありません。
        </div>
      ) : (
        <div className="space-y-4">
          {parentComments.map((comment) => renderComment(comment))}
        </div>
      )}
    </section>
  );
}

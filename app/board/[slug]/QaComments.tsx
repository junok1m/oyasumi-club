"use client";

import CommentThread from "@/components/comments/CommentThread";

export default function QaComments({ postId }: { postId: number }) {
  return (
    <CommentThread
      targetType="board"
      targetId={postId}
      sectionClassName="mt-10 border-t border-[#e4ddd4] pt-6"
    />
  );
}
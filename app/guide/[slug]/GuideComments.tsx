"use client";

import CommentThread from "@/components/comments/CommentThread";

export default function GuideComments({
  guidePostId,
}: {
  guidePostId: number;
}) {
  return (
    <CommentThread
      targetType="guide"
      targetId={guidePostId}
      sectionClassName="mt-16 pt-6"
    />
  );
}
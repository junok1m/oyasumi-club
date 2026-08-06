import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function prettySlug(post: { id: number; slug: string | null }) {
    return post.slug ? `${post.id}-${post.slug}` : `${post.id}`;
}
function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}
export default async function ReviewsPage() {
    const { data: reviews } = await supabase
        .from("board_posts")
        .select(`
  id,
  title,
  slug,
  created_at,
  views,
  location,
  industry,
  thumbnail_url,
  thumbnail_small_url
`)
        .eq("status", "approved")
        .eq("category", "review")
        .in("audience", ["all", "women"])
        .order("created_at", { ascending: false });

    return (
        <main className="mx-auto w-[92%] max-w-5xl py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">💬 お店の口コミ</h1>

                <p className="mt-3 text-sm text-gray-500">
                    女の子たちが投稿したリアルな口コミ
                </p>
            </div>

<div className="grid gap-6 md:grid-cols-2">
                {(reviews ?? []).map((review) => (
                    <Link
                        key={review.id}
                        href={`/board/${prettySlug(review)}`}
                        className="block rounded-xl border bg-white p-5 hover:bg-gray-50"
                    >
                        <h2 className="font-semibold">
                            {review.title}
                        </h2>

                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                            {review.location && (
                                <span>{review.location}</span>
                            )}

                            {review.industry && (
                                <span>• {review.industry}</span>
                            )}

                            <span>• 👀 {review.views ?? 0}</span>
                        </div>
                    </Link>
                ))}
            </div>

            {reviews?.length === 0 && (
                <div className="rounded-xl border p-8 text-center text-gray-500">
                    まだ口コミがありません。
                </div>
            )}
        </main>
    );
}
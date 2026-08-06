// app/admin/guide/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";

export default async function AdminGuidePage() {
const supabase = await supabaseServer();

const {
data: { user },
} = await supabase.auth.getUser();

if (!user) {
redirect("/login");
}

const { data: profile } = await supabase
.from("profiles")
.select("role")
.eq("id", user.id)
.single();

if (!profile || profile.role !== "admin") {
redirect("/");
}

const { data: guides, error } = await supabase
.from("guide_posts")
.select(`       id,
      title,
      slug,
      industry,
      location,
      created_at
    `)
.order("created_at", { ascending: false });

if (error) {
console.error("AdminGuidePage:", error);
}

return (

<main className="min-h-screen bg-[#f7f4ee] text-[#5f5a54]"> <div className="mx-auto w-[92%] max-w-5xl py-8">

```
    <h1 className="mb-6 text-[20px] font-medium text-[#3f3a35]">
      Guide Management
    </h1>

    <div className="mb-8 flex flex-wrap gap-2">
      <Link
        href="/admin/posts"
        className="border border-[#ddd4c9] px-3 py-1.5 text-[13px]"
      >
        Posts
      </Link>

      <Link
        href="/admin/users"
        className="border border-[#ddd4c9] px-3 py-1.5 text-[13px]"
      >
        Users
      </Link>

      <Link
        href="/admin/guide"
        className="border border-[#8f8174] bg-[#e9dfd3] px-3 py-1.5 text-[13px]"
      >
        Guide
      </Link>
    </div>

    <div className="mb-6">
      <Link
        href="/guide/write"
        className="inline-block border border-[#8f8174] bg-[#f4ede4] px-4 py-2 text-[13px]"
      >
        ＋ 新しいガイドを書く
      </Link>
    </div>

    <div className="border-t border-[#e7e1d8]">
      {guides?.map((guide) => {
        const prettySlug = guide.slug
          ? `${guide.id}-${guide.slug}`
          : `${guide.id}`;

        return (
          <div
            key={guide.id}
            className="border-b border-[#e7e1d8] py-4"
          >
            <div className="mb-2 text-[15px] text-[#3f3a35]">
              {guide.title}
            </div>

            <div className="mb-3 flex flex-wrap gap-2 text-[12px] text-[#93897f]">
              {guide.industry && (
                <span>{guide.industry}</span>
              )}

              {guide.location && (
                <span>{guide.location}</span>
              )}
            </div>

            <div className="flex gap-3 text-[13px]">
              <Link
                href={`/guide/${prettySlug}`}
                className="underline"
              >
                View
              </Link>

              <Link
                href={`/guide/${prettySlug}/edit`}
                className="underline"
              >
                Edit
              </Link>
            </div>
          </div>
        );
      })}
    </div>

  </div>
</main>


);
}

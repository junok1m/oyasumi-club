import { supabaseServer } from "@/lib/supabase-server";

async function getPosts(sort: string, category: string, page: number) {
  const pageSize = 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseServer
    .from("board_posts")
    .select("*", { count: "exact" });

  // category filter
  if (category !== "all") {
    query = query.eq("category", category);
  }

  // status filter (중요)
  query = query.eq("status", "approved");

  // sort
  if (sort === "views") {
    query = query.order("views", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  // pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error || !data) {
    console.error(error);
    return {
      results: [],
      page: 1,
      total_pages: 1,
    };
  }

  const totalPages = Math.ceil((count || 0) / pageSize);

  // pretty_slug 만들어주기 (Django 대체)
  const results = data.map((post) => ({
    ...post,
    pretty_slug: post.slug
      ? `${post.id}-${post.slug}`
      : `${post.id}`,
  }));

  return {
    results,
    page,
    total_pages: totalPages,
  };
}
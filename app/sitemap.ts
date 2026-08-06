// app/sitemap.ts

import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://www.oyasumi-club.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ----------------------------------
  // Board Posts
  // ----------------------------------
  const { data: boardPosts, error: boardError } = await supabase
    .from("board_posts")
    .select("id, slug, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (boardError) {
    console.error("sitemap board_posts error:", boardError);
  }

  const boardUrls =
    boardPosts?.map((post) => {
      const rawSlug = post.slug
        ? `${post.id}-${post.slug}`
        : String(post.id);

      return {
        url: `${SITE_URL}/board/${encodeURIComponent(rawSlug)}`,
        lastModified: new Date(post.created_at),
      };
    }) ?? [];

  // ----------------------------------
  // Guide Posts
  // ----------------------------------
  const { data: guidePosts, error: guideError } = await supabase
    .from("guide_posts")
    .select("id, slug, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (guideError) {
    console.error("sitemap guide_posts error:", guideError);
  }

  const guideUrls =
    guidePosts?.map((post) => {
      const rawSlug = post.slug
        ? `${post.id}-${post.slug}`
        : String(post.id);

      return {
        url: `${SITE_URL}/guide/${encodeURIComponent(rawSlug)}`,
        lastModified: new Date(post.created_at),
      };
    }) ?? [];

  // ----------------------------------
  // Location Hubs
  // board_posts + guide_posts
  // ----------------------------------
  const { data: boardLocationData, error: boardLocationError } = await supabase
    .from("board_posts")
    .select("location")
    .eq("status", "approved")
    .not("location", "is", null);

  if (boardLocationError) {
    console.error("sitemap board location error:", boardLocationError);
  }

  const { data: guideLocationData, error: guideLocationError } = await supabase
    .from("guide_posts")
    .select("location")
    .eq("status", "approved")
    .not("location", "is", null);

  if (guideLocationError) {
    console.error("sitemap guide location error:", guideLocationError);
  }

  const locationUrls = Array.from(
    new Set(
      [...(boardLocationData ?? []), ...(guideLocationData ?? [])]
        .map((post) => post.location?.trim())
        .filter(Boolean)
    )
  ).map((location) => ({
    url: `${SITE_URL}/location/${encodeURIComponent(location!)}`,
    lastModified: new Date(),
  }));

  // ----------------------------------
  // Industry Hubs
  // board_posts + guide_posts
  // ----------------------------------
  const { data: boardIndustryData, error: boardIndustryError } = await supabase
    .from("board_posts")
    .select("industry")
    .eq("status", "approved")
    .not("industry", "is", null);

  if (boardIndustryError) {
    console.error("sitemap board industry error:", boardIndustryError);
  }

  const { data: guideIndustryData, error: guideIndustryError } = await supabase
    .from("guide_posts")
    .select("industry")
    .eq("status", "approved")
    .not("industry", "is", null);

  if (guideIndustryError) {
    console.error("sitemap guide industry error:", guideIndustryError);
  }

  const industryUrls = Array.from(
    new Set(
      [...(boardIndustryData ?? []), ...(guideIndustryData ?? [])]
        .map((post) => post.industry?.trim())
        .filter(Boolean)
    )
  ).map((industry) => ({
    url: `${SITE_URL}/industry/${encodeURIComponent(industry!)}`,
    lastModified: new Date(),
  }));

  // ----------------------------------
  // Static Pages
  // ----------------------------------
  const staticPages = [
    SITE_URL,
    `${SITE_URL}/board`,
    `${SITE_URL}/guide`,
    `${SITE_URL}/jobs`,
    `${SITE_URL}/promo`,
    `${SITE_URL}/qna`,
    `${SITE_URL}/blog`,
  ].map((url) => ({
    url,
    lastModified: new Date(),
  }));

  return [
    ...staticPages,
    ...locationUrls,
    ...industryUrls,
    ...guideUrls,
    ...boardUrls,
  ];
}
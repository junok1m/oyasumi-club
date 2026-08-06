"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function requireAdmin() {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    throw new Error("Not allowed");
  }

  return user;
}

export async function approvePostAction(formData: FormData) {
  await requireAdmin();

  const postId = Number(formData.get("postId"));
  if (!postId) throw new Error("Invalid post id");

  const admin = supabaseAdmin();

  const { error } = await admin
    .from("board_posts")
    .update({ status: "approved" })
    .eq("id", postId)
    .neq("status", "deleted");

  if (error) throw new Error(error.message);

  revalidatePath("/admin/posts");
  revalidatePath("/board");
}

export async function rejectPostAction(formData: FormData) {
  await requireAdmin();

  const postId = Number(formData.get("postId"));
  if (!postId) throw new Error("Invalid post id");

  const admin = supabaseAdmin();

  const { error } = await admin
    .from("board_posts")
    .update({ status: "rejected" })
    .eq("id", postId)
    .neq("status", "deleted");

  if (error) throw new Error(error.message);

  revalidatePath("/admin/posts");
  revalidatePath("/board");
}

export async function deletePostAction(formData: FormData) {
  await requireAdmin();

  const postId = Number(formData.get("postId"));
  if (!postId) throw new Error("Invalid post id");

  const admin = supabaseAdmin();

  const { error } = await admin
    .from("board_posts")
    .update({ status: "deleted", is_featured: false })
    .eq("id", postId)
    .neq("status", "deleted");

  if (error) throw new Error(error.message);

  revalidatePath("/admin/posts");
  revalidatePath("/board");
}

export async function toggleFeaturedAction(formData: FormData) {
  await requireAdmin();

  const postId = Number(formData.get("postId"));
  const currentValue = formData.get("currentValue") === "true";

  if (!postId) throw new Error("Invalid post id");

  const admin = supabaseAdmin();

  const { error } = await admin
    .from("board_posts")
    .update({ is_featured: !currentValue })
    .eq("id", postId)
    .neq("status", "deleted");

  if (error) throw new Error(error.message);

  revalidatePath("/admin/posts");
  revalidatePath("/board");
}
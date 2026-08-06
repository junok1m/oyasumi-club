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

export async function hideCommentAction(formData: FormData) {
  await requireAdmin();

  const commentId = Number(formData.get("commentId"));
  if (!commentId) throw new Error("Invalid comment id");

  const admin = supabaseAdmin();

  const { error } = await admin
    .from("comments")
    .update({ status: "deleted" })
    .eq("id", commentId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/comments");
  revalidatePath("/board");
}

export async function restoreCommentAction(formData: FormData) {
  await requireAdmin();

  const commentId = Number(formData.get("commentId"));
  if (!commentId) throw new Error("Invalid comment id");

  const admin = supabaseAdmin();

  const { error } = await admin
    .from("comments")
    .update({ status: "visible" })
    .eq("id", commentId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/comments");
  revalidatePath("/board");
}
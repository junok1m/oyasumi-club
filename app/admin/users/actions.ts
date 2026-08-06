"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function requireAdminAction() {
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

  return user;
}

async function changeUserRole(
  targetUserId: string,
  newRole: "admin" | "shop" | "client" | "girl"
) {
  const currentUser = await requireAdminAction();

  if (!targetUserId) {
    throw new Error("Missing user id.");
  }

  if (currentUser.id === targetUserId) {
    throw new Error("You cannot change your own role.");
  }

  const admin = supabaseAdmin();

  const { error } = await admin
    .from("profiles")
    .update({ role: newRole })
    .eq("id", targetUserId);

  if (error) {
    throw new Error(error.message || "Failed to update role.");
  }

  revalidatePath("/admin/users");
}

export async function makeAdminAction(formData: FormData) {
  const userId = String(formData.get("userId") || "");
  await changeUserRole(userId, "admin");
}

export async function makeShopAction(formData: FormData) {
  const userId = String(formData.get("userId") || "");
  await changeUserRole(userId, "shop");
}

export async function makeClientAction(formData: FormData) {
  const userId = String(formData.get("userId") || "");
  await changeUserRole(userId, "client");
}

export async function makeGirlAction(formData: FormData) {
  const userId = String(formData.get("userId") || "");
  await changeUserRole(userId, "girl");
}
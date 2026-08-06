import { supabase } from "./supabase";

export async function getMyProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, role, display_name, work_category, location, bio, website, phone")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Profile fetch failed:", profileError);
    return null;
  }

  return profile;
}
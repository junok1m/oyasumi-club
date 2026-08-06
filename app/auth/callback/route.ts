import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=auth_callback", url.origin));
  }

  const supabase = await supabaseServer();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login?error=auth_callback", url.origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("auth callback profile fetch error:", profileError);
    return NextResponse.redirect(new URL("/profile", url.origin));
  }

  if (!profile?.display_name?.trim()) {
    return NextResponse.redirect(new URL("/profile", url.origin));
  }

  return NextResponse.redirect(new URL("/", url.origin));
}
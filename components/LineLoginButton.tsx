"use client";

import { supabaseClient } from "@/lib/supabase-client";

export default function LineLoginButton() {
  const handleLogin = async () => {
    const supabase = supabaseClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "custom:line",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error(error);
    }
  };

  return (
    <button
  type="button"
  onClick={handleLogin}
  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#06C755] py-3 font-semibold text-white hover:bg-[#05b34d]"
>
  📱 LINEでログイン
</button>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Me = {
  id: string;
  username: string | null;
  display_name?: string | null;
  role: string | null;
};

export default function AuthStatus() {
  const [me, setMe] = useState<Me | null>(null);
  const shownName = me?.display_name?.trim() || me?.username || "";

  useEffect(() => {
    async function fetchMe() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMe(null);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("username, display_name, role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setMe({
        id: user.id,
        username: profile.username,
        display_name: profile.display_name,
        role: profile.role,
      });
    }

    fetchMe();

    // 🔥 로그인/로그아웃 실시간 반응
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchMe();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (!me) {
    return (
      <div className="flex items-center gap-3 text-[12px] text-[#7d766e]">
        <Link href="/login" className="hover:underline">
          login
        </Link>
        <Link href="/signup" className="hover:underline">
          signup
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-[12px] text-[#7d766e]">
      <span>
        <Link href="/profile">{shownName}</Link>
        {me.role ? ` (${me.role})` : ""}
      </span>
      <button onClick={handleLogout} className="hover:underline">
        logout
      </button>
    </div>
  );
}
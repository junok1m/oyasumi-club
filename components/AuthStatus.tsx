"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Me = {
  id: string;
  display_name: string | null;
  role: string | null;
};

export default function AuthStatus() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchMe() {
      if (fetchingRef.current) return;
      fetchingRef.current = true;

      try {
        setLoading(true);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (cancelled) return;

        const user = session?.user;

        if (!user) {
          setMe(null);
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("id, display_name, role")
          .eq("id", user.id)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error("AuthStatus fetch profile error:", error);
          setMe(null);
          return;
        }

        setMe({
          id: user.id,
          display_name: profile?.display_name ?? null,
          role: profile?.role ?? null,
        });
      } catch (error) {
        if (!cancelled) {
          console.error("AuthStatus fetchMe error:", error);
          setMe(null);
        }
      } finally {
        fetchingRef.current = false;

        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchMe();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchMe();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-[12px] text-[#7d766e]">
        <span>...</span>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="flex items-center gap-3 text-[12px] text-[#7d766e]">
        <Link href="/login" className="text-sm">
          ログイン
        </Link>
        
      </div>
    );
  }

  const shownName = me.display_name?.trim() || "profile";

  return (
    <div className="flex items-center gap-3 text-[12px] text-[#7d766e]">
      <span>
        <Link href="/profile">{shownName}</Link>
        {me.role ? ` (${me.role})` : ""}
      </span>
      <button type="button" onClick={handleLogout} className="hover:underline">
        logout
      </button>
    </div>
  );
}
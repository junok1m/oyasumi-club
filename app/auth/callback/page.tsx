"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    async function handleCallback() {
      const code = params.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage("Verification failed or expired.");
          return;
        }
      }

      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        setMessage("Verification failed or expired.");
        return;
      }

      setMessage("Verified. Redirecting...");
      setTimeout(() => router.push("/"), 800);
    }

    handleCallback();
  }, [params, router]);

  return (
    <div className="text-center">
      <h1 className="text-lg mb-2">Email Verification</h1>
      <p>{message}</p>
    </div>
  );
}
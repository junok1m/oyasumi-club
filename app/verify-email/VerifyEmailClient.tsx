"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmailClient() {
  const params = useSearchParams();
  const router = useRouter();

  const uid = params.get("uid");
  const token = params.get("token");

  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    if (!uid || !token) {
      setMessage("Invalid verification link.");
      return;
    }

    const api = process.env.NEXT_PUBLIC_API_BASE_URL;

    fetch(
      `${api}/api/verify-email/?uid=${encodeURIComponent(uid)}&token=${encodeURIComponent(token)}`
    )
      .then(async (res) => {
        const data = await res.json();
        console.log("verify response:", data);

        if (!res.ok) {
          setMessage(data.error || "Verification failed.");
          return;
        }

        if (data.token) {
          localStorage.setItem("token", data.token);
          console.log("saved token:", localStorage.getItem("token"));
        }

        if (data.username) {
          localStorage.setItem("username", data.username);
        }

        if (data.role) {
          localStorage.setItem("role", data.role);
        }

        setMessage("Verified. Redirecting...");

        setTimeout(() => {
          router.push("/");
        }, 800);
      })
      .catch((err) => {
        console.error(err);
        setMessage("Network error.");
      });
  }, [uid, token, router]);

  return (
    <div className="text-center">
      <h1 className="text-lg mb-2">Email Verification</h1>
      <p>{message}</p>
    </div>
  );
}
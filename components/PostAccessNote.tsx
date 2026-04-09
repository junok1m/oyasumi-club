"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PostAccessNote() {
  const [href, setHref] = useState("/signup");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setHref("/profile");
  }, []);

  return (
    <div className="pt-8 text-center text-[11px] text-[#9a948d]">
      <p>Posting access depends on your role.</p>
      <p className="mt-1">
        Write from your{" "}
        <Link href={href} className="underline hover:text-[#5a544e]">
          profile page
        </Link>
        .
      </p>
    </div>
  );
}
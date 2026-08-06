"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CITIES } from "@/lib/cities";

function BottomNavInner() {
  const pathname = usePathname();

  const cityFromPath = CITIES.find(
    (c) => pathname === `/${c.value}` || pathname.startsWith(`/${c.value}/`)
  )?.value;

  function isActive(path: string) {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  }

  const jobsHref = cityFromPath ? `/${cityFromPath}/jobs` : "/jobs";
  const qnaHref = cityFromPath ? `/${cityFromPath}/qna` : "/qna";

  const items = [
    { icon: "💜", text: "ホーム", href: "/", path: "/" },
    {
      icon: "💼",
      text: "求人",
      href: jobsHref,
      path: cityFromPath ? `/${cityFromPath}/jobs` : "/jobs",
    },
    {
      icon: "❓",
      text: "Q&A",
      href: qnaHref,
      path: cityFromPath ? `/${cityFromPath}/qna` : "/qna",
    },
    { icon: "📝", text: "記事", href: "/blog", path: "/blog" },
    { icon: "👤", text: "マイページ", href: "/profile", path: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#242134] bg-[#080710]">
      <div className="mx-auto grid max-w-5xl grid-cols-5 py-3 text-center">
        {items.map((item) => {
          const active = isActive(item.path);

          return (
            <Link
              key={item.text}
              href={item.href}
              className={`text-xs transition-colors ${
                active ? "text-purple-300" : "text-[#a9a0bb]"
              }`}
            >
              <div className="text-lg">{item.icon}</div>
              <div>{item.text}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function BottomNav() {
  return (
    <Suspense fallback={null}>
      <BottomNavInner />
    </Suspense>
  );
}

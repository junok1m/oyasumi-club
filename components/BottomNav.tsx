"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function BottomNavInner() {
  const pathname = usePathname();

  function isActive(path: string) {
    if (path === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(path);
  }

  const items = [
    { icon: "💜", text: "ホーム", href: "/", path: "/" },
    { icon: "💼", text: "求人", href: "/jobs", path: "/jobs" },
    { icon: "❓", text: "Q&A", href: "/qna", path: "/qna" },
    { icon: "📝", text: "記事", href: "/blog", path: "/blog" },
    { icon: "👤", text: "新着", href: "/feed", path: "/feed" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#242134] bg-[#080710]">
      <div className="mx-auto grid max-w-5xl grid-cols-5 py-3 text-center">
        {items.map((item) => {
          const active = isActive(item.path);

          return (
            <Link
              key={item.href}
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

import Link from "next/link";
import AuthStatus from "./AuthStatus";

export default function SiteHeader() {
  return (
    <header className="relative z-50 border-b border-[#242134] bg-[#080710]">
      <div className="mx-auto flex h-14 w-[92%] max-w-5xl items-center justify-between">

  <Link
    href="/"
    className="flex items-center gap-2 text-[15px] font-semibold text-[#f6e7ff]"
  >
    <span className="text-sm">おやすみクラブ🌙</span>
  </Link>

  <div className="flex items-center gap-3">
    <Link
    href="/"
    className="rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-sm font-semibold text-blue-300 transition hover:bg-blue-400/20"
  >
    🚹 男性専用
  </Link>
    <Link
      href="/girls"
      className="rounded-full border border-pink-400/30 bg-pink-400/10 px-3 py-1 text-sm font-semibold text-pink-300 transition hover:bg-pink-400/20"
    >
      🚺 女性専用
    </Link>

    <AuthStatus />

  </div>
</div>
    </header>
  );
}
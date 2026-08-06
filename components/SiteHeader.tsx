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
          <AuthStatus />
        </div>
      </div>
    </header>
  );
}

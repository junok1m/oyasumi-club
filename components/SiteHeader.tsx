import Link from "next/link";
import AuthStatus from "./AuthStatus";

export default function SiteHeader() {
  return (
    <header className="border-b border-[#e7e1d8] bg-[#f7f4ee]/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-[92%] max-w-5xl items-center justify-between">

        {/* left: logo */}
        <Link href="/" className="text-[15px] font-medium text-[#4f4a45]">
        おやすみクラブ
        </Link>

        {/* center: nav */}
        <nav className="flex items-center gap-4 text-[14px] text-[#6c655d]">
          <Link href="/board" className="hover:text-[#3f3a35]">
            Board
          </Link>
          <Link href="/feed" className="hover:text-[#3f3a35]">
            Feed
          </Link>
        </nav>

        {/* right: auth */}
        <AuthStatus />

      </div>
    </header>
  );
}
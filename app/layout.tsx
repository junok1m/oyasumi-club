import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "おやすみクラブ🌙",
  description: "feed + experiments",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f7f4ee] text-[#5f5a54]">

        {/* 🔥 여기 핵심 */}
        <SiteHeader />

        <main className="flex-1">
          {children}
        </main>
{/* footer */}
<footer className="mt-20 pb-8 text-center text-[11px] text-[#9a948d]">
  <span className="opacity-70">built by </span>
  <a
    href="https://aaot.vercel.app"
    target="_blank"
    rel="noopener noreferrer"
    className="hover:text-[#5a544e] transition"
  >
    aaot
  </a>
</footer>
      </body>
    </html>
  );
}
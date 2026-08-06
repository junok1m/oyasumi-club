import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader"
import BottomNav from "@/components/BottomNav";
import { Analytics } from "@vercel/analytics/next";
import LineContactButton from "@/components/LineContactButton";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.oyasumi-club.com"),
  title: {
    default: "おやすみクラブ | シドニー夜遊び・ナイトライフ情報",
    template: "%s | おやすみクラブ",
  },
  description:
    "シドニーの夜遊び・夜職求人・ナイトライフ情報を日本語でチェック。求人、プロモーション、ブログ、Q&A、ガイドをまとめた日本人向け掲示板サイトです。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col bg-[#f7f4ee] text-[#5f5a54]">
        <Analytics />
        <SiteHeader />

        <main className="flex-1 pb-20">
          {children}
        </main>

        <BottomNav />
        <LineContactButton /></body>
    </html>
  );
}
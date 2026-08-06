import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import BottomNav from "@/components/BottomNav";
import { Analytics } from "@vercel/analytics/next";

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
    default: "おやすみクラブ | シドニーで働く女の子の情報交換所",
    template: "%s | おやすみクラブ",
  },
  description:
    "シドニーで働く女の子のためのQ&A・求人・口コミ・ノウハウ。ひとりで抱え込まず、先輩のリアルな話を見ていってね。",
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
      <body className="min-h-dvh flex flex-col bg-[#fff7fa] text-[#4f3a4f]">
        <Analytics />
        <SiteHeader />

        <main className="flex-1 pb-20">{children}</main>

        <BottomNav />
      </body>
    </html>
  );
}

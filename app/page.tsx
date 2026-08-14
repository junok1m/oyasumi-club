import type { Metadata } from "next";
import HomePageView from "@/components/HomePageView";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "おやすみクラブ | オーストラリアで働く女の子の居場所",
  description:
    "シドニー・メルボルン・ブリスベンなど、オーストラリアで働く女の子のための求人・Q&A・口コミ・ノウハウをまとめたサイトです。",
  alternates: {
    canonical: "https://www.oyasumi-club.com",
  },
};

export default function HomePage() {
  return <HomePageView />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomePageView from "@/components/HomePageView";
import { CITIES, cityLabelJa, isValidCity } from "@/lib/cities";

export const revalidate = 60;



export async function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.value }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  if (!isValidCity(city)) return { title: "おやすみクラブ" };

  const name = cityLabelJa(city);
  const title = `${name}で働く女の子の居場所 | おやすみクラブ`;
  const description = `${name}の求人・Q&A・口コミをまとめた、女の子向け情報サイトです。`;

  return {
    title,
    description,
    alternates: { canonical: `https://www.oyasumi-club.com/${city}` },
    openGraph: {
      title,
      description,
      url: `https://www.oyasumi-club.com/${city}`,
      type: "website",
    },
  };
}

export default async function CityHomePage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  if (!isValidCity(city)) notFound();

  return <HomePageView city={city} />;
}

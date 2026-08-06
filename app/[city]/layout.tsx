import { notFound } from "next/navigation";
import { isValidCity } from "@/lib/cities";

export default async function CityLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;

  if (!isValidCity(city)) {
    notFound();
  }

  return children;
}

// components/location/LocationPills.tsx

import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import { HomeSection } from "@/components/home/HomeSection";

async function getLocations(
  category?: string,
  source: "board" | "guide" | "all" = "board"
) {
  const supabase = await supabaseServer();
  const counts = new Map<string, number>();

  if (source === "board" || source === "all") {
    let boardQuery = supabase
      .from("board_posts")
      .select("location")
      .eq("status", "approved")
      .not("location", "is", null);

    if (category) {
      boardQuery = boardQuery.eq("category", category);
    }

    const { data: boardData, error: boardError } = await boardQuery;

    if (boardError) {
      console.error("get board locations error:", boardError);
    }

    boardData?.forEach((post) => {
      const location = post.location?.trim();
      if (!location) return;
      counts.set(location, (counts.get(location) || 0) + 1);
    });
  }

  if (source === "guide" || source === "all") {
    const { data: guideData, error: guideError } = await supabase
      .from("guide_posts")
      .select("location")
      .eq("status", "approved")
      .not("location", "is", null);

    if (guideError) {
      console.error("get guide locations error:", guideError);
    }

    guideData?.forEach((post) => {
      const location = post.location?.trim();
      if (!location) return;
      counts.set(location, (counts.get(location) || 0) + 1);
    });
  }

  return Array.from(counts.entries()).map(([location, count]) => ({
    location,
    count,
  }));
}

export default async function LocationPills({
  category,
  basePath = "/location",
  title = "エリア別に見る",
  showTitle = true,
  currentLocation = "",
  queryMode = false,
  source = "board",
}: {
  category?: string;
  basePath?: string;
  title?: string;
  showTitle?: boolean;
  currentLocation?: string;
  queryMode?: boolean;
  source?: "board" | "guide" | "all";
}) {
  const locations = await getLocations(category, source);

  if (!locations.length) return null;

  const content = (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto whitespace-nowrap">
        {locations.map(({ location, count }) => {
          const isActive = currentLocation === location;

          const href = isActive
            ? basePath
            : queryMode
              ? `${basePath}?location=${encodeURIComponent(location)}`
              : `${basePath}/${encodeURIComponent(location)}`;

          return (
            <Link
              key={location}
              href={href}
              className={`shrink-0 border px-2 py-0.5 text-[16px] ${
                isActive
                  ? "border-[#8f8174] bg-[#e9dfd3] text-[#4f4a45]"
                  : "border-[#e3d8cc] bg-[#fbf8f2] text-[#5b534b]"
              }`}
            >
              {location}
              <span className="ml-1 text-[12px] text-[#aaa199]">
                ({count})
              </span>
            </Link>
          );
        })}
      </div>

      <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-[#f7f4ee] to-transparent" />
    </div>
  );

  if (!showTitle) {
    return content;
  }

  return <HomeSection title={title}>{content}</HomeSection>;
}
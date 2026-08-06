//lib/board.ts 
// 

export function categoryLabel(cat: string) {
  switch (cat) {
    case "news":
      return "ニュース";
    case "blog":
      return "ブログ";
    case "jobs":
      return "求人";
    case "promo":
      return "プロモーション";
    case "all":
      return "カテゴリ";
    case "qa":
      return "Q&A";
    default:
      return cat;
  }
}

export function industryLabel(industry: string | null) {
  switch (industry) {
    case "all":
      return "業種";
    case "fuzoku":
      return "風俗";
    case "karaoke":
      return "カラオケ";
    case "massage":
      return "マッサージ";
    case "club":
      return "クラブ";
    case "bar":
      return "バー";
    case "restaurant":
      return "レストラン";
    default:
      return null;
  }
}

export function buildBoardUrl({
  category,
  industry,
  sort,
  page,
  q,
  basePath = "/board",
}: {
  category: string | string[];
  industry: string | string[];
  sort: string;
  page?: number;
  q?: string;
  basePath?: string;
}) {
  const params = new URLSearchParams();

  const categories = Array.isArray(category) ? category : [category];
  const industries = Array.isArray(industry) ? industry : [industry];

  const cleanCategories = categories.filter((item) => item && item !== "all");
  const cleanIndustries = industries.filter((item) => item && item !== "all");

  if (basePath === "/board" && cleanCategories.length > 0) {
    params.set("category", cleanCategories.join(","));
  }

  if (cleanIndustries.length > 0) {
    params.set("industry", cleanIndustries.join(","));
  }

  if (sort && sort !== "latest") {
    params.set("sort", sort);
  }

  if (q && q.trim()) {
    params.set("q", q.trim());
  }

  if (page && page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `${basePath}?${query}` : basePath;
}
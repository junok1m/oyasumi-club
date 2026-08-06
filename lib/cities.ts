export const CITIES = [
  {
    value: "sydney",
    label: "Sydney",
    labelJa: "シドニー",
    country: "AU",
  },
  {
    value: "melbourne",
    label: "Melbourne",
    labelJa: "メルボルン",
    country: "AU",
  },
  {
    value: "brisbane",
    label: "Brisbane",
    labelJa: "ブリスベン",
    country: "AU",
  },
] as const;

export type CitySlug = (typeof CITIES)[number]["value"];

export const CITY_REQUIRED_CATEGORIES = ["jobs", "qa", "review"] as const;

export function isCityRequiredCategory(category: string) {
  return (CITY_REQUIRED_CATEGORIES as readonly string[]).includes(category);
}

export function cityLabelJa(slug: string | null | undefined) {
  if (!slug) return "";
  return CITIES.find((c) => c.value === slug)?.labelJa ?? slug;
}

export function isValidCity(slug: string | null | undefined): slug is CitySlug {
  if (!slug) return false;
  return CITIES.some((c) => c.value === slug);
}

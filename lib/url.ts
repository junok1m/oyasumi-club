export function buildUrl(
  basePath: string,
  {
    industry,
    sort = "latest",
    q = "",
    location = "",
    audience = "",
    page,
  }: {
    industry?: string;
    sort?: string;
    q?: string;
    location?: string;
    audience?: string;
    page?: number;
  }
) {
  const params = new URLSearchParams();

  if (industry && industry !== "all")
    params.set("industry", industry);

  if (sort && sort !== "latest")
    params.set("sort", sort);

  if (q)
    params.set("q", q);

  if (location)
    params.set("location", location);

  if (audience)
    params.set("audience", audience);

  if (page && page > 1)
    params.set("page", String(page));

  const query = params.toString();

  return query
    ? `${basePath}?${query}`
    : basePath;
}
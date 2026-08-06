import Link from "next/link";

export default function SearchBar({
  q,
  category,
  sort,
  basePath = "/board",
}: {
  q: string;
  category?: string;
  sort: string;
  basePath?: string;
}) {
  const clearParams = new URLSearchParams();

  if (category && category !== "all" && basePath === "/board") {
    clearParams.set("category", category);
  }

  if (sort && sort !== "latest") clearParams.set("sort", sort);

  const clearHref = clearParams.toString()
    ? `${basePath}?${clearParams.toString()}`
    : basePath;

  return (
    <form action={basePath} className="mb-5 flex items-center gap-2">
      {basePath === "/board" && category && (
        <input type="hidden" name="category" value={category} />
      )}

      <input type="hidden" name="sort" value={sort} />

      <input
        type="search"
        name="q"
        defaultValue={q}
        placeholder="気になるキーワードを検索..."
        className="min-w-0 flex-1 border border-[#ded6cc] bg-[#fbf8f3] px-3 py-2 text-[13px] text-[#5f5a54] outline-none placeholder:text-[#aaa29a]"
      />

      <button
        type="submit"
        className="border border-dashed border-[#cfc6bb] px-3 py-2 text-[12px] text-[#5f5a54] transition hover:border-[#8f877d] hover:text-[#4f4a45]"
      >
        🔍 検索
      </button>

      {q && (
        <Link
          href={clearHref}
          className="rounded-full px-2 py-2 text-[12px] text-[#9b948c] underline-offset-2 hover:underline"
        >
          Clear
        </Link>
      )}
    </form>
  );
}
import Link from "next/link";

export default function SearchBar({
  q = "",
  basePath = "/search",
  placeholder = "お店・記事・Q&Aを検索...",
  audience = "men",
}: {
  q?: string;
  basePath?: string;
  placeholder?: string;
  audience?: "men" | "girls";
}) {
  return (
    <form action={basePath} className="mb-5 flex items-center gap-2">
      <input type="hidden" name="audience" value={audience} />

      <input
        type="search"
        name="q"
        defaultValue={q}
        placeholder={placeholder}
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
          href={basePath}
          className="rounded-full px-2 py-2 text-[12px] text-[#9b948c] underline-offset-2 hover:underline"
        >
          Clear
        </Link>
      )}
    </form>
  );
}
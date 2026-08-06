// lib/category-style.ts

export function categoryLabel(category: string) {
  switch (category) {
    case "news":
      return "ニュース";
    case "blog":
      return "ブログ";
    case "jobs":
      return "求人";
    case "promo":
      return "プロモ";
    case "qa":
      return "Q&A";
    default:
      return "投稿";
  }
}

export function categoryColor(category: string) {
  switch (category) {
    case "news":
      return "px-2 py-0.5 text-[12px] bg-[#eef3ea] text-[#6f8660]";
    case "blog":
      return "px-2 py-0.5 text-[12px] bg-[#eef1f6] text-[#6b7896]";
    case "jobs":
      return "px-2 py-0.5 text-[12px] bg-[#f5eee9] text-[#8a5e3f]";
    case "promo":
      return "px-2 py-0.5 text-[12px] bg-[#f7eef2] text-[#a15470]";
    case "qa":
      return "px-2 py-0.5 text-[12px] bg-[#efe9f6] text-[#7d6896]";
    default:
      return "px-2 py-0.5 text-[12px] bg-[#f0ece6] text-[#8f887f]";
  }
}
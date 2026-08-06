//industry-style.ts


export function industryLabel(industry: string | null) {
  switch (industry) {
    case "fuzoku":
      return "風俗";
    case "karaoke":
      return "カラオケ";
    case "massage":
      return "マッサージ";
    case "club":
      return "クラブ";
    case "restaurant":
      return "レストラン";
    case "bar":
      return "バー";
    default:
      return null;
  }
}

export function industryStyle(industry: string | null) {
  switch (industry) {
    case "fuzoku":
  return "px-2 py-0.5 text-[12px] bg-[#fdf1ee] text-[#b35f55]";
    case "karaoke":
      return "px-2 py-0.5 text-[12px] bg-[#f7f6fb] text-[#756e96]";

    case "massage":
      return "px-2 py-0.5 text-[12px] bg-[#f4f8f2] text-[#6e8a68]";

    case "club":
      return "px-2 py-0.5 text-[12px] bg-[#f8f5fb] text-[#7d6896]";

    case "restaurant":
      return "px-2 py-0.5 text-[12px] bg-[#faf6f1] text-[#9a7458]";

    case "bar":
      return "px-2 py-0.5 text-[12px] bg-[#f8f6f2] text-[#8b7d68]";

    default:
      return "px-2 py-0.5 text-[12px] bg-[#f7f7f7] text-[#888]";
  }
}
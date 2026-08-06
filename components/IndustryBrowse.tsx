import Link from "next/link";
import { HomeSection } from "@/components/home/HomeSection";

type IndustryKey =
  | "fuzoku"
  | "massage"
  | "karaoke"
  | "bar"
  | "restaurant";

type IndustryItem = {
  key: IndustryKey;
  label: string;
  href: string;
  icon: string;
};

const industries: IndustryItem[] = [
  {
    key: "fuzoku",
    label: "🏩 風俗",
    href: "/industry/fuzoku",
    icon: "/mascot/brothel.png",
  },
  {
    key: "massage",
    label: "💆🏻‍♂️ マッサージ",
    href: "/industry/massage",
    icon: "/mascot/msg.png",
  },
  {
    key: "karaoke",
    label: "🎤 カラオケ",
    href: "/industry/karaoke",
    icon: "/mascot/ktv.png",
  },
  {
    key: "bar",
    label: "🍺 バー, レストラン",
    href: "/industry/bar",
    icon: "/mascot/bar.png",
  },
];

export default function IndustryBrowse({
  counts,
}: {
  counts?: Partial<Record<IndustryKey, number>>;
}) {
  const getCount = (item: IndustryItem) => {
    if (item.key === "bar") {
      return (counts?.bar ?? 0) + (counts?.restaurant ?? 0);
    }

    return counts?.[item.key];
  };

  return (
    <HomeSection title="業種から探す">
      <div className="grid grid-cols-2 gap-2">
        {industries.map((item) => {
          const count = getCount(item);

          return (
            <Link
              key={item.key}
              href={item.href}
              className="block border border-[#e7e1d8] bg-[#fbf8f2] px-4 py-4 active:bg-[#f3eee6]"
            >
              <div className="text-[16px] font-medium text-[#4a433d]">
                {item.label}
              </div>

              <div className="mt-2 text-[14px] text-[#9b938b]">
                {typeof count === "number"
                  ? `関連投稿 ${count}件`
                  : "投稿を見る →"}
              </div>
            </Link>
          );
        })}
      </div>
    </HomeSection>
  );
}
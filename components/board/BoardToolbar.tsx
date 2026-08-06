"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buildBoardUrl, categoryLabel, industryLabel } from "@/lib/board";

type Option = {
  value: string;
  label: string | null;
};

function MultiDropdown({
  label,
  options,
  selected,
  onChangeUrl,
}: {
  label: string;
  options: Option[];
  selected: string[];
  onChangeUrl: (nextSelected: string[]) => string;
}) {
  const [open, setOpen] = useState(false);
  const [draftSelected, setDraftSelected] = useState(selected);

  useEffect(() => {
    setDraftSelected(selected);
  }, [selected]);

  const activeLabel =
    selected.length > 0 ? `${label} ${selected.length}` : label;

  function toggleValue(value: string) {
    setDraftSelected((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  function clearDraft() {
    setDraftSelected([]);
  }

  function applyFilter() {
    window.location.href = onChangeUrl(draftSelected);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full border border-[#ddd6cc] bg-[#f7f4ee] px-3 py-2 text-left text-[12px] text-[#5f5a54]"
      >
        <span>{activeLabel}</span>
        <span className="float-right text-[#aaa29a]">⌄</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-full border border-[#ddd6cc] bg-[#f7f4ee] p-2 shadow-sm">
          <button
            type="button"
            onClick={clearDraft}
            className="mb-1 block w-full px-2 py-1 text-left text-[12px] text-[#aaa29a]"
          >
            すべて
          </button>

          {options.map((option) => {
            const checked = draftSelected.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleValue(option.value)}
                className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-[12px] text-[#5f5a54]"
              >
                <span className="w-4 text-[#a15470]">
                  {checked ? "✓" : ""}
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={applyFilter}
            className="mt-2 w-full border border-[#ddd6cc] bg-[#eee7de] px-2 py-1.5 text-[12px] text-[#4f4a45]"
          >
            この条件で見る
          </button>
        </div>
      )}
    </div>
  );
}

export default function BoardToolbar({
  category,
  industry,
  sort,
  q,
}: {
  category: string;
  industry: string;
  sort: string;
  q: string;
}) {
  const selectedCategories =
  !category || category === "all" ? [] : category.split(",").filter(Boolean);

  const selectedIndustries =
    industry === "all" ? [] : industry.split(",").filter(Boolean);

  const categoryOptions = ["news", "jobs", "promo", "blog", "qa"].map(
    (cat) => ({
      value: cat,
      label: categoryLabel(cat),
    })
  );

  const industryOptions = [
    "fuzoku",
    "karaoke",
    "massage",
    "club",
    "restaurant",
    "bar",
  ].map((item) => ({
    value: item,
    label: industryLabel(item),
  }));

  return (
    <div className="mb-8 py-4">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          <MultiDropdown
            label="カテゴリ"
            options={categoryOptions}
            selected={selectedCategories}
            onChangeUrl={(nextSelected) =>
              buildBoardUrl({
                category: nextSelected,
                industry,
                sort,
                q,
              })
            }
          />

          <MultiDropdown
            label="業種"
            options={industryOptions}
            selected={selectedIndustries}
            onChangeUrl={(nextSelected) =>
              buildBoardUrl({
                category,
                industry: nextSelected,
                sort,
                q,
              })
            }
          />
        </div>

        <div className="py-4 flex items-center justify-end gap-3 text-[12px]">
          <Link
            href={buildBoardUrl({
              category,
              industry,
              sort: "latest",
              q,
            })}
            className={`border-b border-dotted pb-0.5 ${
              sort === "latest"
                ? "border-[#5f5a54] text-[#4f4a45]"
                : "border-transparent text-[#9b948c]"
            }`}
          >
            新着順
          </Link>

          <Link
            href={buildBoardUrl({
              category,
              industry,
              sort: "views",
              q,
            })}
            className={`border-b border-dotted pb-0.5 ${
              sort === "views"
                ? "border-[#5f5a54] text-[#4f4a45]"
                : "border-transparent text-[#9b948c]"
            }`}
          >
            人気順
          </Link>
        </div>
      </div>
    </div>
  );
}
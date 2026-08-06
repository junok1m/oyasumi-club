"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AU_CITIES, NZ_CITIES, CITIES } from "@/lib/cities";

export default function CitySwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const currentCity = CITIES.find(
    (c) => pathname === `/${c.value}` || pathname.startsWith(`/${c.value}/`)
  );

  const label = currentCity ? currentCity.labelJa : "AUS·NZ";

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function rowClass(active: boolean) {
    return `flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] ${
      active
        ? "bg-[#1c1828] font-semibold text-pink-300"
        : "text-[#e8dff3] hover:bg-[#1c1828]"
    }`;
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-[#3a3348] bg-[#12101a] px-3 py-1.5 text-[12px] font-medium text-[#f6e7ff]"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span aria-hidden>📍</span>
        <span>{label}</span>
        <span className="text-[#a9a0bb]" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-50 mt-2 max-h-[70vh] min-w-[200px] overflow-y-auto rounded-xl border border-[#3a3348] bg-[#12101a] py-1 shadow-xl"
        >
          <button
            type="button"
            role="option"
            aria-selected={!currentCity}
            onClick={() => go("/")}
            className={rowClass(!currentCity)}
          >
            <span>AUS/NZ</span>
            <span className="text-[11px] text-[#a9a0bb]">すべて</span>
          </button>

          <div className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wide text-[#7a728c]">
            Australia
          </div>
          {AU_CITIES.map((city) => {
            const active = currentCity?.value === city.value;
            return (
              <button
                key={city.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => go(`/${city.value}`)}
                className={rowClass(active)}
              >
                <span>{city.labelJa}</span>
                <span className="text-[11px] text-[#a9a0bb]">{city.label}</span>
              </button>
            );
          })}

          <div className="my-1 border-t border-[#2a2438]" />

          <div className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wide text-[#7a728c]">
            New Zealand
          </div>
          {NZ_CITIES.map((city) => {
            const active = currentCity?.value === city.value;
            return (
              <button
                key={city.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => go(`/${city.value}`)}
                className={rowClass(active)}
              >
                <span>{city.labelJa}</span>
                <span className="text-[11px] text-[#a9a0bb]">{city.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

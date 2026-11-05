"use client";

import { useEffect, useRef } from "react";
import type { CategoryId, CategoryInfo } from "@/config/categories";

const tabCls = (on: boolean) =>
  `inline-flex min-h-11 shrink-0 snap-center items-center rounded-full border px-4 text-sm font-semibold transition ${
    on ? "border-accent bg-accent text-white" : "border-line bg-surface text-muted hover:border-accent hover:text-accent"
  }`;

interface Props {
  categories: CategoryInfo[];
  selected: CategoryId | "";
  counts: Map<CategoryId, number>;
  /** Jumlah untuk tab "Semua" (null = belum dimuat). */
  allCount: number | null;
  onSelect: (c: CategoryId | "") => void;
}

/**
 * Tab kategori. Di HP: satu baris yang bisa digeser dengan snap, pudar di tepi, tab aktif otomatis digulir ke tengah.
 * Di layar lebar (lg): membungkus ke beberapa baris agar semua kategori terlihat.
 */
export function CategoryTabs({ categories, selected, counts, allCount, onSelect }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = ref.current;
    const el = box?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!box || !el || box.scrollWidth <= box.clientWidth) return;
    box.scrollTo({ left: el.offsetLeft - (box.clientWidth - el.offsetWidth) / 2, behavior: "smooth" });
  }, [selected]);

  return (
    <div
      ref={ref}
      role="tablist"
      aria-label="Kategori proyek"
      className="relative -mx-4 mt-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 [mask-image:linear-gradient(to_right,transparent,#000_16px,#000_calc(100%-28px),transparent)] lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:[mask-image:none]"
    >
      <button role="tab" aria-selected={!selected} onClick={() => onSelect("")} className={tabCls(!selected)}>
        Semua {allCount !== null && <span className="ml-1 opacity-80">{allCount}</span>}
      </button>
      {categories.map((c) => (
        <button key={c.id} role="tab" aria-selected={selected === c.id} onClick={() => onSelect(c.id)} className={tabCls(selected === c.id)}>
          {c.label} <span className="ml-1 opacity-80">{counts.get(c.id) ?? 0}</span>
        </button>
      ))}
    </div>
  );
}

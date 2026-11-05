import type { CategoryId } from "@/lib/categories";

const PATHS: Record<CategoryId, React.ReactNode> = {
  boiler: (
    <>
      <rect x="6" y="24" width="28" height="16" rx="7" />
      <path d="M34 32h6M16 24v-9M12 15h8M28 24V10h5v14" />
    </>
  ),
  genset: (
    <>
      <rect x="6" y="20" width="36" height="18" rx="2" />
      <path d="M12 20v-6h8v6M28 20v-6h8v6M6 38v4M42 38v4" />
    </>
  ),
  water: (
    <>
      <path d="M24 6S12 20 12 29a12 12 0 0 0 24 0C36 20 24 6 24 6z" />
      <path d="M18 30a6 6 0 0 0 6 6" />
    </>
  ),
  piping: (
    <>
      <path d="M6 16h22a8 8 0 0 1 8 8v18" />
      <path d="M10 11v10M31 40h10" />
    </>
  ),
  relokasi: (
    <>
      <rect x="5" y="16" width="26" height="16" rx="1" />
      <path d="M31 21h7l5 6v5H31" />
      <circle cx="14" cy="36" r="4" />
      <circle cx="36" cy="36" r="4" />
    </>
  ),
  container: (
    <>
      <rect x="5" y="14" width="38" height="22" />
      <path d="M13 14v22M21 14v22M29 14v22M37 14v22" />
    </>
  ),
  "power-plant": (
    <>
      <rect x="5" y="26" width="26" height="14" />
      <path d="M11 26V12h5v14M22 26V8h5v18M33 40V30h9v10" />
    </>
  ),
  "electrical-work": <path d="M27 5 12 27h10l-3 16 17-24H26z" />,
  "civil-steel": <path d="M8 40V8h32v32M8 8l32 32M40 8 8 40" />,
  "fire-protection": <path d="M24 5c2 8 10 12 10 22a10 10 0 0 1-20 0c0-5 3-8 5-11 1 4 3 5 5 5 0-4-1-9 0-16z" />,
  "storage-tanks": (
    <>
      <ellipse cx="24" cy="12" rx="14" ry="5" />
      <path d="M10 12v24c0 3 6 6 14 6s14-3 14-6V12" />
    </>
  ),
  "industrial-maintenance": (
    <>
      <circle cx="24" cy="24" r="7" />
      <path d="M24 6v6M24 36v6M6 24h6M36 24h6M11 11l4 4M33 33l4 4M37 11l-4 4M15 33l-4 4" />
    </>
  ),
  "building-factory": (
    <>
      <path d="M5 40V24l9-8v8l9-8v8l9-8v24z" />
      <path d="M32 40h11V20h-5" />
    </>
  ),
};

/** Ikon garis sederhana per kategori, dipakai bila proyek belum punya foto. */
export function CategoryIcon({ category, className = "" }: { category: CategoryId; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      {PATHS[category]}
    </svg>
  );
}

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
};

/** Ikon garis sederhana per kategori, dipakai bila proyek belum punya foto. */
export function CategoryIcon({ category, className = "" }: { category: CategoryId; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      {PATHS[category]}
    </svg>
  );
}

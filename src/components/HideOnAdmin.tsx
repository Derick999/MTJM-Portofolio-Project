"use client";

import { usePathname } from "next/navigation";

/** Sembunyikan isi (server component sebagai children) di halaman admin. */
export function HideOnAdmin({ children }: { children: React.ReactNode }) {
  return usePathname().startsWith("/admin") ? null : <>{children}</>;
}

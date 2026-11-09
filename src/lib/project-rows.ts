import { legacyToServices } from "@/config/services";
import type { Project } from "./types";

/** Bentuk baris tabel projects + foto dari Supabase (select "*, project_photos(url, sort_order)"). */
export interface ProjectRow extends Omit<Project, "photos"> {
  project_photos: { url: string; sort_order: number }[] | null;
}

export const PROJECT_SELECT = "*, project_photos(url, sort_order)";

export function fromRow(r: ProjectRow): Project {
  const { project_photos, ...rest } = r;
  return {
    ...rest,
    // proyek yang belum di-backfill (migrasi 004 belum dijalankan) memakai tebakan dari category lama
    services: rest.services?.length ? rest.services : legacyToServices(rest.category, rest.name),
    photos: (project_photos ?? []).sort((a, b) => a.sort_order - b.sort_order).map((p) => p.url),
  };
}

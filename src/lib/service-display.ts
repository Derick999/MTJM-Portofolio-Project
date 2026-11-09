import { CATEGORY_MAP } from "@/config/categories";
import { GROUP_MAP, SERVICE_MAP, isService } from "@/config/services";
import type { Project } from "./types";

/** Label dan warna tampilan proyek: layanan utama + warna group-nya. Proyek tanpa layanan memakai kategori lama. */
export function projectLabelColor(p: Pick<Project, "services" | "category">): { label: string; color: string } {
  const main = p.services[0];
  if (isService(main)) return { label: SERVICE_MAP[main].label, color: GROUP_MAP[SERVICE_MAP[main].group].color };
  const c = CATEGORY_MAP[p.category];
  return { label: c.label, color: c.color };
}

/** Semua layanan proyek (utama dulu) sebagai teks, mis. "Piping System, HVAC". */
export const serviceLabels = (p: Pick<Project, "services">): string[] => p.services.filter(isService).map((s) => SERVICE_MAP[s].label);

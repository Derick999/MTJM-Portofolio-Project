export type CategoryId =
  | "boiler"
  | "genset"
  | "water"
  | "piping"
  | "relokasi"
  | "container";

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  short: string;
  color: string;
  blurb: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: "boiler",
    label: "Boiler",
    short: "Boiler",
    color: "#c2410c",
    blurb: "Instalasi dan pemasangan boiler beserta sistem steam dan feedwater.",
  },
  {
    id: "genset",
    label: "Gas Engine & Genset",
    short: "Genset",
    color: "#a16207",
    blurb: "Pembangkit berbahan bakar gas dan diesel: mesin, enclosure, dan balance of plant.",
  },
  {
    id: "water",
    label: "Water Treatment",
    short: "Water",
    color: "#0e7490",
    blurb: "Instalasi pengolahan air: tangki, pompa, dan jaringan pipa.",
  },
  {
    id: "piping",
    label: "Piping",
    short: "Piping",
    color: "#4d7c0f",
    blurb: "Fabrikasi dan instalasi pipa industri, pipeline, dan penyangga pipa.",
  },
  {
    id: "relokasi",
    label: "Relokasi (Jacking & Rolling)",
    short: "Relokasi",
    color: "#7e22ce",
    blurb: "Perpindahan peralatan berat dengan metode jacking dan rolling.",
  },
  {
    id: "container",
    label: "Container Modification",
    short: "Container",
    color: "#475569",
    blurb: "Modifikasi container menjadi control room, panel room, dan ruang kerja.",
  },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, CategoryInfo>;

export function isCategory(v: string | null | undefined): v is CategoryId {
  return !!v && v in CATEGORY_MAP;
}

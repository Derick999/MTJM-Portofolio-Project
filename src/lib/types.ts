import type { CategoryId } from "./categories";

export type StatusData = "published" | "draft";

export interface Project {
  id: string;
  slug: string;
  /** DEPRECATED: dipertahankan untuk kompatibilitas database; UI memakai `services`. */
  category: CategoryId;
  /** Slug layanan (src/config/services.ts); elemen pertama = layanan utama. */
  services: string[];
  name: string;
  client: string;
  year: number;
  province: string;
  city: string;
  lat: number;
  lng: number;
  description: string;
  scope: string;
  status_data: StatusData;
  admin_note: string;
  created_at: string;
  photos: string[];
}

/** Bentuk input form admin (tanpa kolom otomatis). */
export type ProjectInput = Omit<Project, "id" | "slug" | "created_at" | "photos">;

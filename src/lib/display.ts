import { SITE } from "@/config/site";
import { isGenericName } from "@/config/generic-names";
import type { Project } from "./types";

/** Kalimat catatan internal (data seed) yang tidak boleh tampil ke pengunjung. */
const INTERNAL_SENTENCE = /data contoh|lewat halaman admin/i;

/** Teks keterangan untuk pengunjung: kalimat internal dibuang. Kosong bila tidak ada isi sungguhan. */
export function publicText(text: string): string {
  return text
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim() && !INTERNAL_SENTENCE.test(s))
    .join(" ")
    .trim();
}

/** Gambar bawaan seed (/placeholder/*.svg) bukan foto proyek. */
export const isPlaceholderPhoto = (url: string) => url.startsWith("/placeholder/");

/** Foto asli proyek (tanpa placeholder). */
export const realPhotos = (p: Pick<Project, "photos">): string[] => p.photos.filter((u) => !isPlaceholderPhoto(u));

/** Satu baris klien untuk kartu: owner, bila kosong customer (lalu client lama). Kosong bila SITE.showClientNames dimatikan. */
export const publicClient = (p: Pick<Project, "client" | "owner" | "customer">): string => (SITE.showClientNames ? p.owner || p.customer || p.client : "");

/** Lokasi untuk tampilan: "Kota, Provinsi"; bila kota kosong (titik provinsi/pusat Jakarta) cukup provinsi. Tidak pernah berupa teks kosong atau koma menggantung. */
export const placeLabel = (p: Pick<Project, "city" | "province">): string => [p.city, p.province].filter(Boolean).join(", ");

/** Kota/wilayah pendek untuk label kecil: kota, bila kosong provinsi. */
export const placeShort = (p: Pick<Project, "city" | "province">): string => p.city || p.province;

/** Judul tampilan di kartu: nama generik (mis. "Building Renovation") diberi lokasi "<Nama> · <Kota>". Nama asli tetap di data. */
export const displayName = (p: Pick<Project, "name" | "city" | "province">): string => (isGenericName(p.name) && placeShort(p) ? `${p.name} · ${placeShort(p)}` : p.name);

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

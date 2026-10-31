import imageCompression from "browser-image-compression";

export const MIN_PHOTOS = 1;
export const MAX_PHOTOS = 5;
export const MAX_ORIGINAL_BYTES = 10 * 1024 * 1024;
export const TARGET_BYTES = 300 * 1024;

/** Cek file asli. Mengembalikan pesan error ramah, atau null jika lolos. */
export function checkOriginal(file: File): string | null {
  if (!file.type.startsWith("image/")) return `"${file.name}" bukan gambar. Pilih file foto (JPG, PNG, atau WebP).`;
  if (file.size > MAX_ORIGINAL_BYTES) {
    return `"${file.name}" terlalu besar (${(file.size / 1048576).toFixed(1)} MB). Maksimal 10 MB per foto.`;
  }
  return null;
}

/** Kompres di browser: sisi terpanjang maks 1280 px, WebP, di bawah 300 KB. */
export async function compressPhoto(file: File): Promise<File> {
  let quality = 0.82;
  let maxDim = 1280;
  let out: File = file;
  for (let i = 0; i < 5; i++) {
    out = await imageCompression(file, {
      maxWidthOrHeight: maxDim,
      fileType: "image/webp",
      initialQuality: quality,
      maxSizeMB: 0.29,
      useWebWorker: true,
    });
    if (out.size < TARGET_BYTES) break;
    quality -= 0.1;
    if (i >= 2) maxDim = Math.round(maxDim * 0.85);
  }
  if (out.size >= TARGET_BYTES) throw new Error(`Foto "${file.name}" tidak bisa dikecilkan di bawah 300 KB. Coba foto lain.`);
  const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return new File([out], name, { type: "image/webp" });
}

import fs from "node:fs";
import path from "node:path";
import { IMAGES, type SiteImage } from "@/config/images";
import type { GroupSlug } from "@/config/services";

// Sisi server saja (memakai fs). Satu-satunya pintu masuk gambar umum: hero dan kartu group.

const exists = (img: SiteImage) => fs.existsSync(path.join(process.cwd(), "public", img.src));

/** Gambar latar hero, atau undefined bila filenya belum ada. */
export const heroImage = (): SiteImage | undefined => IMAGES.find((i) => i.use === "hero" && exists(i));

/** Gambar latar kartu group, atau undefined bila filenya belum ada. */
export const groupCardImage = (group: GroupSlug): SiteImage | undefined =>
  IMAGES.find((i) => i.use === "group-card" && i.group === group && exists(i));

/** Foto placeholder yang sedang aktif (terdaftar dengan placeholder: true dan filenya ada). */
export const activePlaceholders = (): SiteImage[] => IMAGES.filter((i) => i.placeholder && exists(i));

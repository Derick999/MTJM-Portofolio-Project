// Menyiapkan foto proyek unggulan sebelum render: membaca public/photos/<featuredProject>/1.jpg..5.jpg,
// mengecilkan + mengompres, menulis ke public/photos-build/<slug>/ dan src/photosManifest.json.
// Tanpa foto -> manifest kosong, video memakai kartu tanpa foto (ikon kategori). Dijalankan otomatis oleh npm run render*.
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(root, "..", "package.json"));
const sharp = require("sharp");

const cfg = fs.readFileSync(path.join(root, "src/config.ts"), "utf8");
const slug = /featuredProject:\s*"([^"]+)"/.exec(cfg)?.[1];
const maxWidth = Number(/photoMaxWidth:\s*(\d+)/.exec(cfg)?.[1] ?? 1600);
const quality = Number(/photoQuality:\s*(\d+)/.exec(cfg)?.[1] ?? 80);
if (!slug) throw new Error("featuredProject tidak ditemukan di src/config.ts");

const srcDir = path.join(root, "public/photos", slug);
const outRoot = path.join(root, "public/photos-build");
fs.rmSync(outRoot, { recursive: true, force: true });
const found = [];
for (let n = 1; n <= 5; n++) {
  const f = ["jpg", "jpeg", "png", "webp"].map((e) => path.join(srcDir, `${n}.${e}`)).find((p) => fs.existsSync(p));
  if (!f) continue;
  fs.mkdirSync(path.join(outRoot, slug), { recursive: true });
  const out = path.join(outRoot, slug, `${n}.jpg`);
  await sharp(f).rotate().resize({ width: maxWidth, withoutEnlargement: true }).jpeg({ quality, mozjpeg: true }).toFile(out);
  found.push(n);
}
const audioFile = (name) => {
  const e = ["mp3", "wav", "m4a", "aac", "ogg"].find((x) => fs.existsSync(path.join(root, "public/audio", name + "." + x)));
  return e ? `/audio/${name}.${e}` : null;
};
const audio = { music: audioFile("music"), voiceover: audioFile("voiceover") };
fs.writeFileSync(path.join(root, "src/photosManifest.json"), JSON.stringify({ slug, files: found.map((n) => `/photos-build/${slug}/${n}.jpg`), audio }, null, 2) + "\n");
console.log(`Audio: music=${audio.music ?? "-"}, voiceover=${audio.voiceover ?? "-"}`);
console.log(found.length ? `Foto ${slug}: ${found.length} file diproses` : `Foto ${slug}: tidak ada (kartu tanpa foto dipakai)`);

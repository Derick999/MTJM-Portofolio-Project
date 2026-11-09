// Impor proyek dari data/seed/list-project-mtjm.csv: menggabungkan baris, mengklasifikasi layanan, memetakan lokasi, merapikan klien.
// Keluaran: data/seed/import-report.md, data/seed/import-preview.csv, dan supabase/seed/004_projects_import.sql (dijalankan PEMILIK DATA
// sendiri di SQL Editor). Skrip ini TIDAK menyentuh database. Jalankan: npm run import:projects
//
// Aturan kata kunci layanan: scripts/service-rules.ts. Aturan lokasi: scripts/location-rules.ts. Alias klien: src/config/client-aliases.ts.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { canonicalClient } from "../src/config/client-aliases.ts";
import { isGenericName } from "../src/config/generic-names.ts";
import { GROUP_MAP, SERVICES, SERVICE_MAP, type ServiceSlug } from "../src/config/services.ts";
import { nameOverride, resolveLocation, type Place } from "./location-rules.ts";
import { classify, RULES } from "./service-rules.ts";

const SRC = "data/seed/list-project-mtjm.csv";
const OUT_REPORT = "data/seed/import-report.md";
const OUT_PREVIEW = "data/seed/import-preview.csv";
const OUT_SQL = "supabase/seed/004_projects_import.sql";

// ---------------------------------------------------------------------------
// CSV (UTF-8, boleh ada BOM; tanda kutip ganda RFC 4180)
// ---------------------------------------------------------------------------
function parseCsv(text: string): string[][] {
  const t = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (quoted) {
      if (ch === '"') {
        if (t[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && t[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else cell += ch;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    if (row.some((c) => c.trim() !== "")) rows.push(row);
  }
  return rows;
}

const csvCell = (v: unknown) => {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const sql = (s: unknown) => `'${String(s ?? "").replace(/'/g, "''")}'`;

// ---------------------------------------------------------------------------
// Merapikan teks: Title Case (singkatan tetap kapital), PT / Tbk konsisten
// ---------------------------------------------------------------------------
const ACRONYMS = new Set(
  ("PT CV KSO PLN PLTU PLTD PLTG PLTMG CFPP WTP WWTP STP SPBU SPBE SPAM HDPE FRP LPG HVAC AHU TPH KVA MVA MW KW KV LPS KL MEE IWL RPET NTT DKI KPP BPPEI CKD CPI CNG HKBP DSSP PAM KMU KDS BSI NHM MIG XL DC PD IPA SMG WPS PQR MV LV MWM RPTRA DN PET KALTENG IT II III IV").split(" "),
);
const SMALL = new Set(["and", "of", "for", "to", "in", "at", "from", "di", "dan", "dengan", "pada", "the", "or"]);
/** Merek dengan huruf besar di tengah kata. */
const BRANDS: Record<string, string> = { MCDERMOTT: "McDermott" };

/**
 * Title Case. Teks HURUF BESAR semua: semua kata diubah (singkatan tetap kapital). Teks campuran: dipertahankan, kecuali kata
 * huruf besar sepanjang 4 huruf lebih yang bukan singkatan (mis. DIESES -> Dieses).
 */
function titleCase(input: string): string {
  const s = input.trim();
  const mixed = /[a-z]/.test(s);
  let first = true;
  return s.replace(/[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*/g, (w) => {
    const wasFirst = first;
    first = false;
    if (/\d/.test(w)) return w; // 66O, 5MW, KTA50G3, FP30 ...
    if (/^([A-Za-z]\.)+[A-Za-z]$/.test(w)) return w.toUpperCase(); // E.P.C
    const up = w.toUpperCase();
    if (ACRONYMS.has(up)) return up;
    if (up === "TBK") return "Tbk";
    if (BRANDS[up]) return BRANDS[up];
    if (mixed && !(w === up && w.length >= 4)) return w; // kata yang sudah berhuruf campuran / singkatan pendek: apa adanya
    const lower = w.toLowerCase();
    if (!wasFirst && SMALL.has(lower)) return lower;
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  });
}

function tidyText(s: string): string {
  return s
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:])/g, "$1")
    .replace(/\s*-\s*$/, "") // tanda hubung menggantung di akhir
    .replace(/(^|\s)-(?=\S)/g, "$1- ") // "-DURI" -> "- DURI"
    .trim();
}

const cleanName = (s: string) => titleCase(tidyText(s));

/** Nama perusahaan: PT / Tbk konsisten ("PT. X Tbk." -> "PT X Tbk"), Title Case. */
function cleanCompany(s: string): string {
  const t = tidyText(s)
    .replace(/\bPT\s*[.,]\s*/gi, "PT ")
    .replace(/\bPT\b(?!\s)/gi, "PT ")
    .replace(/\bTbk\.?/gi, "Tbk")
    .replace(/\s+/g, " ")
    .trim();
  return titleCase(t).replace(/\bPt\b/g, "PT");
}

const nk = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ---------------------------------------------------------------------------
// Baca baris
// ---------------------------------------------------------------------------
interface Row {
  no: number;
  desc: string;
  name: string;
  loc: string;
  owner: string;
  customer: string;
  year: number;
}

const table = parseCsv(readFileSync(SRC, "utf8"));
const header = table[0].map((h) => h.trim().toUpperCase());
const EXPECT = ["NO", "PROJECT DECRIPTION", "PROJECT NAME", "LOCATION", "OWNER", "CUSTOMER", "YEAR OF PROJECT"];
if (EXPECT.some((h, i) => header[i] !== h)) throw new Error(`Header CSV tidak sesuai harapan: ${header.join(" | ")}`);

const problems: string[] = [];
const rows: Row[] = [];
for (const r of table.slice(1)) {
  if (r.length !== 7) {
    problems.push(`Baris NO=${r[0]}: jumlah kolom ${r.length} (seharusnya 7)`);
    continue;
  }
  const year = Number(r[6].trim());
  if (!Number.isInteger(year)) problems.push(`Baris NO=${r[0]}: tahun tidak valid "${r[6]}"`);
  rows.push({ no: Number(r[0]), desc: r[1].trim(), name: r[2].trim(), loc: r[3].trim(), owner: r[4].trim(), customer: r[5].trim(), year });
}

// ---------------------------------------------------------------------------
// Gabungkan baris: (nama + lokasi + owner + tahun) sama setelah dinormalisasi
// ---------------------------------------------------------------------------
interface Group {
  key: string;
  rows: Row[];
}
const byKey = new Map<string, Group>();
for (const r of rows) {
  const key = [nk(r.name || r.desc), nk(r.loc), nk(r.owner), r.year].join("|");
  const g = byKey.get(key) ?? { key, rows: [] };
  g.rows.push(r);
  byKey.set(key, g);
}

// ---------------------------------------------------------------------------
// Olah tiap proyek
// ---------------------------------------------------------------------------
/** Proyek yang tetap draft sampai MTJM menjelaskan (keputusan pemilik data). */
const ASK_MTJM = /wps & pqr|^nhm p\d/i;

const clientMerges = new Map<string, Set<string>>(); // kanonik -> varian yang dipakai di data
function client(raw: string): string {
  if (!raw) return "";
  const cleaned = cleanCompany(raw);
  const canon = canonicalClient(cleaned);
  if (canon !== cleaned) clientMerges.set(canon, (clientMerges.get(canon) ?? new Set()).add(cleaned));
  return canon;
}

interface Out {
  sourceKey: string;
  slug: string;
  sourceRows: number[];
  name: string;
  scopes: string[];
  locRaw: string;
  place?: Place;
  owner: string;
  customer: string;
  year: number;
  services: ServiceSlug[];
  review: string[];
  published: boolean;
  description: string;
  adminNote: string;
  category: string;
  genericName: boolean;
  ask: boolean;
}

const usedSlugs = new Set<string>();
const projects: Out[] = [];
for (const g of byKey.values()) {
  const first = g.rows[0];
  const name = cleanName(first.name || first.desc);
  const review: string[] = [];
  const text = `${first.desc} ${first.name}`;
  const ask = ASK_MTJM.test(text);

  // layanan: gabungan semua baris. Urutan: rank aturan (objek kerja dulu), lalu jumlah baris pendukung, lalu urutan muncul.
  const tally = new Map<ServiceSlug, { n: number; rank: number; seen: number }>();
  let seen = 0;
  for (const r of g.rows) {
    const list = classify([r.desc, r.name]);
    if (list.length === 0 && !ask) review.push(`baris ${r.no}: tidak ada aturan layanan yang cocok ("${r.desc}" / "${r.name}")`);
    for (const s of list) {
      const t = tally.get(s) ?? { n: 0, rank: RULES.find((x) => x.service === s)!.rank, seen: seen++ };
      t.n++;
      tally.set(s, t);
    }
  }
  const services = [...tally.entries()].sort((a, b) => a[1].rank - b[1].rank || b[1].n - a[1].n || a[1].seen - b[1].seen).map(([s]) => s);
  if (ask) review.push("tanya MTJM: objek dan layanan tidak jelas dari CSV");

  // lokasi (koreksi berdasarkan nama proyek didahulukan)
  const byName = nameOverride(text);
  const loc = byName ? ({ ok: true, place: byName } as const) : resolveLocation(first.loc);
  if (!loc.ok) review.push(loc.reason);
  const place = loc.ok ? loc.place : undefined;

  const owner = client(first.owner);
  const customer = client(first.customer);
  const scopes = [...new Set(g.rows.map((r) => titleCase(tidyText(r.desc))).filter(Boolean))];

  const where = place ? (place.city ? `${place.city}, ${place.province}` : place.province) : "";
  const labels = services.slice(0, 3).map((s) => SERVICE_MAP[s].label).join(", ");
  const description = services.length && place ? `${labels} work ${place.city ? "at" : "in"} ${where} (${first.year})` : "";

  const notes: string[] = [];
  if (ask) notes.push("Tanya MTJM: objek dan layanan proyek belum jelas dari data sumber.");
  if (place?.how === "corrected") notes.push(`Lokasi dikoreksi dari CSV ("${first.loc}"): ${place.note}.`);
  if (place?.how === "approx" || place?.how === "province") notes.push(`Lokasi perkiraan ("${first.loc}"): ${place.note}.`);
  if (place?.confirm) notes.push(`${place.confirm}.`);
  if (!loc.ok) notes.push(`Lokasi belum dipetakan: "${first.loc}".`);

  const published = review.length === 0;
  const sourceKey = "csv-" + createHash("sha1").update(g.key).digest("hex").slice(0, 12);
  const placeSlug = slugify((place?.city || place?.province || first.loc).replace(/\s*\(.*\)/, ""));
  let slug = `${slugify(name).slice(0, 60).replace(/-+$/, "")}-${placeSlug}-${first.year}`;
  let n = 2;
  const base = slug;
  while (usedSlugs.has(slug)) slug = `${base}-${n++}`;
  usedSlugs.add(slug);

  projects.push({
    sourceKey,
    slug,
    sourceRows: g.rows.map((r) => r.no),
    name,
    scopes,
    locRaw: first.loc,
    place,
    owner,
    customer,
    year: first.year,
    services,
    review,
    published,
    description,
    adminNote: notes.join(" "),
    // kolom category (lama, NOT NULL + CHECK) diisi dari layanan primer; draft tanpa layanan memakai nilai netral
    category: services.length ? SERVICE_MAP[services[0]].legacyCategory : "industrial-maintenance",
    genericName: isGenericName(tidyText(first.name)),
    ask,
  });
}

// ---------------------------------------------------------------------------
// import-preview.csv
// ---------------------------------------------------------------------------
const cols = [
  "source_key", "source_rows", "slug", "name", "scope_raw", "location_raw", "city", "province", "lat", "lng", "location_precision", "location_note",
  "owner", "customer", "year", "primary_group", "primary_service", "services", "services_labels", "category", "needs_review", "review_reasons", "admin_note", "status", "description",
] as const;
const previewRows = projects.map((p) => {
  const primary = p.services[0];
  return {
    source_key: p.sourceKey,
    source_rows: p.sourceRows.join(" "),
    slug: p.slug,
    name: p.name,
    scope_raw: p.scopes.join(" | "),
    location_raw: p.locRaw,
    city: p.place?.city ?? "",
    province: p.place?.province ?? "",
    lat: p.place?.lat ?? "",
    lng: p.place?.lng ?? "",
    location_precision: p.place?.precision ?? "",
    location_note: p.place?.note ?? "",
    owner: p.owner,
    customer: p.customer,
    year: p.year,
    primary_group: primary ? GROUP_MAP[SERVICE_MAP[primary].group].label : "",
    primary_service: primary ?? "",
    services: p.services.join(";"),
    services_labels: p.services.map((s) => SERVICE_MAP[s].label).join("; "),
    category: p.category,
    needs_review: p.review.length > 0,
    review_reasons: p.review.join(" || "),
    admin_note: p.adminNote,
    status: p.published ? "published" : "draft",
    description: p.description,
  };
});
writeFileSync(OUT_PREVIEW, "﻿" + [cols.join(","), ...previewRows.map((r) => cols.map((c) => csvCell(r[c])).join(","))].join("\r\n") + "\r\n");

// ---------------------------------------------------------------------------
// supabase/seed/004_projects_import.sql
// ---------------------------------------------------------------------------
const importable = projects.filter((p) => p.place); // lokasi wajib (kolom lat/lng NOT NULL)
const skipped = projects.filter((p) => !p.place);
const tuple = (p: Out) => {
  const pl = p.place!;
  return `(${[
    sql(p.slug), sql(p.category), sql(p.name), sql(p.owner || p.customer), sql(p.owner), sql(p.customer), p.year, sql(pl.province), sql(pl.city), pl.lat, pl.lng,
    sql(pl.precision), sql(p.description), sql(p.scopes.join("; ")), sql(p.published ? "published" : "draft"), sql(p.adminNote),
    `'{${p.services.join(",")}}'::text[]`, sql(p.sourceKey), `'{${p.sourceRows.join(",")}}'::int[]`,
  ].join(", ")})`;
};
const values = importable
  .map((p, i) => {
    const comment = p.ask ? `  -- DRAFT, tanya MTJM: ${p.name} (baris CSV ${p.sourceRows.join(", ")})\n` : p.place?.confirm ? `  -- needs_confirm: ${p.place.confirm} (baris CSV ${p.sourceRows.join(", ")})\n` : !p.published ? `  -- DRAFT: ${p.review.join("; ")}\n` : "";
    return `${comment}  ${tuple(p)}${i < importable.length - 1 ? "," : ""}`;
  })
  .join("\n");
const mapping = SERVICES.map((s) => `    (${sql(s.slug)}, ${sql(GROUP_MAP[s.group].label)})`).join(",\n");

mkdirSync("supabase/seed", { recursive: true });
writeFileSync(
  OUT_SQL,
  `-- Impor proyek dari data/seed/list-project-mtjm.csv (dibuat otomatis oleh scripts/import-projects.ts; jangan diedit tangan).
-- ${importable.length} proyek unik (${importable.filter((p) => p.published).length} published, ${importable.filter((p) => !p.published).length} draft), dari ${rows.length} baris CSV.
--
-- URUTAN MENJALANKAN di Supabase (SQL Editor -> New query -> paste -> Run), satu per satu:
--   1. supabase/migrations/001_schema.sql
--   2. supabase/seed.sql                      (opsional: data contoh lama)
--   3. supabase/migrations/002_site_stats.sql
--   4. supabase/migrations/003_categories.sql
--   5. supabase/migrations/004_services.sql   (kolom services)
--   6. supabase/migrations/004a_project_import_columns.sql   (kolom owner, customer, location_precision, source_key, source_rows)
--   7. file ini (supabase/seed/004_projects_import.sql)
-- JANGAN jalankan supabase/seed_categories.sql bersama file ini: isinya proyek yang sama (diganti oleh impor ini).
--
-- CARA MENGULANG: aman dijalankan berulang. Baris dikenali lewat source_key (unik). Bila sudah ada, HANYA field yang berasal
-- dari CSV diperbarui (nama, owner, customer, tahun, lokasi, layanan, kategori, nomor baris sumber). TIDAK diubah: foto, deskripsi,
-- bagian pekerjaan (scope), catatan admin, status published/draft, dan slug (jadi suntingan admin tetap aman).
-- Untuk mengubah data hasil impor: ubah CSV/aturan lalu jalankan ulang "npm run import:projects", lalu jalankan file ini lagi.
${skipped.length ? `--\n-- TIDAK DIMASUKKAN (lokasi belum bisa dipetakan): ${skipped.map((p) => `${p.name} (baris ${p.sourceRows.join(", ")})`).join("; ")}\n` : ""}
insert into public.projects
  (slug, category, name, client, owner, customer, year, province, city, lat, lng, location_precision, description, scope, status_data, admin_note, services, source_key, source_rows)
values
${values}
on conflict (source_key) do update set
  category = excluded.category,
  name = excluded.name,
  client = excluded.client,
  owner = excluded.owner,
  customer = excluded.customer,
  year = excluded.year,
  province = excluded.province,
  city = excluded.city,
  lat = excluded.lat,
  lng = excluded.lng,
  location_precision = excluded.location_precision,
  services = excluded.services,
  source_rows = excluded.source_rows;

-- ===========================================================================
-- CARA VERIFIKASI (jalankan setelah impor; boleh dijalankan satu per satu)
-- ===========================================================================
-- 1) Jumlah proyek hasil impor, published vs draft:
--    select status_data, count(*) from public.projects where source_key like 'csv-%' group by 1;
--
-- 2) Proyek per group (berdasarkan layanan primer = elemen pertama services):
--    select m.grp, count(*) as proyek
--    from public.projects p
--    join (values
${mapping}
--    ) m(service, grp) on m.service = p.services[1]
--    where p.source_key like 'csv-%'
--    group by m.grp order by proyek desc;
--
-- 3) Proyek per provinsi:
--    select province, count(*) from public.projects where source_key like 'csv-%' group by 1 order by 2 desc;
--
-- 4) Proyek yang masih draft (perlu keputusan MTJM) beserta catatan:
--    select slug, name, admin_note from public.projects where source_key like 'csv-%' and status_data = 'draft' order by name;
--
-- 5) Lokasi perkiraan (titik provinsi / pusat kota):
--    select location_precision, count(*) from public.projects where source_key like 'csv-%' group by 1;
`,
);

// ---------------------------------------------------------------------------
// import-report.md
// ---------------------------------------------------------------------------
const count = <T,>(items: T[], key: (x: T) => string) => {
  const m = new Map<string, number>();
  for (const i of items) m.set(key(i), (m.get(key(i)) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
};
const table2 = (head: [string, string], list: [string, number][]) => `| ${head[0]} | ${head[1]} |\n|---|---:|\n${list.map(([k, v]) => `| ${k} | ${v} |`).join("\n")}\n`;

const reviewed = projects.filter((p) => p.review.length > 0);
const published = projects.filter((p) => p.published);
const merged = projects.filter((p) => p.sourceRows.length > 1);
const approx = projects.filter((p) => p.place?.precision === "city-approx");
const provinceOnly = projects.filter((p) => p.place?.precision === "province");
const corrected = projects.filter((p) => p.place?.how === "corrected");
const confirm = projects.filter((p) => p.place?.confirm);
const extras = projects.filter((p) => p.place?.how === "extra");
const aliased = projects.filter((p) => p.place?.how === "dataset" && p.place.note);

const owners = new Set(projects.map((p) => nk(p.owner)).filter(Boolean));
const customers = new Set(projects.map((p) => nk(p.customer)).filter(Boolean));
const allClients = new Set([...owners, ...customers]);
const provinces = new Set(projects.map((p) => p.place?.province).filter(Boolean));
const cities = new Set(projects.filter((p) => p.place?.city).map((p) => `${p.place!.province} / ${p.place!.city}`));

const groupPrimary = count(projects.filter((p) => p.services.length), (p) => GROUP_MAP[SERVICE_MAP[p.services[0]].group].label);
const groupAny = count(projects.flatMap((p) => [...new Set(p.services.map((s) => GROUP_MAP[SERVICE_MAP[s].group].label))]), (g) => g);
const servicePrimary = count(projects.filter((p) => p.services.length), (p) => SERVICE_MAP[p.services[0]].label);

const md: string[] = [];
md.push("# Laporan impor proyek (sudah memuat keputusan atas laporan tahap 1)\n");
md.push(`Sumber: \`${SRC}\`. Dibuat oleh \`npm run import:projects\`. Aturan: \`scripts/service-rules.ts\` (layanan), \`scripts/location-rules.ts\` (lokasi), \`src/config/client-aliases.ts\` (klien). SQL: \`${OUT_SQL}\`.\n`);
if (problems.length) md.push(`## Masalah baca CSV\n\n${problems.map((p) => `- ${p}`).join("\n")}\n`);
md.push("## Ringkasan\n");
md.push(`- Baris data CSV: **${rows.length}**`);
md.push(`- Proyek unik setelah penggabungan: **${projects.length}** (${rows.length - projects.length} baris digabung ke proyek lain)`);
md.push(`- Published: **${published.length}**`);
md.push(`- Draft (published=false): **${reviewed.length}**${reviewed.length ? " (tanya MTJM)" : ""}`);
md.push(`- Published dengan lokasi perlu konfirmasi (needs_confirm): **${confirm.length}**`);
md.push(`- Klien unik (setelah penggabungan alias): owner **${owners.size}**, customer **${customers.size}**, gabungan **${allClients.size}**`);
md.push(`- Lokasi unik: **${provinces.size}** provinsi, **${cities.size}** kota/kabupaten (di luar titik pusat Jakarta dan titik provinsi)`);
md.push(`- Dimasukkan ke SQL: **${importable.length}** proyek${skipped.length ? ` (${skipped.length} dilewati karena lokasi belum terpetakan)` : ""}\n`);

md.push("## Draft (tanya MTJM)\n");
md.push("Semua tetap draft dan diberi komentar `tanya MTJM` di SQL.\n");
md.push("| Baris CSV | Proyek | Lokasi (CSV) | Alasan |\n|---|---|---|---|");
for (const p of reviewed) md.push(`| ${p.sourceRows.join(", ")} | ${p.name} | ${p.locRaw} | ${p.review.join("; ").replace(/\|/g, "/")} |`);
md.push("");

md.push("## Keputusan yang diterapkan\n");
md.push("- Klasifikasi: Repair SPBU Shell Fatmawati = Annual Maintenance Periodic; Apartemen Regatta dan Solar Panel = Electrical for Building, Factory & Street Lighting; 4XKTA50G3 dan Siemens Energy JKT02 = Generator Set Power Plant; SMG = Boilers; Manifold = Piping System.");
md.push("- Objek kerja yang merupakan group utama (boiler, power plant, water treatment, tangki, dst) menjadi layanan primer; scope (piping, steel structure, electrical, jacking/rolling) menjadi layanan tambahan. Gas turbine bukan Gas Engine (Indorama: Boilers + Piping System).");
md.push("- Lokasi: Mentaya = Kalimantan Tengah (Kotawaringin Timur), titik provinsi, needs_confirm; Data Center Kuningan = Jakarta Selatan; Sembakung = Kab. Nunukan, Kalimantan Utara; tujuh koreksi otomatis tahap 1 disetujui.");
md.push("- \"JAKARTA\" saja = satu titik pusat Jakarta (Jakarta Pusat), `location_precision='city-approx'`, `city` kosong.");
md.push("- Judul tampilan di kartu untuk nama generik = \"<Nama> · <Kota>\" (nama asli tetap disimpan).\n");

md.push("## Jumlah per group layanan\n");
md.push("Menurut layanan primer (hanya proyek yang punya layanan):\n");
md.push(table2(["Group", "Proyek"], groupPrimary));
md.push("Menurut keanggotaan (proyek dihitung sekali di tiap group yang disentuh layanannya):\n");
md.push(table2(["Group", "Proyek"], groupAny));
md.push("Menurut sub-layanan primer:\n");
md.push(table2(["Sub-layanan", "Proyek"], servicePrimary));

md.push("## Jumlah per provinsi\n");
md.push(table2(["Provinsi", "Proyek"], count(projects.filter((p) => p.place), (p) => p.place!.province)));
md.push("## Jumlah per tahun\n");
md.push(table2(["Tahun", "Proyek"], count(projects, (p) => String(p.year)).sort((a, b) => Number(a[0]) - Number(b[0]))));

md.push("## Baris yang digabung\n");
md.push("Kombinasi (nama proyek + lokasi + owner + tahun) sama setelah dinormalisasi. Scope tiap baris masuk ke daftar layanan proyek.\n");
md.push("| Proyek | Baris CSV | Layanan hasil gabungan |\n|---|---|---|");
for (const p of merged) md.push(`| ${p.name} (${p.year}) | ${p.sourceRows.join(", ")} | ${p.services.map((s) => SERVICE_MAP[s].label).join("; ") || "-"} |`);
md.push("");

md.push("## Penggabungan nama klien (alias)\n");
md.push("Varian penulisan nama yang SAMA digabung (`src/config/client-aliases.ts`). Anak perusahaan/entitas berbeda tidak digabung.\n");
md.push("| Nama yang dipakai | Varian yang digabung |\n|---|---|");
for (const [c, v] of clientMerges) md.push(`| ${c} | ${[...v].sort().join("; ")} |`);
md.push(`\nKlien unik akhir: owner **${owners.size}**, customer **${customers.size}**, gabungan **${allClients.size}**.\n`);

md.push("## Lokasi dengan satu titik pusat Jakarta (city-approx)\n");
md.push("`location_precision='city-approx'`, `city` kosong, titik = Jakarta Pusat.\n");
md.push("| Proyek | Baris | Teks CSV |\n|---|---|---|");
for (const p of approx) md.push(`| ${p.name} | ${p.sourceRows.join(", ")} | ${p.locRaw} |`);
md.push("");

md.push("## Lokasi yang dipetakan ke titik provinsi (perkiraan)\n");
md.push("`location_precision='province'`, `city` kosong, titik = rata-rata kota di dataset.\n");
md.push("| Proyek | Baris | Teks CSV | Provinsi | Catatan |\n|---|---|---|---|---|");
for (const p of provinceOnly) md.push(`| ${p.name} | ${p.sourceRows.join(", ")} | ${p.locRaw} | ${p.place!.province} | ${p.place!.confirm ?? p.place!.note ?? ""} |`);
md.push("");

md.push("## Koreksi lokasi otomatis\n");
md.push("| Proyek | Baris | Teks CSV | Hasil | Alasan |\n|---|---|---|---|---|");
for (const p of corrected) md.push(`| ${p.name} | ${p.sourceRows.join(", ")} | ${p.locRaw} | ${p.place!.city}, ${p.place!.province} | ${p.place!.note} |`);
md.push("");

md.push("## Kota yang ditambahkan ke src/lib/indonesia.ts\n");
md.push("Agar admin bisa memilihnya di form. Koordinat perkiraan.\n");
const added = [...new Map([...extras, ...corrected].filter((p) => p.place && (p.place.how === "extra" || ["Kaimana", "Sanana (Kepulauan Sula)"].includes(p.place.city))).map((p) => [`${p.place!.province}|${p.place!.city}`, p.place!])).values()];
md.push("| Kota | Provinsi | Koordinat |\n|---|---|---|");
for (const e of added) md.push(`| ${e.city} | ${e.province} | ${e.lat}, ${e.lng} |`);
md.push("");

md.push("## Lokasi yang dipetakan lewat alias ke kota/kabupaten di dataset\n");
md.push("| Teks CSV | Hasil | Catatan |\n|---|---|---|");
for (const [k, p] of new Map(aliased.map((x) => [x.locRaw, x.place!]))) md.push(`| ${k} | ${p.city}, ${p.province} | ${p.note} |`);
md.push("");

md.push("## Nama proyek generik\n");
md.push("Nama asli disimpan. Di kartu, judul tampil \"<Nama> · <Kota>\" (daftar: `src/config/generic-names.ts`).\n");
md.push("| Nama | Baris | Lokasi | Owner |\n|---|---|---|---|");
for (const p of projects.filter((x) => x.genericName)) md.push(`| ${p.name} | ${p.sourceRows.join(", ")} | ${p.locRaw} | ${p.owner || p.customer} |`);
md.push("");

md.push("## Catatan metode\n");
md.push("- Scope generik tanpa kata kunci spesifik (\"ELECTRICAL WORK\", \"MECHANICAL & ELECTRICAL WORK\", \"E.P.C ...\", \"CIVIL, MECHANICAL & ELECTRICAL WORK\") tidak menentukan sub-layanan.");
md.push("- \"Dismantle gas engine\" masuk Gas Engine Power Plant; load bank masuk Generator Set; reverse osmosis dan IPA masuk Clean Water Treatment; civil work generik masuk Building.");
md.push("- Kolom `category` (lama) diisi dari layanan primer; draft tanpa layanan memakai `industrial-maintenance` sebagai nilai netral. Kolom `client` diisi owner (atau customer bila owner kosong).");
md.push("- Deskripsi memakai template netral \"<Layanan> work at <Kota>, <Provinsi> (<Tahun>)\" (\"in\" bila kota kosong); kosong untuk draft tanpa layanan.");
md.push("- `PT.` / `PT` / `Tbk.` diseragamkan menjadi `PT` dan `Tbk`; teks yang sudah campuran huruf besar/kecil dipertahankan.");
md.push("- Catatan di kolom `admin_note` (hanya terlihat di admin): koreksi lokasi, lokasi perkiraan, dan permintaan konfirmasi.\n");
writeFileSync(OUT_REPORT, md.join("\n") + "\n");

console.log(`Baris CSV: ${rows.length} -> proyek unik: ${projects.length} (published ${published.length}, draft ${reviewed.length})`);
console.log(`Ditulis: ${OUT_REPORT}, ${OUT_PREVIEW}, ${OUT_SQL}`);

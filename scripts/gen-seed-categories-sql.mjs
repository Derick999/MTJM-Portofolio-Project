// Membuat supabase/seed_categories.sql dari src/data/seed-categories.ts (seed kategori baru, terpisah dari seed lama).
// Jalankan: npm run seed:categories:sql
import { readFileSync, writeFileSync } from "node:fs";
import ts from "typescript";

const src = readFileSync("src/data/seed-categories.ts", "utf8");
const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const rows = mod.SEED_CATEGORIES.map(
  (p) =>
    `  (${q(p.slug)}, ${q(p.category)}, ${q(p.name)}, ${q(p.client)}, ${p.year}, ${q(p.province)}, ${q(p.city)}, ${p.lat}, ${p.lng}, ${q(p.description)}, ${q(p.scope)}, ${q(p.status_data)}, ${q(p.admin_note)})`,
);

const sql = `-- Data awal kategori baru MTJM (dibuat otomatis oleh scripts/gen-seed-categories-sql.mjs).
-- Jalankan SETELAH 003_categories.sql (kategori baru ditolak CHECK constraint sebelum itu). Aman dijalankan berulang:
-- slug yang sudah ada dilewati (on conflict do nothing). Draft = data perlu dicek; baru tampil publik bila diubah ke published di /admin.
insert into public.projects (slug, category, name, client, year, province, city, lat, lng, description, scope, status_data, admin_note) values
${rows.join(",\n")}
on conflict (slug) do nothing;
`;
writeFileSync("supabase/seed_categories.sql", sql);
const pub = mod.SEED_CATEGORIES.filter((p) => p.status_data === "published").length;
console.log(`supabase/seed_categories.sql: ${mod.SEED_CATEGORIES.length} proyek (${pub} published, ${mod.SEED_CATEGORIES.length - pub} draft)`);

// Membuat supabase/seed.sql dari src/data/seed.ts.
// Jalankan: npm run seed:sql
import { readFileSync, writeFileSync } from "node:fs";
import ts from "typescript";

const src = readFileSync("src/data/seed.ts", "utf8");
const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const rows = mod.SEED.map(
  (p) =>
    `  (${q(p.slug)}, ${q(p.category)}, ${q(p.name)}, ${q(p.client)}, ${p.year}, ${q(p.province)}, ${q(p.city)}, ${p.lat}, ${p.lng}, ${q(p.description)}, ${q(p.scope)}, ${q(p.status_data)}, ${q(p.admin_note)})`,
);

const photos = mod.SEED.map(
  (p) =>
    `insert into public.project_photos (project_id, url, sort_order)
select id, ${q(`/placeholder/${p.category}.svg`)}, 0 from public.projects where slug = ${q(p.slug)}
and not exists (select 1 from public.project_photos x where x.project_id = public.projects.id);`,
);

const sql = `-- Data awal MTJM (dibuat otomatis oleh scripts/gen-seed-sql.mjs). Jalankan setelah 001_schema.sql.
insert into public.projects (slug, category, name, client, year, province, city, lat, lng, description, scope, status_data, admin_note) values
${rows.join(",\n")}
on conflict (slug) do nothing;

-- Foto placeholder (ganti dengan foto asli lewat halaman admin).
${photos.join("\n")}
`;
writeFileSync("supabase/seed.sql", sql);
console.log(`supabase/seed.sql: ${mod.SEED.length} proyek`);

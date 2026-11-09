// ATURAN KATA KUNCI untuk memetakan teks CSV (kolom PROJECT DECRIPTION + PROJECT NAME) ke sub-layanan di src/config/services.ts.
// Satu file, mudah dibaca dan diubah. Tidak ada aturan yang cocok = needs_review (TIDAK menebak).
//
// Cara kerja: tiap baris diperiksa terhadap SEMUA aturan di kedua kolom teks (kolom bisa tertukar, jadi keduanya dipakai).
// Layanan yang cocok diurutkan menurut `rank`, lalu kolom (deskripsi dulu) dan posisi kata. Layanan pertama = primer.
//   rank 1 = OBJEK KERJA yang merupakan group utama (pembangkit, boiler, tangki, water treatment, container, gedung, mesin).
//            Objek kerja menjadi layanan primer.
//   rank 2 = pemindahan alat (jacking/rolling/lifting): tambahan bila objeknya sudah punya layanan rank 1.
//   rank 3 = scope pekerjaan (piping, steel structure, electrical, HVAC, fire, pompa): layanan tambahan.
// Scope generik tanpa kata kunci spesifik ("ELECTRICAL WORK", "MECHANICAL & ELECTRICAL WORK", "E.P.C ...", "CIVIL, MECHANICAL &
// ELECTRICAL WORK") SENGAJA tidak punya aturan: tidak menentukan sub-layanan.
import type { ServiceSlug } from "../src/config/services.ts";

export interface Rule {
  service: ServiceSlug;
  rank: 1 | 2 | 3;
  /** Kata kunci (tidak peka huruf besar/kecil). */
  patterns: RegExp[];
  /** Catatan untuk pembaca. */
  note?: string;
}

export const RULES: Rule[] = [
  // ---- rank 1: objek kerja
  // Power Plant. "Dismantle gas engine" cocok ke gas engine (tidak ada sub-layanan "dismantling" sendiri).
  // Gas turbine / PLTG BUKAN gas engine (keputusan): tidak ada aturannya.
  { service: "gas-engine-power-plant", rank: 1, patterns: [/pltmg/i, /gas engine/i, /bio ?gas/i] },
  { service: "generator-set-power-plant", rank: 1, patterns: [/pltd/i, /genset/i, /diesel engine/i, /\bdiesel\b/i, /dieses/i, /load ?bank/i, /kta ?\d/i, /siemens energy/i], note: "KTA = seri mesin (4XKTA50G3); Siemens Energy JKT02 = keputusan" },
  { service: "coal-fired-power-plant", rank: 1, patterns: [/pltu/i, /cfpp/i, /\bcoal\b/i] },
  // Storage Tank & Boilers
  { service: "boilers", rank: 1, patterns: [/boiler/i, /dea?rator/i, /economi[sz]er/i, /chimney/i, /\bsmg\b/i], note: "SMG = seri boiler (keputusan)" },
  { service: "filter-tank", rank: 1, patterns: [/tanki filter/i, /filter tank/i] },
  { service: "oil-water-tank", rank: 1, patterns: [/tanki(?! filter)/i, /(?<!filter )\btank\b/i, /reservoar/i] },
  // Water Treatment Plant
  { service: "clean-water-treatment", rank: 1, patterns: [/\bwtp\b/i, /water treatment/i, /reverse osmosis/i, /\bipa\b/i], note: "Reverse osmosis dan IPA masuk Clean Water Treatment" },
  { service: "sewage-treatment", rank: 1, patterns: [/\bstp\b/i, /sewage/i] },
  { service: "waste-water-treatment", rank: 1, patterns: [/\bwwtp\b/i, /waste ?water/i] },
  // Civil & Architecture
  { service: "container-modification", rank: 1, patterns: [/container modification/i, /containerized/i, /container control room/i, /container spare/i] },
  { service: "building", rank: 1, patterns: [/renovation/i, /renovasi/i, /rehabilitasi/i, /perbaikan (gudang|hotel|atap)/i, /civil work/i, /civil & architecture/i, /mining facility/i, /site office/i], note: "Civil work / civil & architecture generik masuk Building" },
  // Industrial & Factory
  { service: "custom-machine-installation", rank: 1, patterns: [/furnace/i, /painting shop/i, /spray booth/i, /assembly and erection/i, /filter press/i, /classifier/i] },
  { service: "annual-maintenance", rank: 1, patterns: [/repair spbu/i], note: "Repair SPBU Shell = Industrial Maintenance (keputusan)" },
  // Electrical untuk gedung (objek kerja: instalasi listrik gedung/apartemen/solar)
  { service: "building-factory-lighting", rank: 1, patterns: [/regatta/i, /solar/i, /lighting/i, /penerangan/i], note: "Regatta (apartemen) dan solar = Electrical for Building (keputusan)" },

  // ---- rank 2: pemindahan alat berat (group Relocation & Dismantling)
  { service: "jacking-rolling", rank: 2, patterns: [/jacking/i, /rolling/i, /skidding/i, /relocat/i, /relokasi/i] },
  { service: "lifting", rank: 2, patterns: [/lifting/i] },

  // ---- rank 3: scope pekerjaan
  { service: "piping-system", rank: 3, patterns: [/\bpip(e|ing|eline)\b/i, /\bpipa\b/i, /hdpe/i, /plumbing/i, /manifold/i], note: "Manifold = piping (keputusan)" },
  { service: "fire-fighting-protection", rank: 3, patterns: [/fire fighting/i, /fire alarm/i, /hydrant/i, /hidran/i] },
  { service: "hvac", rank: 3, patterns: [/hvac/i, /chiller/i, /\bahu\b/i] },
  { service: "pump-system", rank: 3, patterns: [/\bpump\b/i, /pompa/i] },
  { service: "steel-structure", rank: 3, patterns: [/steel structure/i, /racking/i, /structure baja/i, /struktur baja/i] },
  { service: "interior", rank: 3, patterns: [/interior/i] },
  // Electrical
  { service: "transmission-distribution", rank: 3, patterns: [/cable/i, /kabel/i, /terminasi/i, /termination/i, /bushing/i] },
  { service: "mv-lv-panel", rank: 3, patterns: [/cubicle/i, /(?<!solar )\bpanel\b/i] },
  { service: "instrument-control", rank: 3, patterns: [/instrument/i] },
];

export interface Match {
  service: ServiceSlug;
  rank: number;
  col: 0 | 1;
  pos: number;
}

/** Layanan yang cocok untuk satu baris, berurutan (primer dulu). `cols` = [kolom deskripsi, kolom nama]. */
export function classify(cols: [string, string]): ServiceSlug[] {
  const found = new Map<ServiceSlug, Match>();
  for (const rule of RULES) {
    for (let col = 0 as 0 | 1; col <= 1; col = (col + 1) as 0 | 1) {
      let best = -1;
      for (const re of rule.patterns) {
        const m = re.exec(cols[col]);
        if (m && (best < 0 || m.index < best)) best = m.index;
      }
      if (best < 0) continue;
      const prev = found.get(rule.service);
      if (!prev || col < prev.col || (col === prev.col && best < prev.pos)) found.set(rule.service, { service: rule.service, rank: rule.rank, col, pos: best });
      break; // kolom deskripsi diutamakan; cukup satu kecocokan per aturan
    }
  }
  return [...found.values()].sort((a, b) => a.rank - b.rank || a.col - b.col || a.pos - b.pos).map((m) => m.service);
}

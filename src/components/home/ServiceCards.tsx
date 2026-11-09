import Image from "next/image";
import Link from "next/link";
import { GROUPS, servicesOf, type GroupInfo, type GroupSlug } from "@/config/services";
import type { CategoryId } from "@/config/categories";
import type { GroupCover, HomeSummary } from "@/lib/home-server";
import { CategoryIcon } from "@/components/CategoryIcon";

// Ikon garis yang mewakili tiap group (dipakai bila tidak ada foto sama sekali).
const GROUP_ICON: Record<GroupSlug, CategoryId> = {
  "power-plant": "power-plant",
  mechanical: "piping",
  electrical: "electrical-work",
  "civil-architecture": "civil-steel",
  "water-treatment": "water",
  "storage-tank-boilers": "storage-tanks",
  "relocation-dismantling": "relokasi",
  "industrial-factory": "industrial-maintenance",
};

const SIZES = "(max-width: 559px) 100vw, 40vw";

/** Sisi foto (sekitar 40%): (a) foto proyek asli + keterangan nama (tautan ke drawer), (b) foto sementara tanpa keterangan, (c) panel pola warna group. */
function PhotoSide({ group, cover, fallback }: { group: GroupInfo; cover: GroupCover | undefined; fallback: string | undefined }) {
  const frame = "relative aspect-video min-[560px]:aspect-auto min-[560px]:w-[40%] min-[560px]:shrink-0";
  if (cover) {
    return (
      <div className={frame}>
        <Image src={cover.url} alt={cover.name} fill sizes={SIZES} className="object-cover" />
        <Link href={`/proyek?p=${cover.slug}`} className="absolute inset-0 flex items-end p-3" aria-label={`Lihat proyek ${cover.name}`}>
          <span className="max-w-full truncate rounded-full bg-navy/75 px-3 py-1 text-xs font-medium text-white">{cover.name}</span>
        </Link>
      </div>
    );
  }
  if (fallback) {
    return (
      <div className={frame}>
        <Image src={fallback} alt="" fill sizes={SIZES} className="object-cover" />
      </div>
    );
  }
  return (
    <div className={`${frame} overflow-hidden`} style={{ background: `linear-gradient(160deg, color-mix(in srgb, ${group.color} 35%, #ffffff) 0%, ${group.color} 100%)` }} aria-hidden>
      <svg className="absolute inset-0 h-full w-full text-white/25" aria-hidden>
        <defs>
          <pattern id={`dots-${group.slug}`} width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="7" cy="7" r="1.6" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#dots-${group.slug})`} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-white/90">
        <CategoryIcon category={GROUP_ICON[group.slug]} className="h-20 w-20" />
      </div>
    </div>
  );
}

/** Kartu group memanjang: sisi teks (sekitar 60%, panel warna group) dan sisi foto (sekitar 40%), bergantian kiri/kanan. Tanpa angka jumlah. */
function GroupCard({
  group,
  index,
  counts,
  cover,
  fallback,
}: {
  group: GroupInfo;
  index: number;
  counts: HomeSummary["counts"];
  cover: GroupCover | undefined;
  fallback: string | undefined;
}) {
  // Jumlah hanya dipakai untuk menyaring (sub-layanan tanpa proyek tidak tampil); tidak ditampilkan.
  const services = servicesOf(group.slug).filter((s) => !counts || (counts[s.slug] ?? 0) > 0);
  const idTitle = `grp-${group.slug}`;
  // Foto ada lebih dulu di DOM (banner di atas pada HP portrait). Baris: genap = foto kanan, ganjil = foto kiri.
  const dir = index % 2 === 0 ? "min-[560px]:flex-row-reverse" : "min-[560px]:flex-row";
  return (
    <article aria-labelledby={idTitle} className={`flex flex-col overflow-hidden rounded-2xl border border-line shadow-sm min-[560px]:min-h-[220px] ${dir}`}>
      <PhotoSide group={group} cover={cover} fallback={fallback} />
      <div
        className="on-navy flex flex-1 flex-col justify-center gap-3 p-4 text-white sm:p-6"
        style={{ background: `linear-gradient(135deg, ${group.color} 0%, color-mix(in srgb, ${group.color} 62%, #14144a) 100%)` }}
      >
        <div>
          <h3 id={idTitle} className="text-xl font-bold leading-snug">
            {group.label}
          </h3>
          <p className="mt-1 max-w-xl text-sm text-white/85">{group.blurb}</p>
        </div>
        {services.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label={`Layanan ${group.label}`}>
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/proyek?layanan=${s.slug}`} className="inline-flex min-h-11 items-center rounded-full border border-white/40 bg-white/10 px-4 text-sm font-medium hover:bg-white/25">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link href={`/proyek?layanan=${group.slug}`} className="btn btn-white self-start">
          Lihat proyek <span aria-hidden>&rarr;</span>
        </Link>
      </div>
    </article>
  );
}

/** Section "Layanan Kami": kartu group memanjang satu kolom. Tanpa peta, 3D, atau JavaScript klien. */
export function ServiceCards({ summary, groupFallback }: { summary: HomeSummary; groupFallback: Partial<Record<string, string>> }) {
  const visible = GROUPS.filter((g) => !summary.counts || (summary.counts[g.slug] ?? 0) > 0);
  return (
    <section id="layanan" aria-labelledby="judul-layanan" className="mx-auto mt-16 max-w-7xl px-4">
      <h2 id="judul-layanan" className="text-2xl font-bold sm:text-3xl">
        Layanan <span className="text-accent">Kami</span>
      </h2>
      <p className="mt-1 max-w-2xl text-sm text-muted">Pilih layanan untuk melihat lokasi proyeknya di peta, ilustrasi 3D, dan daftar proyek yang sudah kami kerjakan.</p>
      <div className="mt-6 flex flex-col gap-4">
        {visible.map((g, i) => (
          <GroupCard key={g.slug} group={g} index={i} counts={summary.counts} cover={summary.covers[g.slug]} fallback={groupFallback[g.slug]} />
        ))}
      </div>
    </section>
  );
}

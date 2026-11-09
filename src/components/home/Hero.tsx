import Image from "next/image";
import { SITE } from "@/config/site";
import { heroImage } from "@/lib/placeholders";
import { HeroLatest } from "./HeroLatest";
import { IndonesiaDots } from "./IndonesiaDots";

/**
 * Hero: headline besar, dua tombol pil, latar foto (public/placeholder/hero.jpg, lihat src/config/images.ts) dengan overlay navy;
 * tanpa foto: gradasi navy-biru + pola titik peta Indonesia. Tidak ada peta atau 3D di sini.
 */
export function Hero() {
  const { hero } = SITE;
  const bg = heroImage();
  return (
    <section className="on-navy relative overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-2 text-white">
      {bg ? (
        <>
          <Image src={bg.src} alt={bg.alt} fill priority sizes="100vw" quality={70} className="object-cover" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-navy/90 via-navy/80 to-navy-2/70" />
        </>
      ) : (
        <IndonesiaDots className="absolute inset-0 h-full w-full text-accent-2/25" />
      )}
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24 lg:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-2">{hero.eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">{hero.title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">{hero.text}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={hero.primary.href} className="btn btn-white !px-7 !py-3 text-base">
            {hero.primary.label}
          </a>
          <a href={SITE.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-white !px-7 !py-3 text-base">
            {SITE.mainSiteButton} <span aria-hidden>&#8599;</span>
          </a>
        </div>
      </div>
      <HeroLatest />
    </section>
  );
}

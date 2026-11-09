import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { SITE } from "@/config/site";
import { mainSiteHref } from "@/lib/links";

/**
 * Penutup halaman (menggantikan footer terpisah): logo, ajakan ke website utama, dan satu baris copyright.
 * Tautan unduh profil hanya tampil bila filenya ada di public/.
 */
export function CtaSection() {
  const { cta } = SITE;
  const hasProfile = fs.existsSync(path.join(process.cwd(), "public", cta.profileFile));
  return (
    <section aria-labelledby="judul-cta" className="on-navy mt-16 bg-navy text-center text-white">
      <div className="mx-auto max-w-2xl px-4 pb-10 pt-12">
        <span className="inline-block rounded-2xl bg-white px-5 py-3 shadow-lg">
          <Image src={SITE.logo.src} alt={SITE.name} width={SITE.logo.width} height={SITE.logo.height} quality={90} sizes="200px" className="h-12 w-auto" />
        </span>
        <h2 id="judul-cta" className="mt-6 text-2xl font-bold sm:text-3xl">
          {cta.title}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-white/80">{cta.text}</p>
        <a href={mainSiteHref("cta")} target="_blank" rel="noopener noreferrer" className="btn btn-white mt-6 !px-7 !py-3 text-base">
          {cta.button} <span aria-hidden>&#8599;</span>
        </a>
        {hasProfile && (
          <p className="mt-4">
            <a href={cta.profileFile} download className="text-sm text-white/85 underline underline-offset-4 hover:text-accent-2">
              {cta.profileLabel}
            </a>
          </p>
        )}
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs text-white/60" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
        &copy; {new Date().getFullYear()} {SITE.name}
      </p>
    </section>
  );
}

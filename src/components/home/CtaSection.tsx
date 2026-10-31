import fs from "node:fs";
import path from "node:path";
import { SITE } from "@/config/site";

/** Ajakan ke website utama. Tautan unduh profil hanya tampil bila filenya ada di public/. */
export function CtaSection() {
  const { cta } = SITE;
  const hasProfile = fs.existsSync(path.join(process.cwd(), "public", cta.profileFile));
  return (
    <section aria-labelledby="judul-cta" className="on-navy mt-16 bg-navy px-4 py-14 text-center text-white">
      <div className="mx-auto max-w-2xl">
        <h2 id="judul-cta" className="text-2xl font-bold sm:text-3xl">
          {cta.title}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-white/80">{cta.text}</p>
        <a href={SITE.url} target="_blank" rel="noopener noreferrer" className="btn btn-white mt-6 !px-7 !py-3 text-base">
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
    </section>
  );
}

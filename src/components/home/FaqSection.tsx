"use client";

import { useId, useState } from "react";
import { FAQ, FAQ_CONTACT_LABEL, FAQ_MORE_LABEL, FAQ_TITLE } from "@/config/faq";
import { SITE } from "@/config/site";
import { mainSiteHref } from "@/lib/links";

/** FAQ: accordion aksesibel (tombol dengan aria-expanded, satu terbuka pada satu waktu) + data terstruktur FAQPage. */
export function FaqSection() {
  const base = useId();
  const [open, setOpen] = useState<number | null>(null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: `${f.a} ${FAQ_MORE_LABEL}: ${mainSiteHref("faq")}` },
    })),
  };

  return (
    <section id="faq" aria-labelledby="judul-faq" className="mx-auto mt-16 max-w-3xl px-4">
      <h2 id="judul-faq" className="text-2xl font-bold sm:text-3xl">
        {FAQ_TITLE}
      </h2>
      <ul className="mt-5 divide-y divide-line rounded-2xl border border-line bg-surface shadow-sm">
        {FAQ.map((f, i) => {
          const isOpen = open === i;
          return (
            <li key={f.q}>
              <h3>
                <button
                  type="button"
                  id={`${base}-q${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`${base}-a${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex min-h-14 w-full items-center justify-between gap-4 px-4 py-3 text-left text-base font-semibold hover:text-accent sm:px-5"
                >
                  <span>{f.q}</span>
                  <span aria-hidden className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-lg leading-none transition ${isOpen ? "rotate-45 border-accent text-accent" : ""}`}>
                    +
                  </span>
                </button>
              </h3>
              <div id={`${base}-a${i}`} role="region" aria-labelledby={`${base}-q${i}`} hidden={!isOpen} className="px-4 pb-4 text-sm leading-relaxed text-muted sm:px-5 sm:text-base">
                <p>{f.a}</p>
                {f.contact && (
                  <a href={mainSiteHref("faq", SITE.contactUrl)} target="_blank" rel="noopener noreferrer" className="mr-4 mt-2 inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-2 hover:text-navy">
                    {FAQ_CONTACT_LABEL} <span aria-hidden className="ml-1">&#8599;</span>
                  </a>
                )}
                <a href={mainSiteHref("faq")} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-2 hover:text-navy">
                  {FAQ_MORE_LABEL} <span aria-hidden className="ml-1">&#8599;</span>
                </a>
              </div>
            </li>
          );
        })}
      </ul>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}

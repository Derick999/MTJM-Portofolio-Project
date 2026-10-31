"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { SITE } from "@/config/site";

export function SiteFooter() {
  const path = usePathname();
  if (path.startsWith("/admin")) return null;
  const link = "inline-flex min-h-11 items-center text-white underline-offset-4 hover:text-accent-2 hover:underline";
  return (
    <footer id="hubungi" className="on-navy bg-navy text-white/80">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 text-sm sm:grid-cols-2">
        <div>
          <span className="inline-block rounded-lg bg-white px-3 py-2">
            <Image src={SITE.logo.src} alt={SITE.name} width={SITE.logo.width} height={SITE.logo.height} quality={90} sizes="176px" className="h-11 w-auto" />
          </span>
          <p className="mt-3 max-w-md leading-relaxed">{SITE.tagline}</p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Hubungi Kami</h2>
          <ul className="mt-2 space-y-0.5">
            {SITE.address && <li>{SITE.address}</li>}
            {SITE.phone && (
              <li>
                Telp: <a className={link} href={`tel:${SITE.phone.replace(/\s/g, "")}`}>{SITE.phone}</a>
              </li>
            )}
            {SITE.email && (
              <li>
                Email: <a className={link} href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </li>
            )}
            <li>
              <a className="inline-flex min-h-11 items-center font-semibold text-accent-2 hover:underline" href={SITE.url} target="_blank" rel="noopener noreferrer">
                {SITE.moreInfoLabel} &rarr;
              </a>
            </li>
          </ul>
        </div>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        &copy; {new Date().getFullYear()} {SITE.name}
      </p>
    </footer>
  );
}

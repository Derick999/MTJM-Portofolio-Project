"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/config/site";

/** Section di beranda yang punya menu sendiri, urut dari atas ke bawah. */
const HOME_SECTIONS = [
  { href: "/#layanan", id: "layanan" },
  { href: "/#faq", id: "faq" },
];

/** Menu beranda yang sedang terlihat, berdasarkan posisi scroll. */
function homeSection(): string {
  let current = "/";
  for (const s of HOME_SECTIONS) {
    const el = document.getElementById(s.id);
    if (el && el.getBoundingClientRect().top <= 140) current = s.href;
  }
  return current;
}

/** Menu aktif: mengikuti route; di beranda mengikuti section yang terlihat, dan detail proyek menandai "Layanan". */
function useActiveNav(path: string) {
  const [section, setSection] = useState("/");
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    if (path !== "/") return;
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setSection(homeSection()));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [path]);

  useEffect(() => {
    const onDetail = (e: Event) => setDetailOpen(Boolean((e as CustomEvent<boolean>).detail));
    window.addEventListener("mtjm:detail", onDetail);
    return () => window.removeEventListener("mtjm:detail", onDetail);
  }, []);

  return (href: string) => {
    const [hrefPath] = href.split("#");
    if (path !== "/") return hrefPath !== "/" && path.startsWith(hrefPath);
    return (detailOpen ? "/#layanan" : section) === href;
  };
}

/** Label dengan ruang untuk versi tebal, supaya lebar menu tidak bergeser saat jadi aktif. */
function NavLabel({ children }: { children: string }) {
  return (
    <span className="inline-grid">
      <span aria-hidden className="invisible col-start-1 row-start-1 font-bold">
        {children}
      </span>
      <span className="col-start-1 row-start-1 text-center">{children}</span>
    </span>
  );
}

export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = useActiveNav(path);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (path.startsWith("/admin")) return null;

  const linkCls = (active: boolean) =>
    `inline-flex min-h-11 items-center rounded-full px-4 text-sm text-navy transition-colors hover:bg-nav-hover ${
      active ? "bg-nav-active font-bold hover:bg-nav-active" : "font-medium"
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white text-navy shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
        <Link href="/" className="inline-flex min-h-11 shrink-0 items-center rounded-md" aria-label={`${SITE.short} - beranda`}>
          <Image src={SITE.logo.src} alt={SITE.name} width={SITE.logo.width} height={SITE.logo.height} quality={90} priority sizes="132px" className="h-10 w-auto" />
        </Link>

        <nav aria-label="Menu utama" className="hidden items-center gap-1 md:flex">
          {SITE.nav.map((n) => {
            const active = isActive(n.href);
            return (
              <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} className={linkCls(active)}>
                <NavLabel>{n.label}</NavLabel>
              </Link>
            );
          })}
          <a href={SITE.url} target="_blank" rel="noopener noreferrer" className="btn btn-navy-outline ml-2 min-h-11">
            {SITE.mainSiteButton} <span aria-hidden>&#8599;</span>
          </a>
        </nav>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border border-navy/30 hover:bg-nav-hover md:hidden"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          aria-controls="menu-mobile"
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden className="relative block h-3.5 w-5">
            <span className={`absolute left-0 h-0.5 w-5 rounded bg-navy transition ${open ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 top-1.5 h-0.5 w-5 rounded bg-navy transition ${open ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 h-0.5 w-5 rounded bg-navy transition ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
        </button>
      </div>

      {open && (
        <nav id="menu-mobile" aria-label="Menu utama (HP)" className="border-t border-line bg-white px-4 pb-4 pt-2 md:hidden">
          <ul className="space-y-1">
            {SITE.nav.map((n) => {
              const active = isActive(n.href);
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`block min-h-11 rounded-full px-4 py-3 text-base text-navy hover:bg-nav-hover ${active ? "bg-nav-active font-bold hover:bg-nav-active" : "font-medium"}`}
                  >
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <a href={SITE.url} target="_blank" rel="noopener noreferrer" className="btn btn-navy-outline mt-3 min-h-11 w-full">
            {SITE.mainSiteButton} <span aria-hidden>&#8599;</span>
          </a>
        </nav>
      )}
    </header>
  );
}

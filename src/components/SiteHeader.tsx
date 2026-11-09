"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/config/site";
import { mainSiteHref } from "@/lib/links";

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

/** Menu aktif: mengikuti route; di beranda mengikuti section yang terlihat. */
function useActiveNav(path: string) {
  const [section, setSection] = useState("/");

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

  return (href: string) => {
    const [hrefPath] = href.split("#");
    if (path !== "/") return hrefPath !== "/" && path.startsWith(hrefPath);
    return section === href;
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
  const isActive = useActiveNav(path);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [short, setShort] = useState(false); // viewport pendek (HP landscape)
  const [hidden, setHidden] = useState(false);
  const menuRef = useRef(menuOpen);
  useEffect(() => {
    menuRef.current = menuOpen;
  });

  // pindah route: tutup menu
  useEffect(() => {
    setMenuOpen(false);
  }, [path]);

  // Sticky: mengecil + bayangan setelah menggulir; di viewport pendek bersembunyi saat menggulir turun, muncul saat menggulir naik.
  useEffect(() => {
    const mq = window.matchMedia("(max-height: 500px)");
    const sync = () => setShort(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      if (mq.matches && !menuRef.current) {
        if (y > last + 4 && y > 80) setHidden(true);
        else if (y < last - 4) setHidden(false);
      } else setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      mq.removeEventListener("change", sync);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Tinggi navbar -> variabel CSS untuk scroll-margin anchor (#layanan, #faq)
  const barH = short ? 48 : scrolled ? 56 : 64;
  useEffect(() => {
    document.documentElement.style.setProperty("--header-h", `${barH}px`);
  }, [barH]);

  // Menu HP: Esc menutup
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  if (path.startsWith("/admin")) return null;

  const linkCls = (active: boolean) =>
    `inline-flex min-h-11 items-center rounded-full px-4 text-sm text-navy transition-colors hover:bg-nav-hover ${
      active ? "bg-nav-active font-bold hover:bg-nav-active" : "font-medium"
    }`;
  const mainHref = mainSiteHref("nav");

  return (
    <header
      className={`sticky top-0 z-30 border-b border-line bg-white text-navy transition-[transform,box-shadow] duration-200 motion-reduce:transition-none ${scrolled ? "shadow-md" : "shadow-sm"}`}
      style={{ transform: hidden ? "translateY(-100%)" : undefined, paddingTop: "env(safe-area-inset-top)" }}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between gap-3 transition-[height] motion-reduce:transition-none ${short ? "h-12" : scrolled ? "h-14" : "h-16"}`}
        style={{ paddingLeft: "max(1rem, env(safe-area-inset-left))", paddingRight: "max(1rem, env(safe-area-inset-right))" }}
      >
        <Link href="/" className="inline-flex min-h-11 shrink-0 items-center rounded-md" aria-label={`${SITE.short} - beranda`}>
          <Image src={SITE.logo.src} alt={SITE.name} width={SITE.logo.width} height={SITE.logo.height} quality={90} priority sizes="132px" className={`w-auto transition-[height] motion-reduce:transition-none ${short ? "h-7" : scrolled ? "h-9" : "h-10"}`} />
        </Link>

        <nav aria-label="Menu utama" className="hidden items-center gap-1 lg:flex">
          {SITE.nav.map((n) => (
            <Link key={n.href} href={n.href} aria-current={isActive(n.href) ? "page" : undefined} className={linkCls(isActive(n.href))}>
              <NavLabel>{n.label}</NavLabel>
            </Link>
          ))}
          {/* dibungkus: kelas .btn (display:inline-flex) mengalahkan utilitas hidden */}
          <div className="ml-2">
            <a href={mainHref} target="_blank" rel="noopener noreferrer" className="btn btn-navy-outline min-h-11">
              {SITE.mainSiteButton} <span aria-hidden>&#8599;</span>
            </a>
          </div>
        </nav>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border border-navy/30 hover:bg-nav-hover lg:hidden"
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={menuOpen}
          aria-controls="menu-mobile"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span aria-hidden className="relative block h-3.5 w-5">
            <span className={`absolute left-0 h-0.5 w-5 rounded bg-navy transition ${menuOpen ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 top-1.5 h-0.5 w-5 rounded bg-navy transition ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 h-0.5 w-5 rounded bg-navy transition ${menuOpen ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
        </button>
      </div>

      {menuOpen && (
        <nav
          id="menu-mobile"
          aria-label="Menu utama (HP)"
          className="max-h-[calc(100dvh-var(--header-h,4rem))] overflow-y-auto border-t border-line bg-white pb-4 pt-2 lg:hidden"
          style={{ paddingLeft: "max(1rem, env(safe-area-inset-left))", paddingRight: "max(1rem, env(safe-area-inset-right))" }}
        >
          <ul className="grid gap-x-4 gap-y-1 min-[560px]:grid-cols-2">
            {SITE.nav.map((n) => {
              const active = isActive(n.href);
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className={`flex min-h-11 w-full items-center rounded-full px-4 py-2 text-base text-navy hover:bg-nav-hover ${active ? "bg-nav-active font-bold hover:bg-nav-active" : "font-medium"}`}
                  >
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <a href={mainHref} target="_blank" rel="noopener noreferrer" className="btn btn-navy-outline mt-3 min-h-11 w-full">
            {SITE.mainSiteButton} <span aria-hidden>&#8599;</span>
          </a>
        </nav>
      )}
    </header>
  );
}

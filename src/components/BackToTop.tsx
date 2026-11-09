"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SITE } from "@/config/site";

/** Tombol kembali ke atas: muncul setelah menggulir sekitar 600 px, di pojok kanan bawah (menghormati safe-area). */
export function BackToTop() {
  const [show, setShow] = useState(false);
  const path = usePathname();

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show || path.startsWith("/admin")) return null;
  return (
    <button
      type="button"
      aria-label={SITE.backToTop}
      title={SITE.backToTop}
      onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
      className="fixed z-20 grid h-11 w-11 place-items-center rounded-full border border-line bg-white/95 text-navy shadow-lg hover:border-accent hover:text-accent"
      style={{ right: "max(1rem, env(safe-area-inset-right))", bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <svg aria-hidden viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 12 5-5 5 5" />
      </svg>
    </button>
  );
}

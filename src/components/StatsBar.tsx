"use client";

import { useEffect, useRef, useState } from "react";
import { SITE } from "@/config/site";
import { useSiteStats, type SiteStat } from "@/lib/stats";

const DURATION = 1600;
const format = (n: number) => `${n.toLocaleString("id-ID")}+`;

/**
 * Hitung naik dari 0 ke `to` saat terlihat di layar. Sebelum siap (HTML awal / data belum datang) tampil
 * skeleton dengan lebar yang sama, jadi tidak ada kilatan "0+". Tanpa animasi bila gerak dikurangi.
 */
function Counter({ to, loading }: { to: number; loading: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(false);
  const [seen, setSeen] = useState(false);
  const [n, setN] = useState(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !mounted || loading) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mounted, loading]);

  useEffect(() => {
    if (!seen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(to);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - t0) / DURATION));
      setN(Math.min(to, Math.max(0, Math.round(to * (1 - Math.pow(1 - p, 3))))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to]);

  const ready = mounted && !loading && seen;
  return (
    <span ref={ref} className="relative inline-block" aria-label={`${to}+`} aria-busy={!ready}>
      {/* Angka akhir tak terlihat menjaga lebar tetap, sehingga layout tidak bergeser. */}
      <span aria-hidden className={ready ? undefined : "invisible"}>
        {ready ? format(n) : format(to)}
      </span>
      {!ready && <span aria-hidden className="skeleton absolute inset-x-1 inset-y-2 rounded-lg" />}
    </span>
  );
}

export function StatsBar({ initial, serverOk }: { initial?: SiteStat[]; serverOk?: boolean }) {
  const { stats, loading } = useSiteStats(initial, serverOk);
  const { headline } = SITE.statsBlock;
  return (
    <section aria-label="Angka perusahaan" className="mx-auto mt-12 max-w-7xl px-4">
      <h2 className="text-2xl font-bold leading-tight sm:text-3xl">{headline}</h2>
      <dl className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">
        {stats.map((s) => (
          <div key={s.key} className="flex flex-col rounded-2xl border border-line bg-surface px-2 py-4 text-center shadow-sm sm:px-6 sm:py-6">
            <dt className="order-2 mt-1 text-xs font-medium leading-tight text-muted sm:text-base">{s.label}</dt>
            <dd className="text-3xl font-bold text-accent sm:text-5xl">
              <Counter to={s.value} loading={loading} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

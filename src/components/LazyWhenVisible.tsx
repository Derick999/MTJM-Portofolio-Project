"use client";

import { useEffect, useRef, useState } from "react";

/** Render `children` baru setelah area ini mendekati layar (peta dan 3D tidak memblokir render awal). Sekali tampil, tetap tampil. */
export function LazyWhenVisible({ children, fallback, rootMargin = "300px", className }: { children: React.ReactNode; fallback?: React.ReactNode; rootMargin?: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    if (typeof IntersectionObserver === "undefined") return setVisible(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {visible ? children : fallback}
    </div>
  );
}

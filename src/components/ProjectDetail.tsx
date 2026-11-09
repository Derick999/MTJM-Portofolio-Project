"use client";

import { useEffect, useId, useRef, useState } from "react";
import { publicClient, publicText, realPhotos } from "@/lib/display";
import { projectLabelColor, serviceLabels } from "@/lib/service-display";
import { SITE } from "@/config/site";
import { mainSiteHref } from "@/lib/links";
import type { Project } from "@/lib/types";
import { CategoryIcon } from "./CategoryIcon";
import { ProjectPhoto } from "./ProjectPhoto";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ProjectDetail({ project, onClose }: { project: Project; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  const cat = projectLabelColor(project);
  const layanan = serviceLabels(project);
  const photos = realPhotos(project);
  const description = publicText(project.description);
  const scope = publicText(project.scope);

  // Focus trap: Tab berputar di dalam dialog; saat ditutup, fokus kembali ke elemen yang membukanya.
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onCloseRef.current();
      if (e.key !== "Tab") return;
      const dialog = dialogRef.current;
      const nodes = dialog?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!dialog || !nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (!dialog.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      if (trigger && trigger !== document.body && trigger.isConnected) trigger.focus();
    };
  }, []);

  const rows: [string, string][] = [
    ["Klien", publicClient(project)],
    ["Tahun", String(project.year)],
    ["Lokasi", `${project.city}, ${project.province}`],
    [layanan.length > 1 ? "Layanan" : "Layanan", layanan.length ? layanan.join(", ") : cat.label],
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-navy/60 sm:items-stretch sm:justify-end" onClick={onClose}>
      <aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border-t border-line bg-bg sm:max-h-none sm:max-w-xl sm:rounded-none sm:border-l sm:border-t-0"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line p-4">
          <div className="flex min-w-0 items-start gap-3">
            {photos.length === 0 && (
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg" style={{ color: cat.color, background: `${cat.color}1a` }}>
                <CategoryIcon category={project.category} className="h-8 w-8" />
              </span>
            )}
            <div className="min-w-0">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: cat.color }}>
                {cat.label}
              </span>
              <h2 id={titleId} className="font-display text-2xl font-bold leading-tight">
                {project.name}
              </h2>
            </div>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Tutup detail"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line text-2xl leading-none hover:border-accent"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {photos.length > 0 && (
            <div>
              <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-surface-2">
                <ProjectPhoto src={photos[idx] ?? photos[0]} alt={`Foto ${idx + 1} proyek ${project.name}`} sizes="(max-width: 640px) 100vw, 576px" priority />
              </div>
              {photos.length > 1 && (
                <ul className="mt-2 flex gap-2 overflow-x-auto pb-1" aria-label="Pilih foto">
                  {photos.map((src, i) => (
                    <li key={src}>
                      <button
                        onClick={() => setIdx(i)}
                        aria-label={`Foto ${i + 1}`}
                        aria-current={i === idx}
                        className={`relative block h-14 w-20 overflow-hidden rounded border-2 ${i === idx ? "border-accent" : "border-transparent opacity-70"}`}
                      >
                        <ProjectPhoto src={src} alt="" sizes="80px" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <dl className="grid grid-cols-2 gap-3 text-sm">
            {rows
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="rounded border border-line bg-surface p-2">
                  <dt className="text-xs text-muted">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
          </dl>

          {description && (
            <section>
              <h3 className="font-display text-lg font-bold text-accent">Keterangan</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink/90">{description}</p>
            </section>
          )}
          {scope && (
            <section>
              <h3 className="font-display text-lg font-bold text-accent">Bagian pekerjaan</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink/90">{scope}</p>
            </section>
          )}
          <a
            href={mainSiteHref("proyek")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            {SITE.moreInfoLabel} &rarr;
          </a>
        </div>
      </aside>
    </div>
  );
}

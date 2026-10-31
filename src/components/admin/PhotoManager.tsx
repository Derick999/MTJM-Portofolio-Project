"use client";

import { useRef, useState } from "react";
import { checkOriginal, MAX_PHOTOS } from "@/lib/photos";

/** Satu foto di daftar: sudah tersimpan (url) atau baru dipilih (file). */
export interface PhotoItem {
  key: string;
  url: string; // URL tersimpan atau object URL untuk preview
  file?: File;
}

interface Props {
  items: PhotoItem[];
  onChange: (items: PhotoItem[]) => void;
}

export function PhotoManager({ items, onChange }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const add = (files: FileList | null) => {
    if (!files) return;
    const errs: string[] = [];
    const next = [...items];
    for (const f of Array.from(files)) {
      if (next.length >= MAX_PHOTOS) {
        errs.push(`Maksimal ${MAX_PHOTOS} foto per proyek. Foto lainnya tidak ditambahkan.`);
        break;
      }
      const bad = checkOriginal(f);
      if (bad) errs.push(bad);
      else next.push({ key: `${f.name}-${f.size}-${Math.random()}`, url: URL.createObjectURL(f), file: f });
    }
    setErrors(errs);
    onChange(next);
    if (input.current) input.current.value = "";
  };

  const move = (i: number, d: -1 | 1) => {
    const next = [...items];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const remove = (i: number) => {
    const gone = items[i];
    if (gone.file) URL.revokeObjectURL(gone.url);
    onChange(items.filter((_, k) => k !== i));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={items.length >= MAX_PHOTOS}
          onClick={() => input.current?.click()}
          className="min-h-11 rounded-full border border-accent px-5 font-semibold text-accent enabled:hover:bg-accent/10 disabled:opacity-40"
        >
          + Pilih foto
        </button>
        <span className="text-sm text-muted">{items.length} dari {MAX_PHOTOS} foto (minimal 1)</span>
        <input ref={input} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => add(e.target.files)} tabIndex={-1} aria-label="Pilih foto proyek" />
      </div>
      <p className="mt-1 text-xs text-muted">Foto otomatis dikecilkan saat disimpan. Foto asli maksimal 10 MB. Foto pertama jadi foto sampul.</p>

      {errors.length > 0 && (
        <ul role="alert" className="mt-2 space-y-1 rounded bg-danger/15 p-3 text-sm text-danger">
          {errors.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      )}

      {items.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((it, i) => (
            <li key={it.key} className="overflow-hidden rounded-lg border border-line bg-surface">
              <div className="relative aspect-[4/3] bg-surface-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.url} alt={`Pratinjau foto ${i + 1}`} className="h-full w-full object-cover" />
                {i === 0 && <span className="absolute left-1 top-1 rounded bg-accent px-2 py-0.5 text-xs font-bold text-white">Sampul</span>}
              </div>
              <div className="flex items-center justify-between gap-1 p-1.5">
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Geser foto ${i + 1} ke depan`}
                    className="min-h-11 min-w-11 rounded-lg border border-line text-base disabled:opacity-30">&larr;</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Geser foto ${i + 1} ke belakang`}
                    className="min-h-11 min-w-11 rounded-lg border border-line text-base disabled:opacity-30">&rarr;</button>
                </div>
                <button type="button" onClick={() => remove(i)} className="min-h-11 rounded-lg border border-danger/50 px-3 text-sm text-danger">Hapus</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

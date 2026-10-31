"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/config/site";
import { fetchStats, saveStats } from "@/lib/stats";

/** Form sederhana untuk mengubah tiga angka statistik di beranda. */
export function StatsForm() {
  const [values, setValues] = useState<Record<string, string> | null>(null);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetchStats().then((rows) => {
      setValues(Object.fromEntries(rows.map((r) => [r.key, String(r.value)])));
      setLabels(Object.fromEntries(rows.map((r) => [r.key, r.label])));
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values) return;
    const nums: Record<string, number> = {};
    for (const d of SITE.statsDefaults) {
      const n = Number(values[d.key]);
      if (!Number.isFinite(n) || n < 0 || values[d.key].trim() === "") {
        return setMsg({ ok: false, text: `Angka "${d.label}" harus berupa bilangan 0 atau lebih.` });
      }
      nums[d.key] = n;
    }
    setBusy(true);
    setMsg(null);
    try {
      await saveStats(nums);
      setMsg({ ok: true, text: "Angka statistik tersimpan dan sudah tampil di beranda." });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Gagal menyimpan." });
    }
    setBusy(false);
  };

  return (
    <section aria-labelledby="judul-statistik" className="mt-6 rounded-2xl border border-line bg-surface p-4">
      <h2 id="judul-statistik" className="text-lg font-bold">
        Angka <span className="text-accent">Statistik</span>
      </h2>
      <p className="mt-1 text-sm text-muted">
        Angka ini tampil di beranda dengan animasi hitung naik. Isi manual, tidak dihitung otomatis dari daftar proyek.
      </p>
      <form onSubmit={submit} className="mt-3">
        <div className="grid gap-3 sm:grid-cols-3">
          {SITE.statsDefaults.map((d) => (
            <label key={d.key} className="text-sm font-medium">
              {labels[d.key] ?? d.label}
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                required
                disabled={!values}
                value={values?.[d.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...(v ?? {}), [d.key]: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-base disabled:bg-surface-2"
              />
            </label>
          ))}
        </div>
        {msg && (
          <p role="status" className={`mt-3 rounded-lg p-3 text-sm ${msg.ok ? "bg-ok/15 text-ok" : "bg-danger/15 text-danger"}`}>
            {msg.text}
          </p>
        )}
        <button disabled={busy || !values} className="btn btn-primary mt-3 disabled:opacity-60">
          {busy ? "Menyimpan..." : "Simpan angka"}
        </button>
      </form>
    </section>
  );
}

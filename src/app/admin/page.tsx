"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AdminGate } from "@/components/admin/AdminGate";
import { StatsForm } from "@/components/admin/StatsForm";
import { SERVICE_MAP, isService } from "@/config/services";
import { deleteProject } from "@/lib/admin";
import { fetchProjects } from "@/lib/projects";
import type { Project } from "@/lib/types";

function ProjectTable({ onSignOut }: { onSignOut: () => void }) {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [toDelete, setToDelete] = useState<Project | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetchProjects().then(setProjects).catch(() => setToast({ ok: false, text: "Daftar proyek gagal dimuat." }));
  }, []);
  useEffect(load, [load]);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("saved")) {
      setToast({ ok: true, text: "Proyek berhasil disimpan dan sudah tampil di website." });
      window.history.replaceState(null, "", "/admin");
    }
  }, []);

  const remove = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await deleteProject(toDelete);
      setToast({ ok: true, text: `Proyek "${toDelete.name}" sudah dihapus.` });
      setToDelete(null);
      load();
    } catch (e) {
      setToast({ ok: false, text: e instanceof Error ? e.message : "Gagal menghapus." });
    }
    setBusy(false);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Daftar <span className="text-accent">Proyek</span></h1>
        <div className="flex gap-2">
          <Link href="/admin/proyek/baru" className="btn btn-primary">+ Tambah proyek</Link>
          <button onClick={onSignOut} className="btn btn-outline">Keluar</button>
        </div>
      </div>

      <StatsForm />

      <h2 className="mt-8 text-lg font-bold">Proyek</h2>

      {toast && (
        <p role="status" className={`mt-4 rounded p-3 text-sm ${toast.ok ? "bg-ok/15 text-ok" : "bg-danger/15 text-danger"}`}>{toast.text}</p>
      )}

      {!projects ? (
        <div className="mt-4 space-y-2">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-16 rounded" />)}</div>
      ) : projects.length === 0 ? (
        <p className="mt-6 rounded border border-dashed border-line p-8 text-center text-muted">Belum ada proyek. Klik &quot;Tambah proyek&quot;.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {projects.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{p.name}</p>
                <p className="text-xs text-muted">
                  {isService(p.services[0]) ? SERVICE_MAP[p.services[0]].label : "Layanan belum dipilih"}{p.services.length > 1 ? ` +${p.services.length - 1}` : ""} · {p.year} · {p.city}, {p.province}
                </p>
                {p.admin_note && <p className="mt-1 text-xs text-amber-800">Catatan: {p.admin_note}</p>}
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.status_data === "published" ? "bg-ok/15 text-ok" : "bg-amber-100 text-amber-800"}`}>
                {p.status_data === "published" ? "Tampil" : "Draft"}
              </span>
              <Link href={`/admin/proyek/${p.id}`} className="btn btn-outline !px-4 !py-1.5 text-sm">Edit</Link>
              <button onClick={() => setToDelete(p)} className="btn !px-4 !py-1.5 border-danger/50 text-sm text-danger hover:bg-danger/10">Hapus</button>
            </li>
          ))}
        </ul>
      )}

      {toDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy/60 p-4" role="alertdialog" aria-modal="true" aria-label="Konfirmasi hapus">
          <div className="w-full max-w-sm rounded-lg border border-line bg-surface p-5">
            <p className="text-2xl font-bold">Hapus proyek ini?</p>
            <p className="mt-2 text-sm text-muted">&quot;{toDelete.name}&quot; beserta semua fotonya akan dihapus permanen dan tidak bisa dikembalikan.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button autoFocus onClick={() => setToDelete(null)} className="btn btn-outline">Batal</button>
              <button disabled={busy} onClick={remove} className="btn bg-danger text-white disabled:opacity-60">
                {busy ? "Menghapus..." : "Ya, hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return <AdminGate>{(auth) => <ProjectTable onSignOut={auth.signOut} />}</AdminGate>;
}

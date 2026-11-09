"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AdminGate } from "@/components/admin/AdminGate";
import { PhotoManager, type PhotoItem } from "@/components/admin/PhotoManager";
import { GROUPS, isService, legacyCategoryOf, servicesOf } from "@/config/services";
import { removeStorageFiles, saveProject, uploadPhoto } from "@/lib/admin";
import { citiesOf, findCity, PROVINCES } from "@/lib/indonesia";
import { compressPhoto, MIN_PHOTOS } from "@/lib/photos";
import { fetchProjects } from "@/lib/projects";
import type { Project, ProjectInput } from "@/lib/types";

const PinPicker = dynamic(() => import("@/components/admin/PinPicker"), {
  ssr: false,
  loading: () => <div className="skeleton h-64 w-full rounded" />,
});

const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: THIS_YEAR + 2 - 1995 }, (_, i) => THIS_YEAR + 1 - i);

const EMPTY: ProjectInput = {
  category: "boiler", // diisi otomatis dari layanan utama saat menyimpan
  services: [],
  name: "",
  client: "",
  owner: "",
  customer: "",
  location_precision: "city",
  year: THIS_YEAR,
  province: "",
  city: "",
  lat: -2.5,
  lng: 118,
  description: "",
  scope: "",
  status_data: "published",
  admin_note: "",
};

const field = "mt-1 w-full rounded border border-line bg-surface-2 px-3 py-2.5 text-base";

function Form({ id }: { id: string | null }) {
  const router = useRouter();
  const [form, setForm] = useState<ProjectInput>(EMPTY);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [original, setOriginal] = useState<Project | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pinMoved, setPinMoved] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchProjects()
      .then((all) => {
        const p = all.find((x) => x.id === id);
        if (!p) return setMsg({ ok: false, text: "Proyek tidak ditemukan." });
        setOriginal(p);
        const { photos: ph, ...rest } = p as Partial<Project> & Project;
        for (const k of ["id", "slug", "created_at"] as const) delete (rest as Partial<Project>)[k];
        setForm(rest);
        setPhotos(ph.map((url, i) => ({ key: `old-${i}`, url })));
        setPinMoved(true);
      })
      .catch(() => setMsg({ ok: false, text: "Proyek gagal dimuat." }))
      .finally(() => setLoading(false));
  }, [id]);

  const set = <K extends keyof ProjectInput>(k: K, v: ProjectInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const cities = useMemo(() => citiesOf(form.province), [form.province]);

  const pickProvince = (province: string) => setForm((f) => ({ ...f, province, city: "" }));
  const pickCity = (city: string) => {
    const c = findCity(form.province, city);
    setPinMoved(false);
    setForm((f) => ({ ...f, city, location_precision: "city", ...(c ? { lat: c.lat, lng: c.lng } : {}) }));
  };
  const resetPin = () => {
    const c = findCity(form.province, form.city);
    if (c) setForm((f) => ({ ...f, lat: c.lat, lng: c.lng }));
    setPinMoved(false);
  };

  const validate = (): string | null => {
    if (!form.name.trim()) return "Nama proyek wajib diisi.";
    if (!isService(form.services[0])) return "Pilih layanan utama proyek.";
    if (!form.province) return "Pilih provinsi lokasi proyek.";
    // proyek hasil impor bisa hanya punya titik provinsi/pusat kota (kota kosong); selain itu kota wajib
    if (!form.city && form.location_precision === "city") return "Pilih kota/kabupaten lokasi proyek.";
    if (photos.length < MIN_PHOTOS) return "Tambahkan minimal 1 foto proyek.";
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bad = validate();
    if (bad) return setMsg({ ok: false, text: bad });
    setSaving(true);
    setMsg({ ok: true, text: "Menyimpan... mohon tunggu, foto sedang dikecilkan dan diunggah." });
    const uploaded: string[] = [];
    try {
      const folder = original?.slug ?? `proyek-${Date.now()}`;
      const urls: string[] = [];
      for (const p of photos) {
        if (p.file) {
          const url = await uploadPhoto(await compressPhoto(p.file), folder);
          uploaded.push(url);
          urls.push(url);
        } else urls.push(p.url);
      }
      const services = [...new Set(form.services.filter(isService))];
      await saveProject(id, { ...form, services, category: legacyCategoryOf(services[0]), name: form.name.trim(), owner: form.owner.trim(), customer: form.customer.trim(), client: (form.owner.trim() || form.customer.trim()) }, urls);
      // Hapus file foto lama yang sudah dibuang dari daftar.
      const dropped = (original?.photos ?? []).filter((u) => !urls.includes(u));
      if (dropped.length) await removeStorageFiles(dropped).catch(() => {});
      router.push("/admin?saved=1");
    } catch (err) {
      if (uploaded.length) await removeStorageFiles(uploaded).catch(() => {});
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Gagal menyimpan. Coba lagi." });
      setSaving(false);
    }
  };

  if (loading) return <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-14 rounded" />)}</div>;

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">{id ? "Edit" : "Tambah"} <span className="text-accent">Proyek</span></h1>
        <Link href="/admin" className="text-sm text-muted hover:text-ink">&larr; Kembali ke daftar</Link>
      </div>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          Layanan utama <span className="text-danger">*</span>
          <select
            className={field}
            value={form.services[0] ?? ""}
            onChange={(e) => set("services", [e.target.value, ...form.services.slice(1).filter((x) => x !== e.target.value)])}
          >
            <option value="" disabled>Pilih layanan...</option>
            {GROUPS.map((g) => (
              <optgroup key={g.slug} label={g.label}>
                {servicesOf(g.slug).map((sv) => <option key={sv.slug} value={sv.slug}>{sv.label}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Tahun
          <select className={field} value={form.year} onChange={(e) => set("year", Number(e.target.value))}>
            {YEARS.map((y) => <option key={y}>{y}</option>)}
          </select>
        </label>
        <label className="text-sm sm:col-span-2">
          Nama proyek <span className="text-danger">*</span>
          <input className={field} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Contoh: PLTMG Teluk Lembu 7 x 3,3 MW" required />
        </label>
        <label className="text-sm">
          Owner
          <input className={field} value={form.owner} onChange={(e) => set("owner", e.target.value)} placeholder="Pemilik proyek" />
        </label>
        <label className="text-sm">
          Customer
          <input className={field} value={form.customer} onChange={(e) => set("customer", e.target.value)} placeholder="Pelanggan / kontraktor utama" />
        </label>
      </fieldset>

      <details className="rounded border border-line bg-surface p-3">
        <summary className="cursor-pointer text-sm font-semibold">
          Layanan lain (opsional){form.services.length > 1 ? ` - ${form.services.length - 1} dipilih` : ""}
        </summary>
        <p className="mt-2 text-xs text-muted">Centang bila proyek ini juga mencakup layanan lain. Layanan utama dipilih di atas.</p>
        <div className="mt-3 space-y-3">
          {GROUPS.map((g) => (
            <div key={g.slug}>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">{g.label}</p>
              <div className="mt-1 flex flex-wrap gap-x-4">
                {servicesOf(g.slug).map((sv) => {
                  const isMain = form.services[0] === sv.slug;
                  const on = form.services.includes(sv.slug);
                  return (
                    <label key={sv.slug} className={`inline-flex min-h-11 items-center gap-2 text-sm ${isMain ? "opacity-60" : ""}`}>
                      <input
                        type="checkbox"
                        className="h-5 w-5"
                        checked={on}
                        disabled={isMain}
                        onChange={(e) => set("services", e.target.checked ? [...form.services, sv.slug] : form.services.filter((x) => x !== sv.slug))}
                      />
                      {sv.label}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </details>

      <fieldset className="space-y-4">
        <legend className="font-display text-xl font-bold text-accent">Lokasi</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            Provinsi <span className="text-danger">*</span>
            <select className={field} value={form.province} onChange={(e) => pickProvince(e.target.value)}>
              <option value="">Pilih provinsi</option>
              {PROVINCES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
          <label className="text-sm">
            Kota / Kabupaten {form.location_precision === "city" && <span className="text-danger">*</span>}
            <select className={field} value={form.city} disabled={!form.province} onChange={(e) => pickCity(e.target.value)}>
              <option value="">{form.province ? "Pilih kota/kabupaten" : "Pilih provinsi dulu"}</option>
              {cities.map((c) => <option key={c.name}>{c.name}</option>)}
            </select>
          </label>
        </div>
        {form.city && (
          <div>
            <p className="mb-1 text-sm text-muted">
              Posisi titik di peta mengikuti kota. Kalau ingin lebih tepat, <strong className="text-ink">geser pin</strong> atau klik di peta.
            </p>
            <PinPicker lat={form.lat} lng={form.lng} onChange={(lat, lng) => { setPinMoved(true); setForm((f) => ({ ...f, lat, lng })); }} />
            <div className="mt-1 flex items-center justify-between text-xs text-muted">
              <span>Koordinat: {form.lat.toFixed(4)}, {form.lng.toFixed(4)}</span>
              {pinMoved && findCity(form.province, form.city) && (
                <button type="button" onClick={resetPin} className="text-accent hover:underline">Kembalikan ke posisi kota</button>
              )}
            </div>
          </div>
        )}
      </fieldset>

      <fieldset className="space-y-4">
        <label className="block text-sm">
          Keterangan proyek
          <textarea className={field} rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Ceritakan singkat proyek ini: kapasitas, tujuan, hasil." />
        </label>
        <label className="block text-sm">
          Bagian pekerjaan
          <textarea className={field} rows={4} value={form.scope} onChange={(e) => set("scope", e.target.value)} placeholder="Pekerjaan yang dikerjakan MTJM, satu per baris." />
        </label>
      </fieldset>

      <fieldset>
        <legend className="mb-2 font-display text-xl font-bold text-accent">Foto <span className="text-danger">*</span></legend>
        <PhotoManager items={photos} onChange={setPhotos} />
      </fieldset>

      <fieldset className="space-y-3 rounded-lg border border-line bg-surface p-4">
        <label className="flex items-center gap-3 text-base">
          <input type="checkbox" className="h-5 w-5 accent-[#0b6aa8]" checked={form.status_data === "published"} onChange={(e) => set("status_data", e.target.checked ? "published" : "draft")} />
          Tampilkan proyek ini di website
        </label>
        <label className="block text-sm">
          Catatan internal (tidak tampil di website)
          <input className={field} value={form.admin_note} onChange={(e) => set("admin_note", e.target.value)} placeholder="Contoh: perlu dicek kapasitasnya" />
        </label>
      </fieldset>

      {msg && <p role={msg.ok ? "status" : "alert"} className={`rounded p-3 text-sm ${msg.ok ? "bg-ok/15 text-ok" : "bg-danger/15 text-danger"}`}>{msg.text}</p>}

      <div className="sticky bottom-0 -mx-4 flex gap-3 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur">
        <button disabled={saving} className="btn btn-primary flex-1 !py-3 text-base disabled:opacity-60 sm:flex-none sm:px-10">
          {saving ? "Menyimpan..." : "Simpan proyek"}
        </button>
        <Link href="/admin" className="rounded border border-line px-5 py-3 font-semibold">Batal</Link>
      </div>
    </form>
  );
}

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  return <AdminGate>{() => <Form id={id === "baru" ? null : id} />}</AdminGate>;
}

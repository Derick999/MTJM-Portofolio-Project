import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Halaman tidak ditemukan" };

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center">
      <p className="text-6xl font-bold text-accent sm:text-7xl" aria-hidden>
        404
      </p>
      <h1 className="mt-3 text-2xl font-bold sm:text-3xl">Halaman tidak ditemukan</h1>
      <p className="mt-3 text-base leading-relaxed text-muted">
        Alamat yang Anda buka tidak ada atau sudah dipindahkan. Silakan kembali ke beranda untuk melihat peta dan daftar proyek MTJM.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">
          Kembali ke Beranda
        </Link>
        <Link href="/#proyek" className="btn btn-outline">
          Lihat Proyek
        </Link>
      </div>
    </section>
  );
}

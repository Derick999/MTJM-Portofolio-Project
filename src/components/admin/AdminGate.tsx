"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/lib/admin";

type Auth = ReturnType<typeof useAdminAuth>;

/** Menampilkan login bila belum masuk. Anak-anak hanya dirender untuk akun admin. */
export function AdminGate({ children }: { children: (auth: Auth) => React.ReactNode }) {
  const auth = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (auth.state === "loading") return <p className="text-muted" role="status">Memeriksa login...</p>;

  if (auth.state === "nosupabase") {
    return (
      <div className="rounded-lg border border-accent-2/40 bg-accent-2/10 p-4 text-sm">
        <p className="font-semibold">Supabase belum disambungkan.</p>
        <p className="mt-1 text-muted">
          Halaman admin butuh database. Isi <code>NEXT_PUBLIC_SUPABASE_URL</code> dan <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> di
          file <code>.env.local</code> (lihat README), lalu jalankan ulang. Sementara ini situs menampilkan data contoh.
        </p>
        <Link href="/" className="mt-3 inline-block font-semibold text-accent">&larr; Kembali ke situs</Link>
      </div>
    );
  }

  if (auth.state === "denied") {
    return (
      <div className="rounded-lg border border-danger/50 bg-danger/10 p-4 text-sm">
        <p className="font-semibold">Akun ini belum terdaftar sebagai admin.</p>
        <p className="mt-1 text-muted">Minta pengelola situs menambahkan akun Anda, atau masuk dengan akun lain.</p>
        <button onClick={auth.signOut} className="mt-3 rounded border border-line px-3 py-2 font-semibold">Keluar</button>
      </div>
    );
  }

  if (auth.state === "out") {
    return (
      <form
        className="mx-auto max-w-sm space-y-4 rounded-lg border border-line bg-surface p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setMsg(await auth.signIn(email, password));
          setBusy(false);
        }}
      >
        <h1 className="font-display text-3xl font-bold">Masuk <span className="text-accent">Admin</span></h1>
        <label className="block text-sm">
          Email
          <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border border-line bg-surface-2 px-3 py-2.5 text-base" />
        </label>
        <label className="block text-sm">
          Password
          <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border border-line bg-surface-2 px-3 py-2.5 text-base" />
        </label>
        {msg && <p role="alert" className="rounded bg-danger/15 p-2 text-sm text-danger">{msg}</p>}
        <button disabled={busy} className="btn btn-primary w-full !py-3 text-base disabled:opacity-60">
          {busy ? "Memeriksa..." : "Masuk"}
        </button>
        <Link href="/" className="block text-center text-sm text-muted hover:text-ink">&larr; Kembali ke situs</Link>
      </form>
    );
  }

  return <>{children(auth)}</>;
}

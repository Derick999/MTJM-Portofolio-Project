"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase, hasSupabase, PHOTO_BUCKET } from "./supabase";
import { slugify } from "./filters";
import type { Project, ProjectInput } from "./types";

export type AuthState = "loading" | "nosupabase" | "out" | "denied" | "in";

async function isAdmin(userId: string): Promise<boolean> {
  const sb = getSupabase()!;
  const { data } = await sb.from("admins").select("user_id").eq("user_id", userId).maybeSingle();
  return Boolean(data);
}

export function useAdminAuth() {
  const [state, setState] = useState<AuthState>(hasSupabase ? "loading" : "nosupabase");

  const check = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    const { data } = await sb.auth.getSession();
    const user = data.session?.user;
    if (!user) return setState("out");
    setState((await isAdmin(user.id)) ? "in" : "denied");
  }, []);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    check();
    const { data } = sb.auth.onAuthStateChange(() => void check());
    return () => data.subscription.unsubscribe();
  }, [check]);

  const signIn = async (email: string, password: string): Promise<string | null> => {
    const sb = getSupabase()!;
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return "Email atau password salah. Periksa lagi, lalu coba masuk kembali.";
    await check();
    return null;
  };
  const signOut = async () => {
    await getSupabase()?.auth.signOut();
    setState("out");
  };
  return { state, signIn, signOut };
}

/** Path file di bucket dari URL publik Supabase. */
function storagePath(url: string): string | null {
  const marker = `/object/public/${PHOTO_BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
}

export async function uploadPhoto(file: File, folder: string): Promise<string> {
  const sb = getSupabase()!;
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const { error } = await sb.storage.from(PHOTO_BUCKET).upload(path, file, { contentType: "image/webp", cacheControl: "31536000" });
  if (error) throw new Error("Foto gagal diunggah. Periksa koneksi internet lalu coba simpan lagi.");
  return sb.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Simpan proyek (baru atau ubah) beserta urutan foto. `photoUrls` sudah berupa URL final. */
export async function saveProject(id: string | null, input: ProjectInput, photoUrls: string[]): Promise<string> {
  const sb = getSupabase()!;
  let projectId = id;
  if (projectId) {
    const { error } = await sb.from("projects").update(input).eq("id", projectId);
    if (error) throw new Error("Data proyek gagal disimpan.");
  } else {
    const base = slugify(`${input.name}-${input.year}`) || "proyek";
    // Slug harus unik: bila bentrok, tambahkan akhiran acak.
    for (let i = 0; i < 4 && !projectId; i++) {
      const slug = i === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
      const { data, error } = await sb.from("projects").insert({ ...input, slug }).select("id").single();
      if (!error) projectId = data.id as string;
    }
    if (!projectId) throw new Error("Data proyek gagal disimpan.");
  }
  const { error: delErr } = await sb.from("project_photos").delete().eq("project_id", projectId);
  if (delErr) throw new Error("Foto gagal diperbarui.");
  const { error: insErr } = await sb
    .from("project_photos")
    .insert(photoUrls.map((url, sort_order) => ({ project_id: projectId, url, sort_order })));
  if (insErr) throw new Error("Foto gagal disimpan.");
  return projectId;
}

export async function removeStorageFiles(urls: string[]) {
  const paths = urls.map(storagePath).filter((p): p is string => Boolean(p));
  if (paths.length) await getSupabase()?.storage.from(PHOTO_BUCKET).remove(paths);
}

export async function deleteProject(p: Project) {
  const sb = getSupabase()!;
  const { error } = await sb.from("projects").delete().eq("id", p.id);
  if (error) throw new Error("Proyek gagal dihapus.");
  await removeStorageFiles(p.photos);
}

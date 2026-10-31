import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabase = Boolean(url && key);

let client: SupabaseClient | null = null;

/** Klien Supabase (null jika env belum diisi -> situs berjalan dengan data contoh). */
export function getSupabase(): SupabaseClient | null {
  if (!hasSupabase) return null;
  client ??= createClient(url!, key!);
  return client;
}

export const PHOTO_BUCKET = "project-photos";

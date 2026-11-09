import { SITE } from "@/config/site";

/** Lokasi tautan ke web utama (nilai utm_content). */
export type LinkSpot = "hero" | "cta" | "faq" | "nav" | "proyek";

/**
 * SATU-SATUNYA cara membuat tautan ke web utama: menambahkan UTM supaya kunjungan dari portofolio bisa dilacak.
 * utm_source dan utm_campaign diatur di SITE.utm; `to` bisa diganti (mis. SITE.contactUrl) selama masih di web utama.
 */
export function mainSiteHref(spot: LinkSpot, to: string = SITE.url): string {
  const u = new URL(to);
  u.searchParams.set("utm_source", SITE.utm.source);
  u.searchParams.set("utm_medium", SITE.utm.medium);
  u.searchParams.set("utm_campaign", SITE.utm.campaign);
  u.searchParams.set("utm_content", spot);
  return u.toString();
}

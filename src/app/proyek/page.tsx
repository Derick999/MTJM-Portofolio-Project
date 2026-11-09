import type { Metadata } from "next";
import { ProjectSearch, type SearchParams } from "@/components/proyek/ProjectSearch";
import { SITE } from "@/config/site";
import { fetchProjectsServer } from "@/lib/projects-server";

const title = "Cari Proyek";
const description = `Telusuri proyek ${SITE.name} berdasarkan layanan, lokasi, dan tahun: peta Indonesia, ilustrasi 3D, dan daftar proyek.`;

// Metadata dan Open Graph terpisah dari beranda (gambar tetap og.png).
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/proyek" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: SITE.name,
    url: "/proyek",
    title: `${title} | ${SITE.short}`,
    description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: { card: "summary_large_image", title: `${title} | ${SITE.short}`, description, images: ["/og.png"] },
};

export default async function ProyekPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  // Semua proyek published diambil sekali di server; filter dilakukan di klien.
  const projects = await fetchProjectsServer();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      <ProjectSearch initialProjects={projects} initial={sp} />
    </div>
  );
}

import { FaqSection } from "@/components/home/FaqSection";
import { Hero } from "@/components/home/Hero";
import { ServiceCards } from "@/components/home/ServiceCards";
import { StatsBar } from "@/components/StatsBar";
import { GROUPS } from "@/config/services";
import { groupCardImage } from "@/lib/placeholders";
import { fetchHomeSummary } from "@/lib/home-server";
import { fetchStatsServer } from "@/lib/stats-server";

// Angka statistik diambil per permintaan supaya perubahan dari admin langsung tampil.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Beranda hanya butuh ringkasan ringan (jumlah per layanan, foto sampul, 3 proyek terbaru), dihitung di server.
  const [{ stats, fromServer }, summary] = await Promise.all([fetchStatsServer(), fetchHomeSummary()]);
  // Foto sementara kartu group (hanya yang filenya ada); foto proyek asli menggantikannya otomatis.
  const groupFallback = Object.fromEntries(GROUPS.map((g) => [g.slug, groupCardImage(g.slug)?.src]));
  return (
    <>
      <Hero latest={summary.latest} />
      <StatsBar initial={stats} serverOk={fromServer} />
      <ServiceCards summary={summary} groupFallback={groupFallback} />
      <FaqSection />
    </>
  );
}

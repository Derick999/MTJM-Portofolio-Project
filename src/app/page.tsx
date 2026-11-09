import { CtaSection } from "@/components/home/CtaSection";
import { FaqSection } from "@/components/home/FaqSection";
import { Hero } from "@/components/home/Hero";
import { Dashboard } from "@/components/home/Dashboard";
import { StatsBar } from "@/components/StatsBar";
import { fetchStatsServer } from "@/lib/stats-server";

// Angka statistik diambil per permintaan supaya perubahan dari admin langsung tampil.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { stats, fromServer } = await fetchStatsServer();
  return (
    <>
      <Hero />
      <StatsBar initial={stats} serverOk={fromServer} />

      {/* Anchor sementara: bagian peta + proyek per kategori yang sudah ada; diganti penjelajah layanan di tahap berikutnya. */}
      <div id="layanan">
        <Dashboard />
      </div>

      <FaqSection />
      <CtaSection />
    </>
  );
}

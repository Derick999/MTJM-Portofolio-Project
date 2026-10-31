import { CtaSection } from "@/components/home/CtaSection";
import { Dashboard } from "@/components/home/Dashboard";
import { StatsBar } from "@/components/StatsBar";
import { SITE } from "@/config/site";
import { fetchStatsServer } from "@/lib/stats-server";

// Angka statistik diambil per permintaan supaya perubahan dari admin langsung tampil.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { hero } = SITE;
  const { stats, fromServer } = await fetchStatsServer();
  return (
    <>
      <section className="on-navy bg-gradient-to-br from-navy via-navy to-navy-2 pb-20 pt-10 text-white sm:pb-24 sm:pt-14">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-2">{hero.eyebrow}</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">{hero.title}</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/80">{hero.text}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={hero.primary.href} className="btn btn-white">
              {hero.primary.label}
            </a>
            <a href={hero.secondary.href} className="btn btn-ghost-white">
              {hero.secondary.label}
            </a>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-12 max-w-7xl px-4 sm:-mt-14">
        <StatsBar initial={stats} serverOk={fromServer} />
      </div>

      <Dashboard />
      <CtaSection />
    </>
  );
}

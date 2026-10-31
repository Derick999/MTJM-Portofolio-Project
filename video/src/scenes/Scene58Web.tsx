import "../web.css";
import { useEffect, useRef, useState } from "react";
import { AbsoluteFill, Easing, Img, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ProjectDetail } from "@/components/ProjectDetail";
import { SiteHeader } from "@/components/SiteHeader";
import { CONFIG, S9, sec } from "../config";
import { S9_START, SCENE58_CAPTIONS, SCENE58_SCRIPT } from "../script";
import { COLORS, FONT } from "../theme";
import { BrowserWindow } from "../ui/BrowserWindow";
import { CursorView } from "../ui/Cursor";
import { TARGETS, WIN } from "../ui/layout";
import { DROPDOWN_ROW, cursorAt, dropdownOptions, mapViewAt, scrollAt, sessionAt, type Metrics } from "../web/session";
import { WebPage, collectMetrics } from "../web/WebPage";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const noop = () => {};
const drawerOpen = (s: ReturnType<typeof sessionAt>, frame: number) => Boolean(s.drawer) && (s.drawer!.closeFrame === null || frame < s.drawer!.closeFrame);

// Posisi kursor di akhir adegan 4 (klik hasil pertama), supaya gerakan kursor bersambung antar adegan.
const CURSOR_START = { x: TARGETS["result-1"].x, y: TARGETS["result-1"].y };

/**
 * Adegan 5-9 (0:36-penutup; adegan 9 = kursor ke "Main Website", jendela mengecil, logo + alamat web): halaman web di dalam jendela browser yang sama. Peta, filter, daftar, drawer, dan viewer 3D memakai
 * komponen web asli dengan data statis; interaksi dianimasikan per frame dari SCENE58_SCRIPT (script.ts). Waktu = frame sejak 0:36.
 */
export const Scene58Web = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  const S = CONFIG.scene58;

  // posisi elemen halaman diukur sekali (setelah font siap), dipakai untuk menghitung tujuan kursor dan gulir
  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [handle] = useState(() => delayRender("web-metrics"));
  useEffect(() => {
    if (metrics) return;
    document.fonts.ready.then(() => {
      requestAnimationFrame(() => {
        if (pageRef.current) {
          const m = collectMetrics(pageRef.current);
          // tombol "Main Website" ada di header (di luar WebPage): ukur terpisah, koordinat relatif terhadap pembungkus header
          const hdr = headerRef.current;
          const btn = hdr ? [...hdr.querySelectorAll("nav a")].find((a) => a.textContent?.includes(CONFIG.mainSiteButton)) : null;
          if (hdr && btn) {
            const hr = hdr.getBoundingClientRect();
            const sc = hr.width / hdr.offsetWidth || 1;
            const r = btn.getBoundingClientRect();
            m.mainSite = { x: (r.left - hr.left) / sc, y: (r.top - hr.top) / sc, w: r.width / sc, h: r.height / sc };
          }
          setMetrics(m);
          continueRender(handle);
        }
      });
    });
  }, [metrics, handle]);

  const f9 = frame / 30 - S9_START / 30;
  const C9 = CONFIG.scene9;
  const session = sessionAt(frame, SCENE58_SCRIPT);
  const mapW = metrics ? metrics.map.w - 2 : 850;
  const mapH = metrics ? metrics.map.h - 2 : 518;
  const view = mapViewAt(frame, session, mapW, mapH);
  const scrollY = metrics ? scrollAt(frame, metrics) : 0;
  const cursor = metrics ? cursorAt(frame, SCENE58_SCRIPT, metrics, CURSOR_START) : CURSOR_START;
  const arriveFrame = S9_START + sec(C9.cursorStart + C9.cursorMove);
  const hover = clamp01((frame - arriveFrame + sec(0.05)) / sec(0.15));
  const clicks = metrics
    ? SCENE58_SCRIPT.filter((s) => s.action === "click").map((s) => ({ frame: s.frame, ...cursorAt(s.frame, SCENE58_SCRIPT, metrics, CURSOR_START) }))
    : [];

  // viewer 3D: berputar terus; sekilas meredup saat model berganti
  const modelAngle = (frame / 30) * S.modelSpinDegPerSec;
  const catChange = session.filterEvents.filter((e) => e.filters.category).map((e) => e.frame);
  const dip = Math.max(0, ...catChange.map((c) => 1 - clamp01(Math.abs(frame - (c + sec(0.1))) / sec(0.18))));
  const modelOpacity = 1 - 0.7 * dip;

  // jendela: mengecil dari ukuran akhir adegan 4 ke ukuran yang menyisakan ruang untuk teks keterangan
  const fit = Math.min(1, (width * 0.88) / WIN.w, (height * 0.88) / WIN.h);
  const k = Easing.inOut(Easing.cubic)(clamp01(frame / sec(S.settleSeconds)));
  // adegan 9: setelah klik "Main Website", jendela mengecil ke tengah dan memudar, latar menjadi navy
  const shrinkP = clamp01((f9 - S9.shrinkStart) / C9.shrink.seconds);
  const shrinkK = Easing.inOut(Easing.cubic)(shrinkP);
  const scale = lerp(fit * 1.045, fit * S.windowScale, k) * lerp(1, C9.shrink.toScale, shrinkK);
  const ty = lerp(0, -S.windowShiftY * u, k) * (1 - shrinkK);

  // peralihan dari halaman pencarian (adegan 4): bilah loading selesai lalu halaman web tampil
  const progress = clamp01(0.91 + (frame / sec(0.12)) * 0.09);
  const reveal = 1 - clamp01((frame - sec(0.1)) / sec(0.35));

  // menu aktif header (sama dengan logika web: bagian yang sedang tampil; drawer terbuka = "Proyek")
  const nav =
    session.drawer && drawerOpen(session, frame)
      ? "proyek"
      : !metrics || scrollY < metrics.sectionPeta - 150
        ? "beranda"
        : scrollY < metrics.sectionProyek - 150
          ? "peta"
          : "proyek";

  // dropdown tiruan
  const dd = session.dropdown;
  const ddRect = metrics && dd ? (dd.id === "year" ? metrics.selYear : metrics.selCategory) : null;
  const ddOpts = dd ? dropdownOptions(dd.id, session.filters) : [];
  const ddTop = ddRect ? ddRect.y + ddRect.h + 4 - scrollY : 0;
  const ddIn = dd ? clamp01((frame - dd.openFrame) / sec(0.14)) : 0;
  const cursorPage = { x: cursor.x, y: cursor.y - WIN.chrome };
  const hoverIdx =
    ddRect && cursorPage.x >= ddRect.x && cursorPage.x <= ddRect.x + ddRect.w
      ? Math.floor((cursorPage.y - ddTop - 6) / DROPDOWN_ROW)
      : -1;

  // drawer detail proyek: geser masuk dari kanan, Esc menutup
  const dr = session.drawer;
  const drawerP = dr
    ? dr.closeFrame === null
      ? Easing.out(Easing.cubic)(clamp01((frame - dr.openFrame) / sec(0.45)))
      : 1 - Easing.in(Easing.cubic)(clamp01((frame - dr.closeFrame) / sec(0.28)))
    : 0;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, #14186a 0%, ${COLORS.navyDeep} 55%, #02030f 100%)` }} />
      {/* latar penutup: navy dari config, dengan kilau pelan yang tetap bergerak (gerak latar tidak berhenti) */}
      <AbsoluteFill
        style={{
          opacity: shrinkK,
          background: `radial-gradient(ellipse at ${50 + 5 * Math.sin(frame / 70)}% ${46 + 3 * Math.cos(frame / 90)}%, rgba(29,199,244,0.14) 0%, rgba(29,199,244,0) 55%), ${C9.background}`,
        }}
      />
      <AbsoluteFill style={{ opacity: 1 - shrinkK, filter: shrinkK > 0 ? `brightness(${1 - 0.4 * shrinkK})` : undefined }}>
        <div
          className="legacy-box"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: WIN.w,
            height: WIN.h,
            transform: `translate(-50%, -50%) translateY(${ty}px) scale(${scale})`,
          }}
        >
          <BrowserWindow tabTitle={CONFIG.search.results[0].title} address={CONFIG.search.results[0].url} progress={progress}>
            {/* isi halaman = web asli: border-box seperti di web */}
            <div className="web-box" data-nav={nav} style={{ position: "relative", width: WIN.w, height: WIN.h - WIN.chrome, overflow: "hidden", transform: "translateZ(0)", background: "#f3f7fb" }}>
              <div style={{ transform: `translateY(${-scrollY}px)` }}>
                <WebPage ref={pageRef} session={session} frame={frame} view={view} modelAngle={modelAngle} modelOpacity={modelOpacity} />
              </div>
              <div ref={headerRef} style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 30 }}>
                <SiteHeader />
                {metrics && hover > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      left: metrics.mainSite.x,
                      top: metrics.mainSite.y,
                      width: metrics.mainSite.w,
                      height: metrics.mainSite.h,
                      borderRadius: 999,
                      pointerEvents: "none",
                      background: `rgba(24,135,205,${0.14 * hover})`,
                      boxShadow: `0 0 0 ${3 * hover}px rgba(29,199,244,${0.55 * hover}), 0 0 ${26 * hover}px rgba(29,199,244,${0.6 * hover})`,
                    }}
                  />
                )}
              </div>

              {ddRect && dd && (
                <div
                  style={{
                    position: "absolute",
                    left: ddRect.x,
                    top: ddTop,
                    width: ddRect.w,
                    zIndex: 35,
                    opacity: ddIn,
                    transform: `scaleY(${0.92 + 0.08 * ddIn})`,
                    transformOrigin: "top",
                    background: "#ffffff",
                    border: "1px solid #cfdbe8",
                    borderRadius: 10,
                    boxShadow: "0 14px 36px rgba(20,20,74,0.22)",
                    padding: 6,
                    fontFamily: FONT,
                  }}
                >
                  {ddOpts.map((o, i) => {
                    const selected = (dd.id === "year" ? session.filters.year : session.filters.category) === o.value;
                    return (
                      <div
                        key={o.value || "semua"}
                        style={{
                          height: DROPDOWN_ROW,
                          display: "flex",
                          alignItems: "center",
                          padding: "0 12px",
                          borderRadius: 6,
                          fontSize: 14,
                          color: i === hoverIdx ? "#ffffff" : "#101a33",
                          background: i === hoverIdx ? "#0b6aa8" : selected ? "#e8f0f8" : "transparent",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {o.label}
                      </div>
                    );
                  })}
                </div>
              )}

              {dr && drawerP > 0.001 && (
                <div style={{ position: "absolute", inset: 0, zIndex: 40, opacity: drawerP, transform: `translateX(${(1 - drawerP) * 90}px)` }}>
                  <ProjectDetail project={dr.project} onClose={noop} />
                </div>
              )}

              {/* putih = halaman sebelumnya (hasil pencarian) yang selesai memuat */}
              <div style={{ position: "absolute", inset: 0, background: "#ffffff", opacity: reveal, zIndex: 60, pointerEvents: "none" }} />
            </div>
          </BrowserWindow>
          <CursorView frame={frame} x={cursor.x} y={cursor.y} clicks={clicks} />
        </div>
      </AbsoluteFill>

      <ClosingCard f9={f9} u={u} />

      {/* teks keterangan di bawah jendela */}
      {SCENE58_CAPTIONS.map((c) => {
        const op = clamp01((frame - c.from) / sec(0.4)) * (1 - clamp01((frame - (c.to - sec(0.3))) / sec(0.3)));
        if (op <= 0.001) return null;
        return (
          <div
            key={c.text}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 52 * u,
              textAlign: "center",
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: 54 * u,
              letterSpacing: "0.01em",
              color: COLORS.white,
              opacity: op,
              transform: `translateY(${(1 - op) * 10 * u}px)`,
              textShadow: "0 3px 22px rgba(0,0,12,0.8)",
            }}
          >
            {c.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const textStyle = (f9: number, at: number, u: number) => {
  const p = clamp01((f9 - at) / CONFIG.scene9.textFade);
  const e = Easing.out(Easing.cubic)(p);
  return { opacity: e, transform: `translateY(${(1 - e) * 14 * u}px)` };
};

/** Penutup: logo dalam kartu putih (fade + skala 0.95 -> 1.0), lalu label "Main Website" dan alamat web bertahap, lalu fade out ke navy. */
const ClosingCard = ({ f9, u }: { f9: number; u: number }) => {
  const C = CONFIG.scene9;
  if (f9 < S9.logoStart) return null;
  const lp = Easing.out(Easing.cubic)(clamp01((f9 - S9.logoStart) / C.logo.fadeSeconds));
  const out = 1 - clamp01((f9 - S9.fadeOutStart) / C.fadeOut);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FONT, opacity: out }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -20 * u }}>
        <div
          style={{
            width: C.logo.cardWidth * u,
            padding: `${30 * u}px ${44 * u}px`,
            background: "#ffffff",
            borderRadius: 30 * u,
            boxShadow: "0 24px 70px rgba(0,0,24,0.45), 0 4px 14px rgba(0,0,24,0.25)",
            opacity: lp,
            transform: `scale(${lerp(C.logo.fromScale, 1, lp)})`,
            boxSizing: "border-box",
          }}
        >
          <Img src={staticFile(CONFIG.logoFile)} style={{ display: "block", width: "100%", height: "auto" }} />
        </div>
        <div style={{ marginTop: 62 * u, fontSize: 30 * u, fontWeight: 500, letterSpacing: "0.32em", textTransform: "uppercase", paddingLeft: "0.32em", color: "rgba(255,255,255,0.78)", ...textStyle(f9, S9.label, u) }}>
          {CONFIG.mainSiteButton}
        </div>
        <div style={{ marginTop: 14 * u, fontSize: 104 * u, fontWeight: 600, letterSpacing: "0.005em", color: "#ffffff", ...textStyle(f9, S9.url, u) }}>{CONFIG.mainSiteUrl}</div>
        {CONFIG.showTagline && (
          <div style={{ marginTop: 22 * u, fontSize: 34 * u, fontWeight: 400, letterSpacing: "0.04em", color: "rgba(255,255,255,0.82)", ...textStyle(f9, S9.tagline, u) }}>{CONFIG.tagline}</div>
        )}
      </div>
    </AbsoluteFill>
  );
};

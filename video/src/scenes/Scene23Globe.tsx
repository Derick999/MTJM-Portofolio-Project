import { AbsoluteFill, Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { CONFIG, EARTH_FADE_IN_AT_SEC, FPS, SCENES, sec } from "../config";
import { COLORS, FONT } from "../theme";
import { Atmosphere, Clouds, Dots, EarthSurface, Outlines, Stars } from "./globe/Earth";
import { placeCamera, spinAt } from "./globe/cameraPath";
import { Post } from "./globe/Post";
import { HubLabel } from "./globe/HubLabel";

// Adegan 2 (Bumi malam) dan 3 (titik proyek + teks layanan + counter) memakai satu kamera 3D yang bersambung.
// Komponen ini dimulai saat Bumi mulai fade in (di akhir adegan 1), teks adegan 1 tetap tampil di atasnya.
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const CameraRig = ({ t, aspect }: { t: number; aspect: number }) => {
  const camera = useThree((s) => s.camera);
  placeCamera(camera, t, aspect);
  return null;
};

const Overlays = ({ f3, u }: { f3: number; u: number }) => {
  const S = CONFIG.scene3;
  const items = CONFIG.workTypes;
  const listStart = sec(S.listStart);
  const lastIdx = items.length - 1;
  const listOutStart = listStart + sec(lastIdx * S.perItem + S.lastHold);
  const listOutEnd = listOutStart + sec(S.listFadeOut);
  const statsStart = listOutEnd + sec(S.pauseBeforeStats);

  const itemIn = (i: number) => clamp01((f3 - (listStart + sec(i * S.perItem))) / 18);
  const listOut = 1 - clamp01((f3 - listOutStart) / sec(S.listFadeOut));

  return (
    <>
      {/* gradasi gelap di bawah supaya teks terbaca */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(to bottom, rgba(2,3,16,0) 50%, rgba(2,3,16,0.9) 100%)",
          opacity: clamp01((f3 - sec(S.listStart - 1.2)) / 30),
        }}
      />
      {/* "Power plants · Boilers · Water treatment · Piping · and more" */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 130 * u,
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: `0 ${20 * u}px`,
          padding: `0 ${60 * u}px`,
          fontFamily: FONT,
          fontWeight: 400,
          fontSize: 50 * u,
          color: COLORS.white,
          textShadow: "0 2px 18px rgba(0,0,12,0.85)",
          opacity: listOut,
        }}
      >
        {items.map((text, i) => (
          <span
            key={text}
            style={{ opacity: itemIn(i), transform: `translateY(${(1 - itemIn(i)) * 12 * u}px)`, display: "inline-flex", gap: 20 * u }}
          >
            {text}
            {i < lastIdx && <span style={{ color: COLORS.cyan }}>·</span>}
          </span>
        ))}
      </div>
      {/* counter: Projects, Clients, Locations */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 96 * u,
          display: "flex",
          justifyContent: "center",
          gap: 130 * u,
          fontFamily: FONT,
          color: COLORS.white,
        }}
      >
        {CONFIG.stats.map((s, i) => {
          const t0 = statsStart + sec(i * S.statStagger);
          const op = clamp01((f3 - t0) / 20);
          const v = Math.round(s.value * Easing.out(Easing.cubic)(clamp01((f3 - t0) / sec(S.statRise))));
          return (
            <div key={s.label} style={{ opacity: op, transform: `translateY(${(1 - op) * 16 * u}px)`, textAlign: "center", minWidth: 230 * u }}>
              <div style={{ height: 2 * u, width: 56 * u, background: COLORS.cyan, margin: `0 auto ${16 * u}px` }} />
              <div style={{ fontSize: 108 * u, fontWeight: 600, lineHeight: 1 }}>
                {v}
                {s.suffix}
              </div>
              <div style={{ fontSize: 28 * u, letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 10 * u, color: "#bfe6fb" }}>
                {s.label}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export const Scene23Globe = ({ from }: { from: number }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  const aspect = width / height;

  const gf = frame + from; // frame global
  const t = gf / FPS; // detik sejak awal video
  const f3 = gf - sec(SCENES.s3[0]); // frame sejak awal adegan 3
  const S = CONFIG.scene3;

  // garis batas provinsi fade in tipis bersamaan dengan peta mendatar
  const [of0, of1] = CONFIG.globe.journey.outlineFade;
  const outlineFade = Easing.inOut(Easing.sin)(clamp01((t - of0) / (of1 - of0)));

  const fadeIn = Easing.inOut(Easing.sin)(clamp01((t - EARTH_FADE_IN_AT_SEC) / CONFIG.globe.earthFadeInSeconds));

  return (
    <AbsoluteFill style={{ background: COLORS.black }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: CONFIG.globe.journey.from.fov, near: 0.05, far: 400, position: [0, 0, 8] }}>
        <color attach="background" args={["#000004"]} />
        <CameraRig t={t} aspect={aspect} />
        <Stars />
        <group rotation={[0, spinAt(t), 0]}>
          <EarthSurface />
          <Clouds t={t} />
          <Outlines opacity={CONFIG.globe.outlineOpacity * outlineFade} />
          <Dots f={f3} t={t} aspect={aspect} height={height} />
        </group>
        <Atmosphere />
        <Post />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 58%, rgba(0,0,8,0.5) 100%)", pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: COLORS.black, opacity: 1 - fadeIn }} />
      <HubLabel f3={f3} t={t} aspect={aspect} width={width} height={height} u={u} />
      <Overlays f3={f3} u={u} />
    </AbsoluteFill>
  );
};

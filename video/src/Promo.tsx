import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import manifest from "./photosManifest.json";
import { CONFIG, EARTH_FADE_IN_AT, SCENES, sec } from "./config";
import { COLORS } from "./theme";
import { Scene1Tagline } from "./scenes/Scene1Tagline";
import { Scene23Globe } from "./scenes/Scene23Globe";
import { Scene4Search } from "./scenes/Scene4Search";
import { Scene58Web } from "./scenes/Scene58Web";
import "./web.css";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Bumi mulai fade in saat baris 2 selesai (EARTH_FADE_IN_AT); teks adegan 1 tetap di atasnya sambil memudar.
// Bumi (adegan 2-3) tetap dirender dan terus bergerak maju sedikit melewati batas adegan 3, di belakang jendela browser (adegan 4).
const S4_START = sec(SCENES.s4[0]);
const GLOBE_END = S4_START + sec(CONFIG.scene4.backdrop.globeEnd);

export const Promo = () => {
  const frame = useCurrentFrame();
  // saat jendela browser naik, Bumi di belakangnya meredup dan mengabur supaya jendela menonjol
  const B = CONFIG.scene4.backdrop;
  const k = clamp01((frame - S4_START) / sec(B.dimSeconds));
  return (
    <AbsoluteFill style={{ background: COLORS.black }}>
      {/* Adegan 1-4 dirancang dengan gaya inline tanpa reset Tailwind: pertahankan box-sizing lama */}
      <AbsoluteFill className="legacy-box">
      {/* Adegan 2 + 3: satu kamera 3D yang bersambung */}
      <AbsoluteFill style={{ filter: k > 0 ? `blur(${k * B.blurPx}px) brightness(${1 - (1 - B.brightness) * k})` : undefined }}>
        <Sequence from={EARTH_FADE_IN_AT} durationInFrames={GLOBE_END - EARTH_FADE_IN_AT}>
          <Scene23Globe from={EARTH_FADE_IN_AT} />
        </Sequence>
      </AbsoluteFill>
      {/* Adegan 4: layar miring dan pencarian */}
      <Sequence from={S4_START} durationInFrames={sec(SCENES.s4[1] - SCENES.s4[0])}>
        <Scene4Search />
      </Sequence>
      <Sequence from={sec(SCENES.s1[0])} durationInFrames={sec(SCENES.s1[1] - SCENES.s1[0])}>
        <Scene1Tagline />
      </Sequence>
      </AbsoluteFill>
      {/* Adegan 5-8: halaman web (komponen web asli) di dalam jendela browser */}
      <Sequence from={sec(SCENES.s5[0])} durationInFrames={sec(SCENES.s9[1]) - sec(SCENES.s5[0])}>
        <Scene58Web />
      </Sequence>
      {/* Audio: hanya dirender bila file ada di video/public/audio (music.* / voiceover.*) */}
      {(["music", "voiceover"] as const).map((k) => {
        const src = (manifest.audio as Record<string, string | null>)[k];
        if (!src) return null;
        const a = CONFIG.audio[k];
        const total = sec(SCENES.s9[1]);
        const fadeFrom = total - sec(a.fadeOutSeconds);
        return <Audio key={k} src={staticFile(src.slice(1))} volume={(f) => a.volume * (f < fadeFrom ? 1 : Math.max(0, (total - f) / sec(a.fadeOutSeconds)))} />;
      })}
    </AbsoluteFill>
  );
};

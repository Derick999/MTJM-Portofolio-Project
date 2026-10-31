import { AbsoluteFill, Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { CONFIG, sec } from "../config";
import { SCENE4_SCRIPT, scene4State } from "../script";
import { COLORS } from "../theme";
import { BrowserWindow } from "../ui/BrowserWindow";
import { Cursor } from "../ui/Cursor";
import { SearchPage } from "../ui/SearchPage";
import { WIN } from "../ui/layout";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Adegan 4 (0:30-0:36): jendela browser tiruan SLIDE UP dari bawah frame (miring, tanpa fade in, solid sejak frame pertama),
 * naik dengan ease-out tegas, lalu kamera meluruskan layar. Setelah itu kursor mengklik kolom pencarian, mengetik, Enter,
 * dan mengklik hasil pertama (urutan di script.ts). Parameter di CONFIG.scene4.
 */
export const Scene4Search = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const state = scene4State(frame);
  const S = CONFIG.scene4;

  // latar navy menutupi Bumi (yang meredup dan mengabur di Promo.tsx) setelah jendela naik
  const bg = clamp01((frame - sec(S.backdrop.navyFrom)) / sec(S.backdrop.navyDuration));

  // 1) slide up: dari bawah frame ke pose miring, ease-out tegas (cepat di awal, mengendap halus)
  const slide = Easing.out(Easing.poly(5))(clamp01(frame / sec(S.slideUp.duration)));
  // 2) kamera meluruskan layar (ease-in-out), mulai tepat sebelum slide selesai
  const fly = Easing.inOut(Easing.cubic)(clamp01((frame - sec(S.straighten.start)) / sec(S.straighten.duration)));
  // 3) setelah lurus, kamera terus maju pelan sampai akhir adegan
  const push = 1 + 0.045 * Easing.inOut(Easing.sin)(clamp01((frame - sec(1.2)) / sec(4.8)));
  const fit = Math.min(1, (width * 0.88) / WIN.w, (height * 0.88) / WIN.h);

  const T = S.tilt;
  const tx = lerp(T.x, 0, fly);
  const ty = lerp(S.slideUp.fromY, T.y, slide) * (1 - fly);
  const tz = lerp(T.z, 0, fly);
  const ry = lerp(T.rotY, 0, fly);
  const rx = lerp(T.rotX, 0, fly);
  const rz = lerp(T.rotZ, 0, fly);

  const loaded = state.navigating > 0.35;
  const tabTitle = loaded ? CONFIG.search.results[0].title : state.results > 0.5 ? CONFIG.searchQuery : CONFIG.search.tabTitleBefore;
  const address = loaded ? CONFIG.search.results[0].url : state.results > 0 ? CONFIG.search.addressResults : CONFIG.search.addressBefore;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: bg, background: `radial-gradient(ellipse at 50% 45%, #14186a 0%, ${COLORS.navyDeep} 55%, #02030f 100%)` }} />
      <AbsoluteFill style={{ perspective: 1900, perspectiveOrigin: "50% 50%" }}>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: WIN.w,
            height: WIN.h,
            transformStyle: "preserve-3d",
            transform: `translate(-50%, -50%) translate3d(${tx}px, ${ty}px, ${tz}px) rotateY(${ry}deg) rotateX(${rx}deg) rotateZ(${rz}deg) scale(${fit * push})`,
          }}
        >
          <BrowserWindow tabTitle={tabTitle} address={address} progress={state.navigating > 0 ? state.navigating : 0}>
            <SearchPage frame={frame} state={state} />
          </BrowserWindow>
          {/* kursor berada di koordinat jendela, jadi ikut miring bersama jendela */}
          <Cursor frame={frame} steps={SCENE4_SCRIPT} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

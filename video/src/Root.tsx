import { Composition } from "remotion";
import { Promo } from "./Promo";
import { FPS, SCENES, sec } from "./config";

// Adegan 1-9. Durasi akhir mengikuti penutup (CONFIG.scene9).
const DURATION = sec(SCENES.s9[1]);

export const Root = () => (
  <>
    <Composition id="Promo-16x9" component={Promo} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
    <Composition id="Promo-1x1" component={Promo} durationInFrames={DURATION} fps={FPS} width={1080} height={1080} />
  </>
);

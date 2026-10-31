import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CONFIG, sec } from "../config";
import { COLORS, FONT } from "../theme";

// Fade in murni, dua baris bertahap. Semua timing dari CONFIG.opening.
export const Scene1Tagline = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  const o = CONFIG.opening;

  const fadeIn = sec(o.fadeIn);
  const start1 = sec(o.startDelay);
  const start2 = start1 + fadeIn + sec(o.gap);
  const fadeOutStart = start2 + fadeIn + sec(o.hold);
  const lineOp = (start: number) => interpolate(frame, [start, start + fadeIn], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outOp = interpolate(frame, [fadeOutStart, Math.min(fadeOutStart + sec(o.fadeOut), durationInFrames)], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const style = {
    fontFamily: FONT,
    fontWeight: 300,
    fontSize: 64 * u,
    lineHeight: 1.3,
    letterSpacing: "0.01em",
    color: COLORS.white,
    textAlign: "center" as const,
  };

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: outOp }}>
      <div style={{ ...style, opacity: lineOp(start1) }}>{CONFIG.openingLines[0]}</div>
      <div style={{ ...style, opacity: lineOp(start2) }}>{CONFIG.openingLines[1]}</div>
    </AbsoluteFill>
  );
};

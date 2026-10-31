import { Easing } from "remotion";
import { sec } from "../config";
import { clickFrames, cursorAt, type Step } from "../script";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export interface CursorClick {
  frame: number;
  x: number;
  y: number;
}

/**
 * Tampilan kursor: panah + efek klik (kursor sedikit menekan dan riak kecil melebar). Koordinat = koordinat jendela,
 * jadi ikut bergerak/miring bersama jendela. Posisi dan klik dihitung oleh pemanggil.
 */
export const CursorView = ({ frame, x, y, clicks, opacity = 1 }: { frame: number; x: number; y: number; clicks: CursorClick[]; opacity?: number }) => {
  const press = Math.max(0, ...clicks.map((c) => 1 - clamp01(Math.abs(frame - (c.frame + sec(0.04))) / sec(0.12))));
  return (
    <div style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity, zIndex: 50 }}>
      {clicks.map((c) => {
        const age = (frame - c.frame) / sec(0.45);
        if (age < 0 || age > 1) return null;
        const e = Easing.out(Easing.cubic)(age);
        const d = 14 + 54 * e;
        return (
          <div
            key={c.frame}
            style={{
              position: "absolute",
              left: c.x - d / 2,
              top: c.y - d / 2,
              width: d,
              height: d,
              borderRadius: "50%",
              border: "3px solid rgba(24,135,205,0.85)",
              background: "rgba(24,135,205,0.12)",
              opacity: 1 - age,
            }}
          />
        );
      })}
      <svg
        width={36}
        height={42}
        viewBox="0 0 24 28"
        style={{
          position: "absolute",
          left: x - 3,
          top: y - 2,
          transform: `scale(${1 - 0.12 * press})`,
          transformOrigin: "3px 2px",
          filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.35))",
        }}
      >
        <path d="M3 2 L3 21 L8 16.5 L11.5 24.5 L15 23 L11.6 15.2 L18.5 15 Z" fill="#ffffff" stroke="#14144a" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/** Kursor adegan 4: posisi dan klik dibaca dari skrip adegan 4 (script.ts). */
export const Cursor = ({ frame, steps }: { frame: number; steps: Step[] }) => {
  const { x, y } = cursorAt(frame, steps);
  const clicks = clickFrames(steps).map((c) => ({ frame: c, ...cursorAt(c, steps) }));
  const visible = clamp01((frame - sec(0.3)) / sec(0.25));
  return <CursorView frame={frame} x={x} y={y} clicks={clicks} opacity={visible} />;
};

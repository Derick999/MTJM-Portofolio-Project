import { Easing } from "remotion";
import { CONFIG } from "../config";
import type { Scene4State } from "../script";
import { COLORS, FONT } from "../theme";
import { PAGE } from "./layout";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = Easing.inOut(Easing.cubic);

/** Halaman pencarian tiruan: kolom di tengah -> (Enter) kolom naik dan hasil muncul. */
export const SearchPage = ({ frame, state }: { frame: number; state: Scene4State }) => {
  const e = ease(state.results);
  const B = PAGE.fieldBefore;
  const A = PAGE.fieldAfter;
  const cx = lerp(B.cx, A.cx, e);
  const cy = lerp(B.cy, A.cy, e);
  const w = lerp(B.w, A.w, e);
  const h = lerp(B.h, A.h, e);
  const caretOn = state.focused && Math.floor(frame / 16) % 2 === 0;
  const showPlaceholder = state.typed.length === 0;
  const S = CONFIG.search;

  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: FONT, background: "linear-gradient(180deg,#ffffff 0%,#f4f7fb 100%)" }}>
      {/* kolom pencarian */}
      <div
        style={{
          position: "absolute",
          left: cx - w / 2,
          top: cy - h / 2,
          width: w,
          height: h,
          borderRadius: h / 2,
          background: "#ffffff",
          border: `1.5px solid ${state.focused ? COLORS.brand : "#d5dbe4"}`,
          boxShadow: state.focused ? "0 6px 28px rgba(24,135,205,0.28)" : "0 3px 14px rgba(20,20,74,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: `0 ${h * 0.4}px`,
          fontSize: lerp(28, 25, e),
          color: "#14233f",
          whiteSpace: "nowrap",
        }}
      >
        <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#6b7587" strokeWidth={2.2} strokeLinecap="round" style={{ flex: "none" }}>
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M15.5 15.5 L21 21" />
        </svg>
        <span style={{ color: showPlaceholder ? "#8a94a6" : "#14233f" }}>{showPlaceholder ? S.placeholder : state.typed}</span>
        {!showPlaceholder || state.focused ? (
          <span style={{ width: 2.5, height: "1.15em", marginLeft: -12, background: "#14233f", opacity: caretOn ? 1 : 0 }} />
        ) : null}
      </div>

      {/* hasil */}
      <div
        style={{
          position: "absolute",
          left: PAGE.resultsX,
          top: PAGE.resultsY,
          opacity: state.results,
          transform: `translateY(${(1 - state.results) * 26}px)`,
        }}
      >
        {S.results.map((r, i) => (
          <div key={r.url} style={{ width: 920, height: PAGE.resultGap }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 19, color: "#4d5a70" }}>
              <span style={{ width: 24, height: 24, borderRadius: "50%", background: i === 0 ? COLORS.brand : COLORS.navy, flex: "none" }} />
              {r.url}
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 31,
                fontWeight: 500,
                color: "#0b6aa8",
                textDecoration: i === 0 && state.hoverResult ? "underline" : "none",
                lineHeight: 1.25,
              }}
            >
              {r.title}
            </div>
            <div style={{ marginTop: 8, fontSize: 21, lineHeight: 1.5, color: "#4a5a75", maxWidth: 820 }}>{r.description}</div>
          </div>
        ))}
      </div>

      {/* membuka hasil: halaman memutih (loading) */}
      <div style={{ position: "absolute", inset: 0, background: "#ffffff", opacity: Easing.in(Easing.quad)(state.navigating) }} />
    </div>
  );
};

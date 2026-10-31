import type { ReactNode } from "react";
import { FONT } from "../theme";
import { WIN } from "./layout";

/** Jendela browser tiruan (netral, tanpa merek): tab, tombol navigasi, bilah alamat, dan area halaman. */
export const BrowserWindow = ({
  tabTitle,
  address,
  progress,
  children,
}: {
  tabTitle: string;
  address: string;
  /** 0..1 bilah loading di bawah toolbar (0 = tidak tampil) */
  progress: number;
  children: ReactNode;
}) => (
  <div
    style={{
      position: "relative",
      width: WIN.w,
      height: WIN.h,
      borderRadius: 18,
      overflow: "hidden",
      background: "#ffffff",
      fontFamily: FONT,
      boxShadow: "0 50px 140px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.14), 0 0 120px rgba(29,199,244,0.12)",
    }}
  >
    {/* strip tab */}
    <div style={{ height: 42, background: "#dde1e7", display: "flex", alignItems: "flex-end", paddingLeft: 22 }}>
      <div style={{ display: "flex", gap: 9, alignSelf: "center", marginRight: 34 }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <span key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c }} />
        ))}
      </div>
      <div
        style={{
          width: 330,
          height: 34,
          background: "#ffffff",
          borderRadius: "11px 11px 0 0",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 16px",
          fontSize: 14.5,
          color: "#2a3345",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        <span style={{ width: 14, height: 14, borderRadius: 4, background: "#1887cd", flex: "none" }} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{tabTitle}</span>
      </div>
    </div>
    {/* toolbar */}
    <div
      style={{
        height: WIN.chrome - 42,
        background: "#ffffff",
        borderBottom: "1px solid #dfe3e8",
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "0 22px",
        position: "relative",
      }}
    >
      <span style={{ display: "flex", gap: 14, color: "#6b7587" }}>
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 5 L8 12 L15 19" />
        </svg>
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" opacity={0.45}>
          <path d="M9 5 L16 12 L9 19" />
        </svg>
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 12 A8 8 0 1 1 17.6 6.4" />
          <path d="M20 4 L20 9 L15 9" />
        </svg>
      </span>
      <div
        style={{
          flex: 1,
          height: 30,
          borderRadius: 15,
          background: "#eef1f5",
          display: "flex",
          alignItems: "center",
          padding: "0 18px",
          fontSize: 15,
          color: "#3b4658",
          gap: 10,
        }}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#7a8599" strokeWidth={2.4} strokeLinecap="round">
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11 V8 a4 4 0 0 1 8 0 V11" />
        </svg>
        <span>{address}</span>
      </div>
      {progress > 0 && progress < 1 && <div style={{ position: "absolute", left: 0, bottom: -1, height: 3, width: `${progress * 100}%`, background: "#1887cd" }} />}
    </div>
    {/* halaman */}
    <div style={{ position: "relative", width: WIN.w, height: WIN.h - WIN.chrome, overflow: "hidden", background: "#ffffff" }}>{children}</div>
  </div>
);

import * as THREE from "three";
import { CONFIG, FPS } from "../../config";
import { COLORS, FONT } from "../../theme";
import { getCameraState, R, TARGET, toVec } from "./cameraPath";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Posisi layar (piksel) sebuah titik lat/lng pada waktu t, memakai kamera yang sama dengan render 3D. */
export const projectToScreen = (lat: number, lng: number, t: number, aspect: number, width: number, height: number) => {
  const s = getCameraState(t, aspect);
  const cam = new THREE.PerspectiveCamera(s.fov, aspect, 0.05, 400);
  cam.position.copy(s.position);
  cam.up.copy(s.up);
  cam.lookAt(TARGET);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  const v = toVec(lat, lng, R * 1.003).project(cam);
  return { x: ((v.x + 1) / 2) * width, y: ((1 - v.y) / 2) * height };
};

/**
 * Label kecil di samping titik Bekasi dengan garis tipis penghubung. Teks dan waktu dari CONFIG.hub.label.
 * f3 = frame sejak awal adegan 3.
 */
export const HubLabel = ({ f3, t, aspect, width, height, u }: { f3: number; t: number; aspect: number; width: number; height: number; u: number }) => {
  const L = CONFIG.hub.label;
  const D = CONFIG.scene3.dots;
  const sec = f3 / FPS;
  const inStart = D.hubStart; // bersamaan dengan denyut pertama
  const outStart = D.hubStart + D.hubHold; // saat gelombang pertama mulai muncul
  const opacity = clamp01((sec - inStart) / L.fadeIn) * (1 - clamp01((sec - outStart) / L.fadeOut));
  if (opacity <= 0.001) return null;

  const hub = projectToScreen(CONFIG.hub.lat, CONFIG.hub.lng, t, aspect, width, height);
  const A = { x: hub.x + L.offset.dx * u, y: hub.y + L.offset.dy * u }; // ujung garis diagonal = awal garis bawah teks
  // garis mulai sedikit di luar tepi titik (supaya tidak menutup titik) menuju A
  const dx = A.x - hub.x;
  const dy = A.y - hub.y;
  const len = Math.hypot(dx, dy);
  const gap = 24 * u;
  const start = { x: hub.x + (dx / len) * gap, y: hub.y + (dy / len) * gap };
  // garis tumbuh dari titik ke label selama fade in
  const grow = clamp01((sec - inStart) / (L.fadeIn * 1.4));
  const end = { x: start.x + (A.x - start.x) * grow, y: start.y + (A.y - start.y) * grow };

  return (
    <div style={{ position: "absolute", inset: 0, opacity, pointerEvents: "none" }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={COLORS.cyan} strokeWidth={1.6 * u} strokeLinecap="round" opacity={0.9} />
      </svg>
      {/* teks bertumpu di garis bawah yang berakhir di A (sudut kanan-bawah kotak = A) */}
      <div
        style={{
          position: "absolute",
          left: A.x,
          top: A.y,
          transform: "translate(-100%, -100%)",
          padding: `0 ${14 * u}px ${8 * u}px ${6 * u}px`,
          borderBottom: `${1.6 * u}px solid ${COLORS.cyan}`,
          fontFamily: FONT,
          fontWeight: 500,
          fontSize: 28 * u,
          letterSpacing: "0.02em",
          color: COLORS.white,
          whiteSpace: "nowrap",
          textShadow: "0 2px 14px rgba(0,0,12,0.9)",
        }}
      >
        {L.text}
      </div>
    </div>
  );
};

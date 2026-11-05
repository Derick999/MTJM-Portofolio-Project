"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import { B, Ball, C, CX, Cone, Flange, IBeam, Ladder, Pipe, Stairs, Valve, COL, mat, type V3 } from "./prims";
import { Inst, type InstItem } from "./instances";
import { usePerf } from "./perf";

// Lokasi (site) pipa dan pompa yang luas: pipe rack layang dua tingkat, delapan jalur pipa, stasiun valve, area pompa di kiri,
// dua tangki di kanan. Semua bagian berulang (penyangga, flange, pita insulasi, kisi, tiang pagar) memakai instancing.
const CARBON = "#7b8591";
const INSUL = "#d5dae0";
const STAINLESS = "#e6eaee";
const HDPE = "#23262b";

const FRAMES = [-8, -4, 0, 4, 8, 12];
const LOW = 2.0; // as balok melintang tingkat bawah
const UP = 3.66; // tingkat atas
const GND = 0.12; // permukaan slab

interface Line {
  r: number;
  c: string;
  metal?: number;
  rough?: number;
  /** titik jalur; belokan diberi bola kecil (siku) */
  pts: V3[];
  /** posisi x tempat flange berpasangan dipasang di sepanjang rack */
  flanges?: number[];
  bands?: boolean;
}

const LINES: Line[] = [
  // tingkat bawah
  { r: 0.2, c: CARBON, pts: [[-10.9, 0.9, -1], [-10.9, 2.36, -1], [12.2, 2.36, -1]] },
  { r: 0.18, c: INSUL, metal: 0.7, rough: 0.35, bands: true, pts: [[-10.2, 1.7, -0.45], [-10.2, 2.34, -0.45], [12.2, 2.34, -0.45]] },
  { r: 0.12, c: STAINLESS, metal: 0.9, rough: 0.25, pts: [[-8.4, 2.28, 0.1], [12.2, 2.28, 0.1]] },
  { r: 0.15, c: HDPE, metal: 0.1, rough: 0.8, pts: [[-8.4, 2.31, 0.65], [12.2, 2.31, 0.65]] },
  // tingkat atas
  { r: 0.22, c: INSUL, metal: 0.7, rough: 0.35, bands: true, pts: [[-8.4, 4.04, -1.05], [12.2, 4.04, -1.05]] },
  { r: 0.4, c: COL.blue, pts: [[-8.4, 4.22, -0.3], [13.6, 4.22, -0.3], [13.6, 1.2, -0.3]] }, // pipa pendingin utama, turun ke manifold
  // expansion loop di bay 4, lalu turun ke tanah
  { r: 0.16, c: STAINLESS, metal: 0.9, rough: 0.25, pts: [[-8.4, 3.98, 0.45], [2.6, 3.98, 0.45], [2.6, 4.9, 0.45], [3.8, 4.9, 0.45], [3.8, 3.98, 0.45], [12.8, 3.98, 0.45], [12.8, 0.35, 0.45]] },
  { r: 0.2, c: HDPE, metal: 0.1, rough: 0.8, pts: [[-8.4, 4.02, 1.05], [12.8, 4.02, 1.05], [12.8, 0.35, 1.05]] },
];
const FLANGE_X = [-6, 6];

/** Semua elemen berulang dikumpulkan sekali (bukan per render). */
function useInstances() {
  return useMemo(() => {
    const shoes: InstItem[] = [];
    const discs: InstItem[] = [];
    const bands: InstItem[] = [];
    for (const l of LINES) {
      // ketinggian dan posisi z jalur pada rack = titik pertama yang berada di atas tanah (y > 2)
      const rackPt = l.pts.find((p) => p[1] > 2)!;
      const y = rackPt[1];
      const z = rackPt[2];
      const top = y > 3 ? UP + 0.1 : LOW + 0.1;
      const xs = [Math.min(...l.pts.map((p) => p[0])), Math.max(...l.pts.map((p) => p[0]))];
      for (const fx of FRAMES) if (fx >= xs[0] - 0.01 && fx <= xs[1] + 0.01) shoes.push({ p: [fx, top + 0.03, z], s: [0.5, 0.06, l.r * 1.8] });
      for (const fx of FLANGE_X) for (const dx of [-0.07, 0.07]) discs.push({ p: [fx + dx, y, z], s: [l.r * 1.5, 0.07, l.r * 1.5], rot: [0, 0, Math.PI / 2] });
      if (l.bands) for (let x = Math.ceil(xs[0]); x <= xs[1]; x += 1) bands.push({ p: [x, y, z], s: [l.r * 1.1, 0.06, l.r * 1.1], rot: [0, 0, Math.PI / 2] });
    }
    // kolom + base plate, kisi walkway, braket, tiang pagar, garis slab
    const legs: InstItem[] = [];
    const plates: InstItem[] = [];
    const brackets: InstItem[] = [];
    for (const x of FRAMES)
      for (const z of [-1.55, 1.55]) {
        legs.push({ p: [x, GND + 2.2, z], s: [0.2, 4.4, 0.2] });
        plates.push({ p: [x, GND + 0.025, z], s: [0.5, 0.05, 0.5] });
      }
    for (const x of FRAMES) brackets.push({ p: [x, 3.5, -2.05], s: [0.1, 0.1, 1.1] });
    const grating: InstItem[] = [];
    for (let x = -8; x <= 13.6; x += 0.5) grating.push({ p: [x, 3.66, -2.05], s: [0.04, 0.04, 1.0] });
    const posts: InstItem[] = [];
    for (let x = -8; x <= 13.6; x += 1.4) posts.push({ p: [x, 4.12, -2.55], s: [0.04, 1.0, 0.04] });
    const lines: InstItem[] = [
      { p: [1.15, GND + 0.005, -6.2], s: [32, 0.01, 0.12] },
      { p: [1.15, GND + 0.005, 6.2], s: [32, 0.01, 0.12] },
      { p: [-15, GND + 0.005, 0], s: [0.12, 0.01, 12.4] },
      { p: [17.2, GND + 0.005, 0], s: [0.12, 0.01, 12.4] },
    ];
    const joints: InstItem[] = [-12, -4, 4, 12].map((x) => ({ p: [x, GND + 0.005, 0], s: [0.05, 0.01, 14] }));
    return { shoes, discs, bands, legs, plates, brackets, grating, posts, lines, joints };
  }, []);
}

function PipeLine({ l }: { l: Line }) {
  return (
    <>
      {l.pts.slice(1).map((pt, i) => (
        <Pipe key={i} a={l.pts[i]} b={pt} r={l.r} c={l.c} metal={l.metal} rough={l.rough} seg={12} />
      ))}
      {l.pts.slice(1, -1).map((pt, i) => (
        <Ball key={`j${i}`} p={pt} r={l.r * 1.15} c={l.c} metal={l.metal} rough={l.rough} />
      ))}
    </>
  );
}

function Pump({ z }: { z: number }) {
  return (
    <group position={[-12.6, GND, z]}>
      <B p={[-0.6, 0.08, 0]} s={[3.6, 0.16, 1.3]} c={COL.darkSteel} />
      <CX p={[-1.5, 0.9 - GND, 0]} r={0.5} h={1.4} c={COL.blue} seg={16} />
      <CX p={[-2.3, 0.9 - GND, 0]} r={0.42} h={0.3} c={COL.darkSteel} seg={16} />
      <B p={[-1.4, 1.55, 0]} s={[0.4, 0.3, 0.4]} c={COL.darkSteel} />
      <CX p={[-0.5, 0.9 - GND, 0]} r={0.2} h={0.5} c={COL.yellow} />
      <CX p={[0.3, 0.9 - GND, 0]} r={0.5} h={0.6} c={COL.steel} seg={16} />
      <CX p={[0.9, 0.9 - GND, 0]} r={0.2} h={0.5} c={COL.steel} />
      <C p={[0.3, 1.38, 0]} r={0.15} h={0.4} c={COL.steel} />
      <Flange p={[0.3, 1.6, 0]} r={0.24} axis="y" />
      <Flange p={[1.2, 0.9 - GND, 0]} r={0.3} axis="x" />
    </group>
  );
}

function Butterfly({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <CX r={0.3} h={0.22} c={COL.darkSteel} seg={14} />
      <B p={[0, 0.34, 0]} s={[0.2, 0.2, 0.2]} c={COL.darkSteel} />
      <B p={[0, 0.5, 0]} s={[0.1, 0.1, 0.55]} c={COL.yellow} />
    </group>
  );
}

function Tank({ x, z, r, h, c }: { x: number; z: number; r: number; h: number; c: string }) {
  const top = GND + h;
  return (
    <group>
      <C p={[x, GND + h / 2, z]} r={r} h={h} c={c} seg={22} metal={0.3} />
      {[0.25, 0.5, 0.75].map((k) => (
        <C key={k} p={[x, GND + h * k, z]} r={r * 1.02} h={0.07} c={COL.darkSteel} seg={22} />
      ))}
      <Cone p={[x, top + 0.35, z]} r={r * 1.04} h={0.7} c={COL.steel} />
      <mesh position={[x, top + 0.06, z]} rotation={[Math.PI / 2, 0, 0]} material={mat(COL.yellow, 0.2, 0.6)} castShadow>
        <torusGeometry args={[r * 0.99, 0.03, 4, 22]} />
      </mesh>
      <Ladder p={[x - r - 0.04, GND, z + 0.8]} h={h} />
      <CX p={[x - r - 0.08, GND + 0.8, z - 0.7]} r={0.26} h={0.16} c={COL.darkSteel} />
      <Pipe a={[x + r + 0.06, 0.5, z]} b={[x + r + 0.06, top - 0.4, z]} r={0.04} c={COL.glass} seg={6} />
    </group>
  );
}

function Sign({ p, rot = 0 }: { p: V3; rot?: number }) {
  return (
    <group position={p} rotation={[0, rot, 0]}>
      <C p={[0, 0.8, 0]} r={0.03} h={1.6} c={COL.steel} seg={6} />
      <B p={[0, 1.5, 0.04]} s={[0.7, 0.55, 0.04]} c={COL.yellow} />
      <B p={[0, 1.58, 0.07]} s={[0.5, 0.08, 0.02]} c={COL.black} />
      <B p={[0, 1.42, 0.07]} s={[0.3, 0.08, 0.02]} c={COL.black} />
    </group>
  );
}

/** Titik pengelasan: bola berpendar yang berkedip pelan (statis di perangkat lemah). */
function WeldSpark({ p }: { p: V3 }) {
  const { weak } = usePerf();
  const core = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (weak || !core.current) return;
    const t = clock.elapsedTime;
    core.current.emissiveIntensity = 1.2 + 2.4 * (0.5 + 0.5 * Math.sin(t * 5) * Math.sin(t * 3.1));
  });
  return (
    <group position={p}>
      <mesh>
        <sphereGeometry args={[0.09, 10, 8]} />
        <meshStandardMaterial ref={core} color="#e4f4ff" emissive="#7cc8ff" emissiveIntensity={2.4} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.22, 10, 8]} />
        <meshStandardMaterial color="#8fd0ff" transparent opacity={0.22} depthWrite={false} emissive="#7cc8ff" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

export function PipingModel() {
  const inst = useInstances();
  return (
    <group position={[-1, 0, 0]}>
      {/* slab beton bergaris */}
      <B p={[1.15, 0.06, 0]} s={[33.3, 0.12, 14]} c={COL.concrete} metal={0.05} rough={0.9} />
      <Inst items={inst.joints} c="#4a4f57" metal={0} rough={1} />
      <Inst items={inst.lines} c={COL.yellow} metal={0} rough={0.8} />

      {/* ===== pipe rack: 6 portal (5 bay), dua tingkat ===== */}
      <Inst items={inst.legs} c={COL.frame} />
      <Inst items={inst.plates} c={COL.darkSteel} />
      {FRAMES.map((x) => (
        <group key={x}>
          <IBeam p={[x, LOW, 0]} len={3.1} size={0.2} rot={[0, Math.PI / 2, 0]} />
          <IBeam p={[x, UP, 0]} len={3.1} size={0.2} rot={[0, Math.PI / 2, 0]} />
        </group>
      ))}
      {[LOW, UP].flatMap((y) => [-1.55, 1.55].map((z) => <IBeam key={`${y}${z}`} p={[2, y, z]} len={20} size={0.14} />))}
      {[[-8, -4], [8, 12]].flatMap(([a, b]) =>
        [-1.55, 1.55].flatMap((z) => [
          <Pipe key={`${a}${z}p`} a={[a, 0.25, z]} b={[b, LOW - 0.1, z]} r={0.03} c={COL.frame} seg={5} />,
          <Pipe key={`${a}${z}q`} a={[a, LOW - 0.1, z]} b={[b, 0.25, z]} r={0.03} c={COL.frame} seg={5} />,
        ]),
      )}

      {/* ===== jalur pipa: karbon, insulasi, stainless, HDPE, pipa pendingin utama ===== */}
      {LINES.map((l, i) => (
        <PipeLine key={i} l={l} />
      ))}
      <Inst items={inst.shoes} c={COL.darkSteel} />
      <Inst kind="cyl" items={inst.discs} c="#aab2bc" metal={0.7} rough={0.4} />
      <Inst kind="cyl" items={inst.bands} c={COL.darkSteel} />
      <Valve p={[-2, 2.36, -1]} r={0.1} axis="x" c={COL.red} />
      <Valve p={[9, 2.31, 0.65]} r={0.1} axis="x" c={COL.yellow} />
      <Valve p={[-5, 3.98, 0.45]} r={0.12} axis="x" c={COL.yellow} />
      <Butterfly p={[6, 4.22, -0.3]} />

      {/* walkway + pagar + tangga di sepanjang rack */}
      <B p={[2.8, 3.62, -2.05]} s={[21.6, 0.05, 1.0]} c={COL.darkSteel} />
      <Inst items={inst.grating} c={COL.steel} />
      <Inst items={inst.brackets} c={COL.frame} />
      <Inst items={inst.posts} c={COL.yellow} />
      <B p={[2.8, 4.62, -2.55]} s={[21.6, 0.04, 0.04]} c={COL.yellow} />
      <B p={[2.8, 4.12, -2.55]} s={[21.6, 0.03, 0.03]} c={COL.yellow} />
      <B p={[2.8, 3.72, -2.55]} s={[21.6, 0.12, 0.03]} c={COL.yellow} />
      <Stairs p={[16.8, GND, -2.05]} h={3.5} w={0.9} dir={-1} steps={14} />

      {/* ===== stasiun valve di tanah (cabang dari jalur karbon) ===== */}
      <Pipe a={[2, 2.36, -1]} b={[2, 2.36, -4.2]} r={0.2} c={CARBON} seg={12} />
      <Pipe a={[2, 2.36, -4.2]} b={[2, 0.65, -4.2]} r={0.2} c={CARBON} seg={12} />
      <Pipe a={[2, 0.65, -4.2]} b={[-4.5, 0.65, -4.2]} r={0.2} c={CARBON} seg={12} />
      <Ball p={[2, 2.36, -1]} r={0.26} c={CARBON} />
      <Ball p={[2, 2.36, -4.2]} r={0.23} c={CARBON} />
      <Ball p={[2, 0.65, -4.2]} r={0.23} c={CARBON} />
      <Valve p={[0.8, 0.65, -4.2]} r={0.12} axis="x" c={COL.red} />
      <Butterfly p={[-1.2, 0.65, -4.2]} />
      <Valve p={[-2.8, 0.65, -4.2]} r={0.12} axis="x" c={COL.yellow} />
      {[1.5, 0.1, -2, -3.7].map((x) => (
        <Flange key={x} p={[x, 0.65, -4.2]} r={0.3} axis="x" />
      ))}
      {[1.3, -0.5, -2, -3.8].map((x) => (
        <B key={x} p={[x, 0.3, -4.2]} s={[0.3, 0.36, 0.45]} c={COL.concrete} />
      ))}
      <Flange p={[-4.5, 0.65, -4.2]} r={0.3} axis="x" />

      {/* ===== area pompa (kiri): dua pompa sentrifugal, suction, discharge + check valve ===== */}
      <Pump z={-3} />
      <Pump z={3} />
      <Pipe a={[-10.9, 0.9, -3.6]} b={[-10.9, 0.9, 3.6]} r={0.22} c={CARBON} seg={12} />
      <Pipe a={[-10.2, 1.7, -3.6]} b={[-10.2, 1.7, 3.6]} r={0.16} c={CARBON} seg={12} />
      {[-3, 3].map((z) => (
        <group key={z}>
          <Pipe a={[-11.4, 0.9, z]} b={[-10.9, 0.9, z]} r={0.17} c={CARBON} seg={10} />
          <Valve p={[-11.15, 0.9, z]} r={0.07} axis="x" c={COL.red} />
          <Pipe a={[-12.3, 1.72, z]} b={[-10.2, 1.72, z]} r={0.12} c={CARBON} seg={10} />
          <Valve p={[-11.4, 1.72, z]} r={0.08} axis="x" c={COL.yellow} />
        </group>
      ))}
      {[-3.4, 0, 3.4].map((z) => (
        <group key={z}>
          <B p={[-10.9, 0.4, z]} s={[0.3, 0.56, 0.3]} c={COL.concrete} />
          <B p={[-10.2, 0.81, z]} s={[0.2, 1.38, 0.2]} c={COL.frame} />
        </group>
      ))}

      {/* ===== ujung kanan: manifold besar dan dua tangki ===== */}
      <Pipe a={[13.6, 1.2, -4.5]} b={[13.6, 1.2, 4.5]} r={0.26} c={CARBON} seg={12} />
      {[-3.5, 0.9, 3.5].map((z) => (
        <B key={z} p={[13.6, 0.53, z]} s={[0.3, 0.82, 0.3]} c={COL.concrete} />
      ))}
      {[-4.5, 4.5].map((z) => (
        <group key={z}>
          <Pipe a={[13.6, 1.2, z]} b={[14.4, 1.2, z]} r={0.2} c={CARBON} seg={10} />
          <Valve p={[14.0, 1.2, z]} r={0.08} axis="x" c={COL.red} />
          <Flange p={[14.3, 1.2, z]} r={0.28} axis="x" />
        </group>
      ))}
      <Tank x={16} z={-4.5} r={1.6} h={3.4} c="#d3dae2" />
      <Tank x={16} z={4.5} r={1.6} h={3.4} c="#9cc3e0" />

      {/* ===== cabang HDPE ke spool + titik pengelasan ===== */}
      <Pipe a={[6, 2.31, 0.65]} b={[6, 2.31, 3.6]} r={0.15} c={HDPE} metal={0.1} rough={0.8} seg={10} />
      <Pipe a={[6, 2.31, 3.6]} b={[6, 0.55, 3.6]} r={0.15} c={HDPE} metal={0.1} rough={0.8} seg={10} />
      <Pipe a={[6, 0.55, 3.6]} b={[3.8, 0.55, 3.6]} r={0.15} c={HDPE} metal={0.1} rough={0.8} seg={10} />
      <Pipe a={[3.2, 0.55, 3.6]} b={[1.5, 0.55, 3.6]} r={0.15} c={HDPE} metal={0.1} rough={0.8} seg={10} />
      <Ball p={[6, 2.31, 3.6]} r={0.18} c={HDPE} metal={0.1} rough={0.8} />
      <Ball p={[6, 0.55, 3.6]} r={0.18} c={HDPE} metal={0.1} rough={0.8} />
      {[5.4, 4.3, 2.7, 1.9].map((x) => (
        <B key={x} p={[x, 0.29, 3.6]} s={[0.25, 0.34, 0.35]} c={COL.concrete} />
      ))}
      <WeldSpark p={[3.5, 0.55, 3.6]} />
      <B p={[4.5, 0.47, 5.3]} s={[0.8, 0.7, 0.5]} c={COL.yellow} />
      <Pipe a={[4.5, 0.6, 5.05]} b={[3.55, 0.6, 3.75]} r={0.02} c={COL.black} seg={5} />

      {/* rambu keselamatan */}
      <Sign p={[-9, GND, 5.8]} />
      <Sign p={[9, GND, -6]} rot={Math.PI} />
      <Sign p={[15.2, GND, 0]} rot={-Math.PI / 2} />
    </group>
  );
}

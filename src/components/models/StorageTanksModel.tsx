"use client";

import { B, C, CX, Cone, Dome, Flange, Pipe, Valve, COL, mat, type V3 } from "./prims";
import { Inst, type InstItem } from "./instances";

// Tiga tangki silinder berbeda ukuran (atap kerucut, tangga spiral, ring penguat, manhole) di dalam bund, manifold pipa dengan valve,
// satu pompa, dan level gauge. Tangki bahan bakar abu/oranye, tangki air biru. Beda dari model Water Treatment (proses dengan bak).
const GND = 0.12;

interface TankDef {
  x: number;
  z: number;
  r: number;
  h: number;
  c: string;
}
const TANKS: TankDef[] = [
  { x: -3.8, z: -1, r: 2.0, h: 3.8, c: "#c9d0d8" }, // bahan bakar, abu
  { x: 0.4, z: -0.6, r: 1.5, h: 3.0, c: "#e08a2c" }, // bahan bakar, oranye
  { x: 3.5, z: -0.3, r: 1.2, h: 2.6, c: "#7fb4dc" }, // air, biru
];

function Tank({ t }: { t: TankDef }) {
  const top = GND + t.h;
  const steps: InstItem[] = [];
  const n = 26;
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1);
    const a = Math.PI * 0.9 + k * Math.PI * 3; // 1,5 putaran
    const R = t.r + 0.3;
    steps.push({ p: [t.x + Math.cos(a) * R, GND + 0.1 + k * (t.h - 0.1), t.z + Math.sin(a) * R], s: [0.28, 0.05, 0.5], rot: [0, -a, 0] });
  }
  const gx = t.x + t.r * 0.95;
  return (
    <group>
      <C p={[t.x, GND + t.h / 2, t.z]} r={t.r} h={t.h} c={t.c} seg={26} metal={0.3} rough={0.5} />
      {[0.33, 0.66].map((k) => (
        <C key={k} p={[t.x, GND + t.h * k, t.z]} r={t.r * 1.015} h={0.08} c={COL.darkSteel} seg={26} />
      ))}
      <C p={[t.x, GND + 0.06, t.z]} r={t.r * 1.03} h={0.12} c={COL.darkSteel} seg={26} />
      <Cone p={[t.x, top + 0.38, t.z]} r={t.r * 1.04} h={0.76} c="#a9b2bd" />
      <Dome p={[t.x, top + 0.72, t.z]} r={0.22} sy={0.8} c={COL.darkSteel} />
      <mesh position={[t.x, top + 0.06, t.z]} rotation={[Math.PI / 2, 0, 0]} material={mat(COL.yellow, 0.2, 0.6)} castShadow>
        <torusGeometry args={[t.r * 0.985, 0.03, 4, 26]} />
      </mesh>
      <Inst items={steps} c={COL.yellow} />
      {/* manhole + ring pengaku */}
      <CX p={[t.x, GND + 0.8, t.z + t.r + 0.05]} r={0.28} h={0.12} c={COL.darkSteel} rot={[Math.PI / 2, 0, 0]} />
      <Flange p={[t.x, GND + 0.8, t.z + t.r + 0.12]} r={0.3} axis="z" bolts={8} />
      {/* level gauge */}
      <Pipe a={[gx + 0.1, GND + 0.6, t.z + 0.3]} b={[gx + 0.1, top - 0.4, t.z + 0.3]} r={0.035} c={COL.glass} seg={6} />
      <B p={[gx + 0.1, top - 0.35, t.z + 0.3]} s={[0.1, 0.1, 0.1]} c={COL.darkSteel} />
    </group>
  );
}

export function StorageTanksModel() {
  const MAN_Z = 2.2;
  return (
    <group>
      <B p={[0, 0.06, 0]} s={[18, 0.12, 11]} c={COL.concrete} metal={0.05} rough={0.9} />

      {/* bund / dike melingkupi ketiga tangki */}
      <B p={[-0.5, GND + 0.015, -1]} s={[11.6, 0.03, 5.2]} c="#7d8087" metal={0} rough={1} />
      {[
        { p: [-0.5, GND + 0.4, -3.6] as V3, s: [11.8, 0.8, 0.2] as V3 },
        { p: [-0.5, GND + 0.4, 1.6] as V3, s: [11.8, 0.8, 0.2] as V3 },
        { p: [-6.4, GND + 0.4, -1] as V3, s: [0.2, 0.8, 5.4] as V3 },
        { p: [5.4, GND + 0.4, -1] as V3, s: [0.2, 0.8, 5.4] as V3 },
      ].map((w, i) => (
        <B key={i} p={w.p} s={w.s} c="#9a9ea5" metal={0} rough={0.95} />
      ))}

      {TANKS.map((t) => (
        <Tank key={t.x} t={t} />
      ))}

      {/* manifold di depan bund: cabang ke tiap tangki dengan valve + flange */}
      <Pipe a={[-4.6, 0.5, MAN_Z]} b={[6.2, 0.5, MAN_Z]} r={0.2} c="#7b8591" seg={12} />
      {TANKS.map((t) => (
        <group key={t.x}>
          <Pipe a={[t.x, 0.5, MAN_Z]} b={[t.x, 0.5, t.z + t.r]} r={0.15} c="#7b8591" seg={10} />
          <Valve p={[t.x, 0.5, MAN_Z - 0.45]} r={0.1} axis="z" c={COL.red} />
          <Flange p={[t.x, 0.5, MAN_Z - 0.9]} r={0.24} axis="z" />
        </group>
      ))}
      {[-3, 1.2, 4.6].map((x) => (
        <B key={x} p={[x, 0.2, MAN_Z]} s={[0.3, 0.18, 0.4]} c={COL.concrete} />
      ))}

      {/* pompa transfer di ujung manifold */}
      <group position={[7.1, GND, MAN_Z]}>
        <B p={[0.4, 0.08, 0]} s={[2.6, 0.16, 1.1]} c={COL.darkSteel} />
        <CX p={[1.0, 0.75 - GND, 0]} r={0.42} h={1.0} c={COL.blue} seg={16} />
        <CX p={[0.1, 0.75 - GND, 0]} r={0.38} h={0.5} c={COL.steel} seg={16} />
        <CX p={[-0.3, 0.75 - GND, 0]} r={0.18} h={0.4} c={COL.steel} />
        <C p={[0.1, 1.2, 0]} r={0.13} h={0.5} c={COL.steel} />
      </group>
      <Pipe a={[6.2, 0.5, MAN_Z]} b={[6.8, 0.75, MAN_Z]} r={0.18} c="#7b8591" seg={10} />
      <Pipe a={[7.2, 1.2, MAN_Z]} b={[7.2, 2.2, MAN_Z]} r={0.13} c="#7b8591" seg={10} />
      <Pipe a={[7.2, 2.2, MAN_Z]} b={[7.2, 2.2, -2.6]} r={0.13} c="#7b8591" seg={10} />
      <Pipe a={[7.2, 2.2, -2.6]} b={[7.2, 0.4, -2.6]} r={0.13} c="#7b8591" seg={10} />
    </group>
  );
}

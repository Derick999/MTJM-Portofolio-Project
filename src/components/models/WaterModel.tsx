"use client";

import { B, Ball, C, CX, Cabinet, Dome, Flange, Ladder, Leg, Pipe, PipeRun, Rail, Valve, COL, mat } from "./prims";

const TANK = "#4d86b8";
const PIPE_W = "#4aa3d9";
const PIPE_C = COL.green;

function PressureVessel({ x, z, r = 0.75, h = 2.3 }: { x: number; z: number; r?: number; h?: number }) {
  return (
    <group position={[x, 0, z]}>
      {[0, 1, 2, 3].map((i) => (
        <Leg key={i} p={[Math.cos((i * Math.PI) / 2 + Math.PI / 4) * r * 0.85, 0, Math.sin((i * Math.PI) / 2 + Math.PI / 4) * r * 0.85]} h={0.5} size={0.1} />
      ))}
      <C p={[0, 0.5 + h / 2, 0]} r={r} h={h} seg={20} c="#c9d0d8" metal={0.5} rough={0.35} />
      <Dome p={[0, 0.5 + h, 0]} r={r} sy={0.45} c="#c9d0d8" metal={0.5} rough={0.35} />
      <Dome p={[0, 0.5, 0]} r={r} sy={0.45} rot={[Math.PI, 0, 0]} c="#c9d0d8" metal={0.5} rough={0.35} />
      {[0.6, 1.6].map((y) => (
        <C key={y} p={[0, 0.5 + y, 0]} r={r + 0.025} h={0.08} seg={20} c={COL.blue} />
      ))}
      {/* sight glass + manhole */}
      <B p={[0, 0.5 + h * 0.55, r + 0.02]} s={[0.12, 0.7, 0.05]} c={COL.glass} metal={0.1} />
      <CX p={[r + 0.05, 0.5 + h * 0.35, 0]} r={0.16} h={0.1} c={COL.steel} />
      <Flange p={[r + 0.12, 0.5 + h * 0.35, 0]} r={0.18} axis="x" />
      <Ball p={[0, 0.5 + h + r * 0.45, 0]} r={0.08} c={COL.red} />
    </group>
  );
}

function SpiralStairs({ r, h, turns = 0.9 }: { r: number; h: number; turns?: number }) {
  const n = 15;
  const steps = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const a = t * turns * Math.PI * 2 + 0.4;
    return { a, y: 0.2 + t * (h - 0.35), x: Math.cos(a) * (r + 0.4), z: Math.sin(a) * (r + 0.4), t };
  });
  return (
    <group>
      {steps.map((s, i) => (
        <group key={i}>
          <B p={[s.x, s.y, s.z]} s={[0.7, 0.05, 0.32]} rot={[0, -s.a, 0]} c={COL.yellow} />
          <B p={[Math.cos(s.a) * (r + 0.76), s.y + 0.3, Math.sin(s.a) * (r + 0.76)]} s={[0.03, 0.6, 0.03]} c={COL.yellow} />
        </group>
      ))}
      {steps.slice(1).map((s, i) => {
        const p = steps[i];
        const a: [number, number, number] = [Math.cos(p.a) * (r + 0.76), p.y + 0.6, Math.sin(p.a) * (r + 0.76)];
        const b: [number, number, number] = [Math.cos(s.a) * (r + 0.76), s.y + 0.6, Math.sin(s.a) * (r + 0.76)];
        return <Pipe key={i} a={a} b={b} r={0.018} c={COL.yellow} seg={5} />;
      })}
      {/* platform atas */}
      <C p={[0, h + 0.02, 0]} r={r + 0.55} h={0.05} seg={20} c={COL.darkSteel} />
    </group>
  );
}

export function WaterModel() {
  return (
    <group>
      <B p={[0.4, 0.06, 0.2]} s={[11, 0.12, 6.2]} c={COL.concrete} metal={0.05} rough={0.9} />

      {/* Tangki besar dengan tutup kubah + tangga melingkar */}
      <group position={[-3.2, 0.12, -0.3]}>
        <C p={[0, 1.7, 0]} r={1.25} h={3.4} seg={26} c={TANK} metal={0.5} rough={0.4} />
        <Dome p={[0, 3.4, 0]} r={1.25} sy={0.3} c="#cfd6dd" />
        {[0.9, 1.8, 2.7].map((y) => (
          <C key={y} p={[0, y, 0]} r={1.275} h={0.07} seg={26} c={COL.darkSteel} />
        ))}
        <SpiralStairs r={1.25} h={3.4} />
        <Ball p={[0, 3.85, 0]} r={0.1} c={COL.red} />
        <CX p={[1.3, 0.6, 0]} r={0.2} h={0.15} c={COL.steel} />
        <Flange p={[1.38, 0.6, 0]} r={0.2} axis="x" />
      </group>

      {/* Dua bejana tekan */}
      <group position={[0, 0.12, 0]}>
        <PressureVessel x={0.1} z={-1.3} />
        <PressureVessel x={0.1} z={0.9} r={0.7} h={2.1} />
      </group>

      {/* Tangki kimia + pompa dosing */}
      <group position={[2.3, 0.12, 1.5]}>
        <C p={[0, 0.7, 0]} r={0.55} h={1.4} seg={16} c="#e0b33a" />
        <Dome p={[0, 1.4, 0]} r={0.55} sy={0.3} c="#e0b33a" />
        <B p={[0, 0.06, 0]} s={[1.3, 0.12, 1.3]} c={COL.frame} />
        <C p={[0.7, 0.35, 0.2]} r={0.12} h={0.5} seg={8} c={COL.green} />
        <Pipe a={[0.45, 0.9, 0]} b={[0.7, 0.9, 0.2]} r={0.03} c={COL.orange} seg={6} />
      </group>

      {/* Bak rektangular */}
      <group position={[3.5, 0.12, -1.7]}>
        <B p={[0, 0.5, 0]} s={[2.8, 1.0, 1.8]} c="#7b8592" />
        <B p={[0, 0.96, 0]} s={[2.5, 0.06, 1.5]} m={mat(COL.water, 0.1, 0.2, { transparent: true, opacity: 0.85 })} />
        {[-1.4, 1.4].map((x) => (
          <B key={x} p={[x, 0.5, 0]} s={[0.08, 1.0, 1.9]} c={COL.darkSteel} />
        ))}
        <Rail p={[0, 1.0, 0.9]} len={2.8} h={0.5} />
        <Rail p={[0, 1.0, -0.9]} len={2.8} h={0.5} />
        <Ladder p={[-1.42, 0, 0.5]} h={1.5} w={0.4} rot={[0, Math.PI, 0]} />
      </group>

      {/* Pompa utama */}
      <group position={[-1.3, 0.12, 2.0]}>
        <B p={[0, 0.06, 0]} s={[1.4, 0.12, 0.7]} c={COL.frame} />
        <CX p={[0.45, 0.42, 0]} r={0.25} h={0.7} seg={14} c={COL.green} />
        <Ball p={[-0.15, 0.42, 0]} r={0.3} c={COL.darkSteel} />
        <Pipe a={[-0.15, 0.42, 0]} b={[-0.15, 1.0, 0]} r={0.09} c={PIPE_W} />
      </group>

      {/* Pipa penghubung + valve */}
      <PipeRun pts={[[-1.9, 0.72, -0.3], [-1.4, 0.72, -0.3], [-1.4, 0.72, 2.0], [-1.45, 1.12, 2.0]]} r={0.1} c={PIPE_W} />
      <PipeRun pts={[[-1.45, 1.12, 2.0], [-1.45, 1.8, 2.0], [-0.6, 1.8, 2.0], [-0.6, 1.8, 0.9], [-0.6, 0.72, 0.9]]} r={0.1} c={PIPE_W} />
      <Pipe a={[-0.6, 1.8, 0.9]} b={[-0.6, 1.8, -1.3]} r={0.1} c={PIPE_W} />
      <Pipe a={[-0.6, 1.8, -1.3]} b={[-0.65, 1.8, -1.3]} r={0.1} c={PIPE_W} />
      <Valve p={[-1.4, 0.72, 0.9]} r={0.1} axis="z" c={COL.red} />
      <Valve p={[-1.0, 1.8, 2.0]} r={0.1} axis="x" c={COL.red} />
      <Valve p={[-0.6, 1.8, 0.0]} r={0.1} axis="z" c={COL.red} />
      <Flange p={[-1.4, 0.72, 1.4]} r={0.16} axis="z" />
      <Flange p={[-0.6, 1.8, 0.5]} r={0.16} axis="z" />
      {/* Antar bejana -> bak air */}
      <PipeRun pts={[[0.85, 1.9, 0.9], [1.4, 1.9, 0.9], [1.4, 1.9, -1.3], [0.85, 1.9, -1.3]]} r={0.08} c={PIPE_C} />
      <PipeRun pts={[[1.4, 1.9, -0.2], [3.0, 1.9, -0.2], [3.0, 1.75, -1.2]]} r={0.08} c={PIPE_C} />
      <Valve p={[2.0, 1.9, -0.2]} r={0.09} axis="x" c={COL.yellow} />
      <Flange p={[2.6, 1.9, -0.2]} r={0.14} axis="x" />
      {/* Jalur kimia */}
      <PipeRun pts={[[2.3, 1.5, 1.5], [2.3, 2.1, 1.5], [1.4, 2.1, 1.5], [1.4, 1.9, 0.9]]} r={0.05} c={COL.orange} />
      <Cabinet p={[-0.2, 0.12, 3.0]} s={[0.9, 1.4, 0.4]} />
    </group>
  );
}

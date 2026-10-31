"use client";

import { B, Ball, CX, Dome, Elbow, Flange, IBeam, Leg, Pipe, PipeRun, Valve, COL, mat } from "./prims";

const INSUL = "#c4cad1";
const X0 = -4.4;
const X1 = 4.4;
const FRAMES = [-4.2, -1.4, 1.4, 4.2];

function Support({ x, y, z, r }: { x: number; y: number; z: number; r: number }) {
  // pipe shoe + U-bolt di atas balok melintang
  return (
    <group position={[x, y, z]}>
      <B p={[0, -r - 0.03, 0]} s={[0.35, 0.06, r * 1.6]} c={COL.darkSteel} />
      <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={mat("#d3d8de", 0.6, 0.4)} castShadow>
        <torusGeometry args={[r + 0.02, 0.012, 4, 10, Math.PI]} />
      </mesh>
    </group>
  );
}

export function PipingModel() {
  const pipes: { z: number; y: number; r: number; c: string }[] = [
    { z: -0.7, y: 2.75, r: 0.2, c: INSUL },
    { z: 0, y: 2.75, r: 0.14, c: COL.steel },
    { z: 0.7, y: 2.75, r: 0.11, c: COL.green },
    { z: -0.5, y: 1.4, r: 0.16, c: COL.blue },
    { z: 0.5, y: 1.4, r: 0.1, c: COL.orange },
  ];
  return (
    <group>
      <B p={[0, 0.06, 0.3]} s={[11.5, 0.12, 5.6]} c={COL.concrete} metal={0.05} rough={0.9} />

      {/* Rak baja */}
      {FRAMES.map((x) => (
        <group key={x}>
          {[-1.1, 1.1].map((z) => (
            <Leg key={z} p={[x, 0.12, z]} h={2.8} size={0.16} />
          ))}
          <IBeam p={[x, 1.2, 0]} len={2.2} size={0.2} rot={[0, Math.PI / 2, 0]} />
          <IBeam p={[x, 2.55, 0]} len={2.2} size={0.2} rot={[0, Math.PI / 2, 0]} />
          {/* bracing */}
          <Pipe a={[x, 0.2, 1.1]} b={[x, 1.2, -1.1]} r={0.02} c={COL.frame} seg={5} />
          <Pipe a={[x, 0.2, -1.1]} b={[x, 1.2, 1.1]} r={0.02} c={COL.frame} seg={5} />
        </group>
      ))}
      {/* Stringer memanjang */}
      {[-1.1, 1.1].map((z) => (
        <group key={z}>
          <IBeam p={[0, 1.1, z]} len={8.6} size={0.12} />
          <IBeam p={[0, 2.45, z]} len={8.6} size={0.12} />
        </group>
      ))}

      {/* Pipa utama sepanjang rak */}
      {pipes.map((p, i) => (
        <group key={i}>
          <Pipe a={[X0, p.y, p.z]} b={[X1, p.y, p.z]} r={p.r} c={p.c} seg={14} />
          {[-4.2, 4.2, -1.4, 1.4].map((x) => (
            <Support key={x} x={x} y={p.y} z={p.z} r={p.r} />
          ))}
          {/* flange berpasangan */}
          {[-2.8, 0, 2.8].map((x) => (
            <group key={x}>
              <Flange p={[x - 0.05, p.y, p.z]} r={p.r * 1.55} axis="x" bolts={8} />
              <Flange p={[x + 0.05, p.y, p.z]} r={p.r * 1.55} axis="x" bolts={8} />
            </group>
          ))}
        </group>
      ))}
      {/* Pita insulasi pada pipa besar */}
      {[-3.4, -2.2, -0.6, 0.6, 2.2, 3.4].map((x) => (
        <CX key={x} p={[x, 2.75, -0.7]} r={0.225} h={0.08} c={COL.darkSteel} />
      ))}

      {/* Valve di rak */}
      <Valve p={[-3.5, 2.75, 0.7]} r={0.1} axis="x" c={COL.red} />
      <Valve p={[2.0, 2.75, 0]} r={0.12} axis="x" c={COL.yellow} />
      <Valve p={[0.8, 1.4, -0.5]} r={0.12} axis="x" c={COL.red} />
      <Valve p={[-2.0, 1.4, 0.5]} r={0.09} axis="x" c={COL.yellow} />

      {/* Belokan di ujung: siku & turun ke tanah */}
      <Elbow p={[X1, 2.75 - 0.35, 0.7]} R={0.35} r={0.11} c={COL.green} />
      <Pipe a={[X1 + 0.35, 2.4, 0.7]} b={[X1 + 0.35, 0.5, 0.7]} r={0.11} c={COL.green} />
      <Flange p={[X1 + 0.35, 1.5, 0.7]} r={0.18} />
      <Elbow p={[X1 + 0.7, 0.5, 0.7]} R={0.35} r={0.11} rot={[0, 0, Math.PI]} c={COL.green} />
      <Pipe a={[X1 + 0.35, 0.15, 0.7]} b={[X1 + 0.35, 0.15, 2.4]} r={0.11} c={COL.green} />

      {/* Tee + cabang riser di tengah */}
      <Pipe a={[-0.6, 1.4, 0.5]} b={[-0.6, 1.4, 1.5]} r={0.1} c={COL.orange} />
      <Ball p={[-0.6, 1.4, 0.5]} r={0.14} c={COL.orange} />
      <PipeRun pts={[[-0.6, 1.4, 1.5], [-0.6, 0.3, 1.5], [0.9, 0.3, 1.5]]} r={0.1} c={COL.orange} />
      <Flange p={[-0.6, 0.8, 1.5]} r={0.17} />
      <Valve p={[0.1, 0.3, 1.5]} r={0.1} axis="x" c={COL.red} />

      {/* Cabang bertingkat dari pipa atas */}
      <Pipe a={[-2.2, 2.75, 0.7]} b={[-2.2, 2.75, 1.7]} r={0.09} c={COL.green} />
      <Pipe a={[-2.2, 2.75, 1.7]} b={[-2.2, 1.7, 1.7]} r={0.09} c={COL.green} />
      <Ball p={[-2.2, 2.75, 1.7]} r={0.12} c={COL.green} />
      <Flange p={[-2.2, 2.2, 1.7]} r={0.15} />
      <Dome p={[-2.2, 1.7, 1.7]} r={0.1} sy={0.6} rot={[Math.PI, 0, 0]} c={COL.green} />

      {/* Pipe support di atas tanah (sleeper) */}
      {[3.2, 4.0].map((z, i) => (
        <group key={i}>
          <B p={[X1 + 0.35, 0.18, z * 0.65 + 0.5]} s={[0.5, 0.12, 0.2]} c={COL.concrete} />
          <Support x={X1 + 0.35} y={0.27} z={z * 0.65 + 0.5} r={0.11} />
        </group>
      ))}
    </group>
  );
}

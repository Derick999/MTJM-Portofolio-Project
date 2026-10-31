"use client";

import { B, C, CX, Cabinet, Dome, Flange, IBeam, Leg, Pipe, PipeRun, Rail, Ladder, COL, mat } from "./prims";
import { Spin } from "./anim";

const SHELL = "#d9dee4";
const ACCENT = COL.orange;

function Louvers({ x, z, w = 1.0, h = 1.3, y = 1.9 }: { x: number; z: number; w?: number; h?: number; y?: number }) {
  const n = 9;
  return (
    <group position={[x, y, z]}>
      <B s={[w + 0.1, h + 0.1, 0.04]} c={COL.darkSteel} />
      {Array.from({ length: n }, (_, i) => (
        <B key={i} p={[0, -h / 2 + 0.08 + (i * (h - 0.16)) / (n - 1), 0.04]} s={[w, 0.06, 0.1]} rot={[0.5, 0, 0]} c="#bcc3cb" />
      ))}
    </group>
  );
}

export function GensetModel() {
  return (
    <group>
      <B p={[0, 0.06, 0]} s={[10.5, 0.12, 5.6]} c={COL.concrete} metal={0.05} rough={0.9} />

      {/* Base frame + tangki bahan bakar */}
      {[-0.9, 0.9].map((z) => (
        <IBeam key={z} p={[0, 0.3, z]} len={6.1} size={0.3} c={COL.yellow} />
      ))}
      {[-2.6, -0.9, 0.9, 2.6].map((x) => (
        <B key={x} p={[x, 0.3, 0]} s={[0.16, 0.24, 1.8]} c={COL.yellow} />
      ))}
      <B p={[-0.2, 0.52, 0]} s={[4.6, 0.46, 1.6]} c={COL.darkSteel} />
      <B p={[-0.2, 0.52, 0.81]} s={[4.4, 0.36, 0.03]} c="#5d6673" />
      <C p={[-2.0, 0.78, 0.5]} r={0.1} h={0.12} c={COL.red} seg={8} />
      <B p={[-1.0, 0.55, 0.83]} s={[0.12, 0.3, 0.03]} m={mat("#0e2a1c", 0.2, 0.3, { emissive: "#27d17a", emissiveIntensity: 0.7 })} />
      <PipeRun pts={[[-2.4, 0.5, 0.82], [-2.7, 0.5, 1.25], [-3.0, 0.5, 1.25]]} r={0.05} c={COL.orange} />

      {/* Enclosure */}
      <B p={[0, 1.9, 0]} s={[5.4, 2.3, 2.2]} c={SHELL} metal={0.3} rough={0.5} />
      <B p={[0, 3.08, 0]} s={[5.5, 0.1, 2.3]} c={COL.steel} />
      <B p={[0, 1.2, 1.11]} s={[5.4, 0.18, 0.03]} c={ACCENT} />
      <B p={[0, 1.2, -1.11]} s={[5.4, 0.18, 0.03]} c={ACCENT} />
      {/* Tonggak sudut */}
      {[-2.7, 2.7].flatMap((x) => [-1.1, 1.1].map((z) => <B key={`${x}${z}`} p={[x, 1.9, z]} s={[0.14, 2.3, 0.14]} c={COL.darkSteel} />))}
      {/* Lifting lug */}
      {[-2.4, 2.4].flatMap((x) =>
        [-0.95, 0.95].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 3.22, z]} rotation={[Math.PI / 2, 0, 0]} material={mat(COL.red, 0.3, 0.5)} castShadow>
            <torusGeometry args={[0.1, 0.03, 5, 8]} />
          </mesh>
        )),
      )}

      {/* Louver ventilasi + pintu */}
      <Louvers x={-1.7} z={1.12} />
      <Louvers x={-0.4} z={1.12} />
      <Louvers x={-1.7} z={-1.12} />
      <Louvers x={-0.4} z={-1.12} />
      <B p={[1.45, 1.7, 1.12]} s={[1.2, 1.9, 0.04]} c="#c3cad2" />
      <B p={[1.45, 1.7, 1.15]} s={[1.0, 1.7, 0.02]} c={SHELL} />
      <B p={[1.05, 1.7, 1.2]} s={[0.05, 0.3, 0.06]} c={COL.black} />
      {[1.1, 2.3].map((y) => (
        <C key={y} p={[2.05, y, 1.15]} r={0.03} h={0.2} c={COL.darkSteel} seg={6} />
      ))}
      <B p={[1.45, 2.3, 1.16]} s={[0.5, 0.2, 0.02]} c="#ff3b2e" />

      {/* Radiator di sisi belakang (+x) */}
      <B p={[3.45, 1.85, 0]} s={[1.0, 2.2, 2.2]} c={COL.darkSteel} />
      {Array.from({ length: 13 }, (_, i) => (
        <B key={i} p={[3.97, 1.85, -1.0 + i * 0.167]} s={[0.04, 2.0, 0.07]} c="#b9c0c8" />
      ))}
      <Spin p={[4.0, 1.85, 0]} axis="x" speed={5}>
        <group>
          {Array.from({ length: 6 }, (_, i) => (
            <B key={i} p={[0, 0, 0]} s={[0.03, 0.85, 0.2]} rot={[(i * Math.PI) / 3, 0, 0]} c={COL.yellow} />
          ))}
          <CX r={0.12} h={0.12} c={COL.black} />
        </group>
      </Spin>
      <mesh position={[4.05, 1.85, 0]} rotation={[0, Math.PI / 2, 0]} material={mat(COL.darkSteel)} castShadow>
        <torusGeometry args={[0.95, 0.04, 5, 20]} />
      </mesh>
      {[-1, 0, 1].map((k) => (
        <Pipe key={k} a={[4.05, 1.85 + k * 0.4, -0.95]} b={[4.05, 1.85 + k * 0.4, 0.95]} r={0.012} c={COL.darkSteel} />
      ))}
      <PipeRun pts={[[3.0, 1.2, 0.7], [2.85, 1.2, 0.7]]} r={0.12} c={COL.green} />
      <Flange p={[2.92, 1.2, 0.7]} r={0.2} axis="x" />

      {/* Exhaust: silencer + stack */}
      <CX p={[-0.7, 3.65, 0]} r={0.42} h={1.9} seg={18} c="#7d8691" metal={0.55} />
      <Dome p={[0.25, 3.65, 0]} r={0.42} sy={0.5} rot={[0, 0, -Math.PI / 2]} c="#7d8691" metal={0.55} />
      <Dome p={[-1.65, 3.65, 0]} r={0.42} sy={0.5} rot={[0, 0, Math.PI / 2]} c="#7d8691" metal={0.55} />
      {[-1.2, -0.2].map((x) => (
        <CX key={x} p={[x, 3.65, 0]} r={0.435} h={0.08} seg={18} c={COL.darkSteel} />
      ))}
      <Pipe a={[-1.65, 3.65, 0]} b={[-1.65, 3.2, 0]} r={0.16} c={COL.pipe} />
      <PipeRun pts={[[-1.2, 4.05, 0], [-1.2, 5.6, 0]]} r={0.2} c="#8b95a3" />
      <C p={[-1.2, 5.65, 0]} r={0.26} h={0.08} seg={14} c={COL.darkSteel} />
      <Dome p={[-1.2, 5.75, 0]} r={0.3} sy={0.35} c={COL.darkSteel} />
      <Flange p={[-1.2, 4.3, 0]} r={0.3} />
      {/* Penahan stack */}
      <Pipe a={[-1.2, 5.0, 0.2]} b={[-1.9, 3.1, 1.0]} r={0.015} c={COL.darkSteel} />
      <Pipe a={[-1.2, 5.0, -0.2]} b={[-1.9, 3.1, -1.0]} r={0.015} c={COL.darkSteel} />

      {/* Tangga servis ke atap + railing atap */}
      <Ladder p={[2.4, 0.15, -1.17]} h={2.95} w={0.4} rot={[0, Math.PI / 2, 0]} />
      <Rail p={[0, 3.13, -1.05]} len={5.2} h={0.5} c={COL.yellow} />
      <Rail p={[0, 3.13, 1.05]} len={5.2} h={0.5} c={COL.yellow} />

      {/* Panel kontrol + cable tray */}
      <Cabinet p={[-4.2, 0, 0.2]} s={[1.0, 1.9, 0.5]} rot={[0, Math.PI / 2, 0]} />
      <B p={[-3.4, 1.3, 0.2]} s={[1.5, 0.05, 0.35]} c="#8a929c" />
      <B p={[-3.4, 1.37, 0.06]} s={[1.5, 0.12, 0.03]} c="#8a929c" />
      <B p={[-3.4, 1.37, 0.34]} s={[1.5, 0.12, 0.03]} c="#8a929c" />
      {[-0.05, 0.05, 0.15].map((o, i) => (
        <Pipe key={i} a={[-4.1, 1.38, 0.2 + o]} b={[-2.75, 1.38, 0.2 + o]} r={0.025} c={i === 1 ? COL.red : COL.black} seg={6} />
      ))}
      <Pipe a={[-3.4, 1.3, 0.2]} b={[-3.4, 0.1, 0.2]} r={0.015} c={COL.darkSteel} />
      <Pipe a={[-4.1, 2.05, 0.2]} b={[-4.1, 3.9, 0.2]} r={0.04} c={COL.darkSteel} seg={6} />
      <B p={[-2.8, 1.38, 0.2]} s={[0.1, 0.35, 0.4]} c={COL.darkSteel} />

      {[-2.9, 2.9].flatMap((x) => [-1.1, 1.1].map((z) => <Leg key={`${x}${z}`} p={[x, 0, z * 0.82]} h={0.15} size={0.1} />))}
    </group>
  );
}

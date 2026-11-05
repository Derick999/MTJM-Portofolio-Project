"use client";

import { B, CX, Cabinet, Pipe, PipeRun, COL, mat, type V3 } from "./prims";
import { Inst, type InstItem } from "./instances";
import { Lamp, Tower, Transformer } from "./industrial";

// Ruang listrik: deretan kubikel switchgear MV/LV, trafo bersirip, cable tray berkabel, menara transmisi kisi, panel kontrol
// dengan layar, dan grid pembumian di lantai.
const GND = 0.12;
const CUB_Z = -1.2;

export function ElectricalModel() {
  const cubicles = Array.from({ length: 8 }, (_, i) => ({ x: -3.5 + i, mv: i < 3 }));
  const rungs: InstItem[] = [];
  for (let i = 0; i < 34; i++) rungs.push({ p: [-4.2 + i * 0.25, GND + 3.28, CUB_Z], s: [0.03, 0.03, 0.46] });
  const earth: InstItem[] = [];
  for (let z = -4.8; z <= 4.9; z += 1.2) earth.push({ p: [0, GND + 0.008, z], s: [14, 0.012, 0.03] });
  for (let x = -6.3; x <= 6.4; x += 1.4) earth.push({ p: [x, GND + 0.008, 0], s: [0.03, 0.012, 10] });
  const rods: InstItem[] = [[-5.6, -3.6], [5.6, -3.6], [-5.6, 3.6], [0, 3.6], [-2.8, 3.6]].map(([x, z]) => ({ p: [x, GND + 0.1, z] as V3, s: [0.03, 0.2, 0.03] as V3 }));
  const handles: InstItem[] = cubicles.map((c) => ({ p: [c.x + 0.32, GND + 1.15, CUB_Z + 0.47], s: [0.04, 0.32, 0.03] }));
  const doors: InstItem[] = cubicles.map((c) => ({ p: [c.x, GND + 1.05, CUB_Z + 0.46], s: [0.84, 1.75, 0.03] }));
  const screen = mat("#0e2a1c", 0.2, 0.3, { emissive: "#27d17a", emissiveIntensity: 0.9 });

  return (
    <group>
      <B p={[0, 0.06, 0]} s={[16, 0.12, 11]} c={COL.concrete} metal={0.05} rough={0.9} />
      <Inst items={earth} c="#b87333" metal={0.7} rough={0.4} />
      <Inst items={rods} c="#b87333" metal={0.7} rough={0.4} />

      {/* deretan switchgear: 3 kubikel MV (lebih tinggi, abu kebiruan) + 5 kubikel LV */}
      {cubicles.map((c) => (
        <group key={c.x}>
          <B p={[c.x, GND + (c.mv ? 1.15 : 1.05), CUB_Z]} s={[0.96, c.mv ? 2.3 : 2.1, 0.9]} c={c.mv ? "#9fb3c8" : "#d7dde4"} metal={0.25} />
          <B p={[c.x, GND + (c.mv ? 2.33 : 2.13), CUB_Z]} s={[1.0, 0.05, 0.94]} c={COL.darkSteel} />
          <Lamp p={[c.x - 0.25, GND + (c.mv ? 1.95 : 1.8), CUB_Z + 0.49]} c="#ff3b2e" phase={c.x * 1.3} />
          <Lamp p={[c.x, GND + (c.mv ? 1.95 : 1.8), CUB_Z + 0.49]} c="#3dd68c" phase={c.x * 0.7 + 1} />
          <Lamp p={[c.x + 0.25, GND + (c.mv ? 1.95 : 1.8), CUB_Z + 0.49]} c="#ffc61a" phase={c.x * 2.1 + 2} />
        </group>
      ))}
      <Inst items={doors} c="#aeb6c0" />
      <Inst items={handles} c={COL.darkSteel} />

      {/* cable tray di atas + kabel + turunan ke tiap kubikel */}
      <B p={[0, GND + 3.2, CUB_Z]} s={[8.6, 0.05, 0.5]} c={COL.frame} />
      {[-1, 1].map((sd) => (
        <B key={sd} p={[0, GND + 3.3, CUB_Z + sd * 0.25]} s={[8.6, 0.12, 0.03]} c={COL.frame} />
      ))}
      <Inst items={rungs} c={COL.steel} />
      {[
        [-0.14, COL.black],
        [0, COL.red],
        [0.14, COL.blue],
      ].map(([dz, c]) => (
        <CX key={c as string} p={[0, GND + 3.36, CUB_Z + (dz as number)]} r={0.05} h={8.2} c={c as string} seg={6} />
      ))}
      {[-4.35, 0, 4.35].map((x) => (
        <B key={x} p={[x, GND + 1.6, CUB_Z - 0.4]} s={[0.1, 3.2, 0.1]} c={COL.frame} />
      ))}
      {cubicles.map((c) => (
        <Pipe key={c.x} a={[c.x, GND + (c.mv ? 2.35 : 2.15), CUB_Z]} b={[c.x, GND + 3.2, CUB_Z]} r={0.04} c={COL.black} seg={5} />
      ))}

      {/* trafo di kanan + kabel dari tray */}
      <Transformer p={[6, GND, 1.2]} rot={-Math.PI / 2} />
      <PipeRun pts={[[4.1, GND + 3.36, CUB_Z], [5.4, GND + 3.36, CUB_Z], [5.4, GND + 2.4, 1.2 - 0.3], [5.95, GND + 2.4, 0.9]]} r={0.04} c={COL.black} joint={false} />

      {/* panel kontrol dengan layar + meja operator */}
      <Cabinet p={[-4.6, GND, 2.6]} />
      <Cabinet p={[-3.5, GND, 2.6]} c="#d7dde4" />
      <group position={[-0.6, GND, 3]}>
        <B p={[0, 0.4, 0]} s={[2.2, 0.8, 0.8]} c="#d7dde4" metal={0.2} />
        <B p={[0, 0.82, 0]} s={[2.3, 0.05, 0.9]} c={COL.darkSteel} />
        {[-0.6, 0.6].map((x) => (
          <group key={x}>
            <B p={[x, 1.12, -0.1]} s={[0.8, 0.5, 0.05]} m={screen} rot={[-0.15, 0, 0]} />
            <B p={[x, 0.95, -0.05]} s={[0.1, 0.25, 0.1]} c={COL.darkSteel} />
          </group>
        ))}
      </group>

      {/* menara transmisi + lengan kabel ke tray */}
      <Tower p={[-6.2, GND, -3.6]} h={6.2} w={0.6} />
      <Tower p={[2.5, GND, -4.4]} h={4.2} w={0.42} />
    </group>
  );
}

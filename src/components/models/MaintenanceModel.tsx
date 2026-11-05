"use client";

import { B, Ball, C, CX, Dome, IBeam, Pipe, Platform, Rail, Stairs, COL, mat } from "./prims";
import { Inst, type InstItem } from "./instances";
import { Spin } from "./anim";

// Bay workshop: skid pompa-motor dengan tutup casing terbuka (diangkat chain hoist), derek jembatan di atas, platform perawatan,
// rak suku cadang, toolbox, papan rambu keselamatan, dan roda gigi yang berputar pelan.
const GND = 0.12;
const RAIL_Y = 4.6;

function Gear({ teeth = 14, r = 0.6 }: { teeth?: number; r?: number }) {
  const items: InstItem[] = Array.from({ length: teeth }, (_, i) => {
    const a = (i / teeth) * Math.PI * 2;
    return { p: [Math.cos(a) * (r + 0.05), Math.sin(a) * (r + 0.05), 0], s: [0.14, 0.14, 0.14], rot: [0, 0, a] };
  });
  return (
    <>
      <C r={r} h={0.14} rot={[Math.PI / 2, 0, 0]} c={COL.steel} seg={20} />
      <C r={0.16} h={0.26} rot={[Math.PI / 2, 0, 0]} c={COL.darkSteel} seg={10} />
      <Inst items={items} c={COL.steel} />
    </>
  );
}

export function MaintenanceModel() {
  const stripes: InstItem[] = [];
  for (let i = 0; i < 12; i++) stripes.push({ p: [-4.2 + i * 0.75, GND + 0.007, 4.2], s: [0.4, 0.01, 0.16] });
  const shelfBoxes: InstItem[] = [
    { p: [-4.4, GND + 0.55, -3.45], s: [0.4, 0.3, 0.35] },
    { p: [-3.9, GND + 0.5, -3.45], s: [0.35, 0.2, 0.35] },
    { p: [-3.4, GND + 0.52, -3.45], s: [0.4, 0.25, 0.35] },
    { p: [-4.3, GND + 1.15, -3.45], s: [0.35, 0.3, 0.35] },
    { p: [-3.7, GND + 1.12, -3.45], s: [0.5, 0.25, 0.35] },
    { p: [-3.3, GND + 1.15, -3.45], s: [0.3, 0.3, 0.35] },
    { p: [-4.4, GND + 1.75, -3.45], s: [0.5, 0.3, 0.35] },
    { p: [-3.8, GND + 1.72, -3.45], s: [0.35, 0.25, 0.35] },
  ];
  const drawers: InstItem[] = [0, 1, 2].map((i) => ({ p: [-1.3, GND + 0.25 + i * 0.28, -3.2], s: [0.8, 0.02, 0.02] }));

  return (
    <group>
      <B p={[0, 0.06, 0]} s={[16, 0.12, 11]} c={COL.concrete} metal={0.05} rough={0.9} />
      <Inst items={stripes} c={COL.yellow} metal={0} rough={0.8} />

      {/* rangka bay + rel derek */}
      {[-6, 6].flatMap((x) => [-3.6, 3.6].map((z) => <B key={`${x}${z}`} p={[x, GND + RAIL_Y / 2 - 0.1, z]} s={[0.3, RAIL_Y, 0.3]} c={COL.frame} />))}
      {[-3.6, 3.6].map((z) => (
        <IBeam key={z} p={[0, GND + RAIL_Y, z]} len={12.3} size={0.32} />
      ))}
      {[-6, 6].map((x) => (
        <IBeam key={x} p={[x, GND + RAIL_Y, 0]} len={7.5} size={0.28} rot={[0, Math.PI / 2, 0]} />
      ))}

      {/* derek jembatan: girder melintang, troli, chain hoist, rantai ke tutup casing */}
      <IBeam p={[-0.6, GND + RAIL_Y - 0.4, 0]} len={7.4} size={0.34} rot={[0, Math.PI / 2, 0]} c={COL.yellow} />
      <B p={[-0.6, GND + RAIL_Y - 0.4, 3.7]} s={[0.4, 0.3, 0.3]} c={COL.darkSteel} />
      <B p={[-0.6, GND + RAIL_Y - 0.4, -3.7]} s={[0.4, 0.3, 0.3]} c={COL.darkSteel} />
      <B p={[-0.6, GND + RAIL_Y - 0.95, 0.5]} s={[0.7, 0.3, 0.5]} c={COL.red} />
      <C p={[-0.6, GND + RAIL_Y - 1.25, 0.5]} r={0.2} h={0.35} c={COL.darkSteel} seg={10} />
      <Pipe a={[-0.6, GND + RAIL_Y - 1.4, 0.5]} b={[-0.6, GND + 2.9, 0.5]} r={0.025} c={COL.black} seg={5} />
      <Ball p={[-0.6, GND + 2.85, 0.5]} r={0.1} c={COL.darkSteel} />

      {/* skid pompa-motor: casing terbuka, tutup terangkat */}
      <group position={[-0.6, GND, 0.5]}>
        <B p={[0, 0.1, 0]} s={[3.4, 0.2, 1.5]} c={COL.darkSteel} />
        <CX p={[-1.1, 0.85, 0]} r={0.5} h={1.3} c={COL.blue} seg={16} />
        <CX p={[-0.2, 0.85, 0]} r={0.2} h={0.5} c={COL.yellow} />
        <CX p={[0.65, 0.85, 0]} r={0.48} h={0.7} c={COL.steel} seg={16} />
        <C p={[0.65, 1.34, 0]} r={0.52} h={0.06} c={COL.darkSteel} seg={16} />
        <C p={[0.65, 1.2, 0]} r={0.28} h={0.3} c="#2b2f36" seg={12} />
        <Dome p={[0.65, 2.0, 0]} r={0.5} sy={0.7} c={COL.steel} />
        <C p={[0.65, 1.55, 0]} r={0.03} h={0.7} c={COL.black} seg={5} />
      </group>
      <Pipe a={[-0.6, GND + 2.85, 0.5]} b={[0.05, GND + 2.2, 0.5]} r={0.02} c={COL.black} seg={4} />

      {/* platform perawatan + tangga + pagar */}
      <Platform p={[3.4, 1.4, 0.5]} s={[2.4, 1.6]} />
      {[[2.3, -0.2], [4.5, -0.2], [2.3, 1.2], [4.5, 1.2]].map(([x, z]) => (
        <B key={`${x}${z}`} p={[x, 0.7, z]} s={[0.12, 1.3, 0.12]} c={COL.frame} />
      ))}
      <Rail p={[3.4, 1.43, 1.3]} len={2.4} h={0.9} />
      <Rail p={[4.6, 1.43, 0.5]} len={1.6} h={0.9} rot={[0, Math.PI / 2, 0]} />
      <Stairs p={[3.0, GND, 2.0]} h={1.3} w={0.8} dir={-1} steps={7} rot={[0, -Math.PI / 2, 0]} />

      {/* rak suku cadang */}
      {[-4.8, -2.9].map((x) => (
        <B key={x} p={[x, GND + 1.0, -3.45]} s={[0.06, 2.0, 0.5]} c={COL.blue} />
      ))}
      {[0.35, 0.95, 1.55, 2.0].map((y) => (
        <B key={y} p={[-3.85, GND + y, -3.45]} s={[1.98, 0.05, 0.5]} c={COL.steel} />
      ))}
      <Inst items={shelfBoxes} c="#b89b6e" metal={0.05} rough={0.9} />

      {/* toolbox + laci */}
      <B p={[-1.3, GND + 0.45, -3.2]} s={[0.9, 0.9, 0.55]} c={COL.red} />
      <B p={[-1.3, GND + 0.93, -3.2]} s={[0.95, 0.06, 0.6]} c={COL.darkSteel} />
      <Inst items={drawers} c={COL.darkSteel} />

      {/* papan rambu keselamatan */}
      <B p={[5.0, GND + 0.9, -3.4]} s={[0.1, 1.8, 0.1]} c={COL.steel} />
      <B p={[5.0, GND + 1.7, -3.34]} s={[1.3, 0.9, 0.05]} m={mat("#1f9d55", 0.1, 0.7)} />
      <B p={[5.0, GND + 1.7, -3.3]} s={[0.7, 0.14, 0.02]} c={COL.white} />
      <B p={[5.0, GND + 1.7, -3.3]} s={[0.14, 0.7, 0.02]} c={COL.white} />

      {/* roda gigi berputar pelan pada penyangga */}
      <B p={[-5.2, GND + 0.9, 1.6]} s={[0.12, 1.8, 0.5]} c={COL.frame} />
      <B p={[-5.2, GND + 0.1, 1.6]} s={[0.8, 0.2, 1.2]} c={COL.darkSteel} />
      <Spin p={[-4.7, GND + 1.7, 1.6]} axis="x" speed={0.6}>
        <group rotation={[0, Math.PI / 2, 0]}>
          <Gear />
        </group>
      </Spin>
    </group>
  );
}

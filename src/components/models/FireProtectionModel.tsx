"use client";

import { B, Ball, C, CX, Cabinet, Dome, Flange, Ladder, Pipe, PipeRun, Valve, COL, type V3 } from "./prims";
import { Inst, type InstItem } from "./instances";
import { Lamp } from "./industrial";

// Sistem proteksi kebakaran: skid pompa merah (pompa listrik, pompa diesel, jockey pump), pressure tank, riser merah ke grid sprinkler
// dengan kepala sprinkler, hidran pilar, tiang alarm dengan strobe, panel alarm, dan tangki air pemadam.
const GND = 0.12;
const RED = "#c8321f";
const PUMP_Z = -1.6;
const HDR_Z = 0.2; // header discharge
const GRID_Y = 3.6;

function Hydrant({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <C p={[0, 0.12, 0]} r={0.2} h={0.12} c={COL.darkSteel} seg={10} />
      <C p={[0, 0.55, 0]} r={0.13} h={0.9} c={RED} seg={10} />
      <Dome p={[0, 1.0, 0]} r={0.16} sy={0.7} c={RED} />
      {[-1, 1].map((sd) => (
        <group key={sd}>
          <CX p={[sd * 0.2, 0.65, 0]} r={0.06} h={0.28} c={COL.steel} seg={8} />
          <CX p={[sd * 0.36, 0.65, 0]} r={0.075} h={0.06} c={COL.darkSteel} seg={8} />
        </group>
      ))}
      <B p={[0, 1.13, 0]} s={[0.1, 0.05, 0.1]} c={COL.darkSteel} />
    </group>
  );
}

export function FireProtectionModel() {
  const branches = [-3.2, -1.6, 0, 1.6, 3.2];
  const heads: InstItem[] = [];
  const deflectors: InstItem[] = [];
  for (const z of branches)
    for (let x = 3.6; x <= 7.6; x += 0.8) {
      heads.push({ p: [x, GRID_Y - 0.1, z], s: [0.035, 0.18, 0.035] });
      deflectors.push({ p: [x, GRID_Y - 0.22, z], s: [0.11, 0.02, 0.11] });
    }
  const pumpX = [-5, -3.1, -1.4];

  return (
    <group>
      <B p={[0, 0.06, 0]} s={[16, 0.12, 12]} c={COL.concrete} metal={0.05} rough={0.9} />

      {/* skid pompa merah */}
      <B p={[-3.2, GND + 0.08, PUMP_Z]} s={[5.6, 0.16, 2.2]} c={RED} />
      {/* pompa listrik */}
      <group position={[pumpX[0], GND, PUMP_Z]}>
        <CX p={[-0.2, 0.7, 0]} r={0.45} h={1.0} c={RED} seg={16} />
        <CX p={[0.55, 0.7, 0]} r={0.38} h={0.5} c={COL.steel} seg={16} />
        <B p={[-0.2, 1.25, 0]} s={[0.35, 0.25, 0.35]} c={COL.darkSteel} />
      </group>
      {/* pompa diesel: blok mesin, radiator, knalpot */}
      <group position={[pumpX[1], GND, PUMP_Z]}>
        <B p={[-0.25, 0.7, 0]} s={[1.1, 0.8, 0.8]} c="#2f6f8f" />
        <B p={[-0.9, 0.7, 0]} s={[0.15, 0.8, 0.8]} c={COL.darkSteel} />
        <CX p={[0.5, 0.7, 0]} r={0.36} h={0.5} c={COL.steel} seg={16} />
        <C p={[-0.3, 1.5, 0.2]} r={0.06} h={1.0} c={COL.darkSteel} seg={8} />
        <C p={[-0.3, 1.1, 0.2]} r={0.14} h={0.35} c={COL.darkSteel} seg={10} />
      </group>
      {/* jockey pump (kecil) */}
      <group position={[pumpX[2], GND, PUMP_Z]}>
        <CX p={[-0.1, 0.5, 0]} r={0.25} h={0.7} c={RED} seg={12} />
        <CX p={[0.4, 0.5, 0]} r={0.22} h={0.3} c={COL.steel} seg={12} />
      </group>

      {/* suction (biru) dari tangki air ke tiap pompa */}
      <Pipe a={[-5.5, 0.6, -3.1]} b={[-0.9, 0.6, -3.1]} r={0.14} c={COL.water} />
      {pumpX.map((x) => (
        <Pipe key={x} a={[x + 0.2, 0.6, -3.1]} b={[x + 0.2, 0.6, PUMP_Z - 0.3]} r={0.1} c={COL.water} />
      ))}
      <Pipe a={[-3, 0.6, -3.4]} b={[-3, 0.6, -3.1]} r={0.16} c={COL.water} />

      {/* discharge merah: dari tiap pompa naik ke header, lalu riser ke grid sprinkler */}
      {pumpX.map((x) => (
        <group key={x}>
          <PipeRun pts={[[x + 0.3, 1.0, PUMP_Z], [x + 0.3, 1.3, PUMP_Z], [x + 0.3, 1.3, HDR_Z]]} r={0.1} c={RED} />
          <Valve p={[x + 0.3, 1.3, -0.7]} r={0.07} axis="z" c={COL.yellow} />
        </group>
      ))}
      <Pipe a={[-6.3, 1.3, HDR_Z]} b={[1.5, 1.3, HDR_Z]} r={0.15} c={RED} />
      <Pipe a={[1.5, GND, HDR_Z]} b={[1.5, GRID_Y, HDR_Z]} r={0.15} c={RED} />
      <Ball p={[1.5, 1.3, HDR_Z]} r={0.2} c={RED} />
      <Flange p={[1.5, 2.2, HDR_Z]} r={0.26} axis="y" />
      <Valve p={[1.5, 2.8, HDR_Z]} r={0.12} axis="z" c={COL.yellow} />

      {/* pressure tank (tegak) di ujung kiri header */}
      <C p={[-7, GND + 1.0, HDR_Z]} r={0.7} h={2} c={RED} seg={18} />
      <Dome p={[-7, GND + 2, HDR_Z]} r={0.7} sy={0.5} c={RED} />
      <Pipe a={[-6.3, 1.3, HDR_Z]} b={[-7, 1.3, HDR_Z]} r={0.12} c={RED} />

      {/* grid sprinkler di atas: rangka penopang, main, cabang, kepala sprinkler */}
      <PipeRun pts={[[1.5, GRID_Y, HDR_Z], [3, GRID_Y, HDR_Z]]} r={0.15} c={RED} joint={false} />
      <Ball p={[1.5, GRID_Y, HDR_Z]} r={0.19} c={RED} />
      <Pipe a={[3, GRID_Y, -3.4]} b={[3, GRID_Y, 3.4]} r={0.12} c={RED} />
      {branches.map((z) => (
        <Pipe key={z} a={[3, GRID_Y, z]} b={[8, GRID_Y, z]} r={0.06} c={RED} seg={8} />
      ))}
      <Inst items={heads} c={COL.steel} metal={0.6} />
      <Inst kind="cyl" items={deflectors} c="#d9a441" metal={0.6} />
      {[[3, -3.8], [3, 3.8], [8.4, -3.8], [8.4, 3.8]].map(([x, z]) => (
        <B key={`${x}${z}`} p={[x, GND + GRID_Y / 2 + 0.2, z]} s={[0.14, GRID_Y + 0.2, 0.14]} c={COL.frame} />
      ))}
      <B p={[5.7, GRID_Y + 0.4, -3.8]} s={[5.6, 0.12, 0.14]} c={COL.frame} />
      <B p={[5.7, GRID_Y + 0.4, 3.8]} s={[5.6, 0.12, 0.14]} c={COL.frame} />

      {/* hidran pilar di jalur ring main merah */}
      <Pipe a={[-6.5, GND + 0.1, 4.6]} b={[7, GND + 0.1, 4.6]} r={0.1} c={RED} />
      <Pipe a={[1.5, GND + 0.1, HDR_Z]} b={[1.5, GND + 0.1, 4.6]} r={0.1} c={RED} />
      {[-4.5, -1, 4].map((x) => (
        <Hydrant key={x} p={[x, GND, 4.6]} />
      ))}

      {/* tiang alarm dengan strobe + panel alarm */}
      <C p={[7.2, GND + 1.6, -4.8]} r={0.05} h={3.2} c={COL.steel} seg={6} />
      <B p={[7.2, GND + 3.3, -4.8]} s={[0.35, 0.3, 0.3]} c={RED} />
      <Lamp p={[7.2, GND + 3.58, -4.8]} c="#ffb020" r={0.11} />
      <B p={[7.2, GND + 3.0, -4.8 + 0.2]} s={[0.3, 0.15, 0.1]} c={COL.darkSteel} />
      <Cabinet p={[5.6, GND, -4.9]} s={[0.9, 1.5, 0.45]} c={RED} />

      {/* tangki air pemadam */}
      <C p={[-3, GND + 1.6, -4.5]} r={1.3} h={3.2} c="#9cc3e0" seg={22} metal={0.3} />
      {[0.3, 0.65].map((k) => (
        <C key={k} p={[-3, GND + 3.2 * k, -4.5]} r={1.32} h={0.07} c={COL.darkSteel} seg={22} />
      ))}
      <C p={[-3, GND + 3.28, -4.5]} r={1.34} h={0.1} c={RED} seg={22} />
      <Ladder p={[-3 + 1.34, GND, -4.5 + 0.4]} h={3.2} />
    </group>
  );
}

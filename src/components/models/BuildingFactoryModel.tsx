"use client";

import { B, C, Dome, mat, COL } from "./prims";
import { Inst, type InstItem } from "./instances";
import { Lamp } from "./industrial";

// Bangunan pabrik: atap gigi gergaji (sawtooth) dengan kaca di sisi tegak, dinding panel berusuk, pintu rolling, dok bongkar muat,
// ventilator dan unit HVAC di atap, kanopi samping, annex kantor kecil, dan palet di halaman.
const GND = 0.12;
const HX0 = -6; // sisi kiri hall
const HW = 10; // lebar hall (x)
const HD = 6; // kedalaman hall (z)
const WALL_H = 3.4;
const TOOTH = 2;
const TEETH = 4;
const WALL = "#cfd6de";

export function BuildingFactoryModel() {
  const hcx = HX0 + HW / 2;
  const ribs: InstItem[] = [];
  for (let i = 0; i < 20; i++) for (const sd of [-1, 1]) ribs.push({ p: [HX0 + 0.25 + i * 0.5, GND + WALL_H / 2, sd * (HD / 2 + 0.03)], s: [0.06, WALL_H - 0.1, 0.05] });
  for (let i = 0; i < 11; i++) ribs.push({ p: [HX0 - 0.03, GND + WALL_H / 2, -HD / 2 + 0.25 + i * 0.5], s: [0.05, WALL_H - 0.1, 0.06] });
  const slats: InstItem[] = [];
  for (const dx of [-3.4, -1.2]) for (let i = 0; i < 9; i++) slats.push({ p: [hcx + dx, GND + 0.2 + i * 0.26, HD / 2 + 0.06], s: [1.7, 0.03, 0.02] });
  const canopyPosts: InstItem[] = [];
  for (let i = 0; i < 6; i++) canopyPosts.push({ p: [HX0 + 0.8 + i * 1.7, GND + 1.4, HD / 2 + 1.6], s: [0.1, 2.8, 0.1] });
  const pallets: InstItem[] = [];
  const cartons: InstItem[] = [];
  for (let i = 0; i < 8; i++) {
    const x = 6.2 + (i % 4) * 1.35;
    const z = -3.6 + Math.floor(i / 4) * 1.5;
    pallets.push({ p: [x, GND + 0.07, z], s: [1.0, 0.14, 1.2] });
    cartons.push({ p: [x, GND + 0.14 + 0.35, z], s: [0.9, 0.7, 1.1] });
    if (i % 3 !== 0) cartons.push({ p: [x, GND + 0.14 + 1.05, z], s: [0.8, 0.6, 1.0] });
  }
  const dockLines: InstItem[] = [];
  for (const z of [-1.6, 1.0]) dockLines.push({ p: [HX0 + HW + 1.2, GND + 0.007, z], s: [2.4, 0.01, 0.1] });
  const glass = mat(COL.glass, 0.9, 0.1);

  return (
    <group>
      <B p={[1.5, 0.06, 0]} s={[22, 0.12, 12]} c={COL.concrete} metal={0.05} rough={0.9} />

      {/* hall + dinding panel berusuk */}
      <B p={[hcx, GND + WALL_H / 2, 0]} s={[HW, WALL_H, HD]} c={WALL} metal={0.2} />
      <Inst items={ribs} c="#aab5c2" />
      <B p={[hcx, GND + WALL_H + 0.04, 0]} s={[HW + 0.2, 0.08, HD + 0.2]} c={COL.darkSteel} />

      {/* atap gigi gergaji: bidang miring + kaca di sisi tegak */}
      {Array.from({ length: TEETH }, (_, i) => {
        const xs = HX0 + 2 + i * TOOTH;
        return (
          <group key={i}>
            <B p={[xs + TOOTH / 2, GND + WALL_H + 0.5, 0]} s={[2.2, 0.06, HD + 0.1]} rot={[0, 0, 0.42]} c="#8aa3bd" metal={0.5} />
            <B p={[xs + TOOTH, GND + WALL_H + 0.54, 0]} s={[0.04, 0.9, HD]} m={glass} />
            <B p={[xs + TOOTH, GND + WALL_H + 0.1, 0]} s={[0.08, 0.1, HD + 0.1]} c={COL.darkSteel} />
          </group>
        );
      })}
      <B p={[HX0 + 1, GND + WALL_H + 0.12, 0]} s={[2, 0.08, HD]} c="#8aa3bd" />

      {/* di atap datar: dua unit HVAC dan tiga ventilator */}
      {[-1.2, 1.2].map((z) => (
        <group key={z}>
          <B p={[HX0 + 1, GND + WALL_H + 0.55, z]} s={[1.3, 0.8, 1.0]} c="#e8ebef" metal={0.2} />
          <C p={[HX0 + 1, GND + WALL_H + 1.0, z]} r={0.35} h={0.08} c={COL.darkSteel} seg={14} />
        </group>
      ))}
      {[-2, 0, 2].map((z) => (
        <group key={z}>
          <C p={[HX0 + 2.5, GND + WALL_H + 0.4, z]} r={0.3} h={0.5} c={COL.steel} seg={12} />
          <Dome p={[HX0 + 2.5, GND + WALL_H + 0.65, z]} r={0.36} sy={0.5} c={COL.darkSteel} />
        </group>
      ))}

      {/* pintu rolling di sisi depan */}
      {[-3.4, -1.2].map((dx) => (
        <B key={dx} p={[hcx + dx, GND + 1.2, HD / 2 + 0.04]} s={[1.9, 2.4, 0.06]} c="#9aa4b0" />
      ))}
      <Inst items={slats} c="#7d8794" />
      {[-3.4, -1.2].map((dx) => (
        <B key={`h${dx}`} p={[hcx + dx, GND + 2.45, HD / 2 + 0.08]} s={[2.1, 0.1, 0.1]} c={COL.darkSteel} />
      ))}

      {/* dok bongkar muat (kanan): platform dock, dua bay truk, dock leveler */}
      <B p={[HX0 + HW + 0.6, GND + 0.55, 0]} s={[1.2, 1.1, 5.2]} c="#8b8f96" metal={0} rough={0.95} />
      <Inst items={dockLines} c={COL.yellow} metal={0} rough={0.8} />
      {[-1.5, 1.5].map((z) => (
        <group key={z}>
          <B p={[HX0 + HW + 0.02, GND + 1.9, z]} s={[0.06, 1.6, 1.8]} c="#9aa4b0" />
          <B p={[HX0 + HW + 0.8, GND + 1.12, z]} s={[0.9, 0.06, 1.6]} c={COL.yellow} />
          <B p={[HX0 + HW + 1.35, GND + 0.55, z - 0.7]} s={[0.1, 0.4, 0.2]} c={COL.black} />
          <B p={[HX0 + HW + 1.35, GND + 0.55, z + 0.7]} s={[0.1, 0.4, 0.2]} c={COL.black} />
          <Lamp p={[HX0 + HW + 0.1, GND + 2.9, z]} c="#3dd68c" r={0.06} phase={z} />
        </group>
      ))}

      {/* kanopi samping depan */}
      <B p={[HX0 + 4.6, GND + 2.85, HD / 2 + 1.0]} s={[10, 0.08, 2]} c="#8aa3bd" metal={0.5} />
      <Inst items={canopyPosts} c={COL.frame} />

      {/* annex kantor kecil */}
      <B p={[HX0 - 1.4, GND + 1.3, 1.4]} s={[2.4, 2.6, 2.8]} c="#e8ebef" metal={0.2} />
      <B p={[HX0 - 1.4, GND + 2.65, 1.4]} s={[2.6, 0.1, 3.0]} c={COL.darkSteel} />
      <B p={[HX0 - 1.4, GND + 1.7, 1.4 + 1.42]} s={[1.9, 0.6, 0.03]} m={glass} />
      <B p={[HX0 - 2.62, GND + 1.0, 1.4]} s={[0.04, 2.0, 0.9]} c={COL.darkSteel} />
      <B p={[HX0 - 1.4, GND + 2.95, 1.4]} s={[0.8, 0.4, 0.6]} c="#e8ebef" metal={0.2} />

      {/* palet dan karton di halaman */}
      <Inst items={pallets} c="#a68a5a" metal={0.05} rough={0.9} />
      <Inst items={cartons} c="#c9a56b" metal={0.05} rough={0.9} />
    </group>
  );
}

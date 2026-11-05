"use client";

import { B, IBeam, Leg, Pipe, Rail, Stairs, COL } from "./prims";
import { Inst, type InstItem } from "./instances";

// Rangka baja bangunan: kolom H-beam di atas pedestal dengan base plate dan baut angkur, balok, bracing X, sebagian atap dengan gording,
// sebagian dek (mezzanine), scaffolding di satu sisi, dan tangga kerja.
const GND = 0.12;
const COLX = [-5, -2.5, 0, 2.5];
const ROWZ = [-2.5, 1.5];
const H = 4.5; // tinggi kolom (dari permukaan slab)
const PED = 0.4; // tinggi pedestal

export function CivilSteelModel() {
  const top = GND + PED + H;
  const webs: InstItem[] = [];
  const flanges: InstItem[] = [];
  const peds: InstItem[] = [];
  const plates: InstItem[] = [];
  const bolts: InstItem[] = [];
  for (const x of COLX)
    for (const z of ROWZ) {
      webs.push({ p: [x, GND + PED + H / 2, z], s: [0.03, H, 0.3] });
      for (const sd of [-1, 1]) flanges.push({ p: [x, GND + PED + H / 2, z + sd * 0.15], s: [0.2, H, 0.03] });
      peds.push({ p: [x, GND + PED / 2 - 0.02, z], s: [0.7, PED, 0.7] });
      plates.push({ p: [x, GND + PED + 0.02, z], s: [0.45, 0.04, 0.45] });
      for (const a of [-1, 1]) for (const b of [-1, 1]) bolts.push({ p: [x + a * 0.17, GND + PED + 0.1, z + b * 0.17], s: [0.018, 0.16, 0.018] });
    }
  const purlins: InstItem[] = [];
  for (let i = 0; i < 11; i++) purlins.push({ p: [-0.1 + i * 0.28, top + 0.1, -0.5], s: [0.05, 0.08, 4.2] });
  const purlinsSheet: InstItem[] = [];
  for (let i = 0; i < 9; i++) purlinsSheet.push({ p: [-2.4 + i * 0.28, top + 0.1, -0.5], s: [0.05, 0.08, 4.2] });
  const stand: InstItem[] = [];
  for (let x = -5; x <= 0.01; x += 1.25) stand.push({ p: [x, GND + 2.1, 2.5], s: [0.06, 4.2, 0.06] });
  const ledgers: InstItem[] = [];
  for (const y of [0.9, 2.1, 3.3, 4.5]) ledgers.push({ p: [-2.5, GND + y, 2.5], s: [5.1, 0.05, 0.05] });
  const transoms: InstItem[] = [];
  for (const y of [0.9, 2.1, 3.3, 4.5]) for (let x = -5; x <= 0.01; x += 1.25) transoms.push({ p: [x, GND + y, 2.0], s: [0.04, 0.04, 1.0] });
  const pallet: InstItem[] = [];
  for (let i = 0; i < 4; i++) pallet.push({ p: [4.4, GND + 0.18 + i * 0.27, -4.2], s: [3.2, 0.12, 0.35] }, { p: [4.4, GND + 0.18 + i * 0.27, -4.7], s: [3.2, 0.12, 0.35] });

  return (
    <group>
      <B p={[0, 0.06, 0]} s={[14, 0.12, 10]} c={COL.concrete} metal={0.05} rough={0.9} />

      {/* kolom H-beam, pedestal, base plate, baut angkur */}
      <Inst items={peds} c="#8b8f96" metal={0} rough={0.95} />
      <Inst items={plates} c={COL.darkSteel} />
      <Inst items={bolts} c="#d3d8de" metal={0.7} />
      <Inst items={webs} c={COL.frame} />
      <Inst items={flanges} c={COL.frame} />

      {/* balok atas dan mezzanine */}
      {ROWZ.map((z) => (
        <IBeam key={z} p={[-1.25, top, z]} len={7.5} size={0.3} />
      ))}
      {COLX.map((x) => (
        <IBeam key={x} p={[x, top, -0.5]} len={4} size={0.3} rot={[0, Math.PI / 2, 0]} />
      ))}
      {[-5, -2.5, 0, 2.5].map((x) => (
        <IBeam key={`m${x}`} p={[x, GND + PED + 2.4, -0.5]} len={4} size={0.26} rot={[0, Math.PI / 2, 0]} />
      ))}
      {ROWZ.map((z) => (
        <IBeam key={`ml${z}`} p={[-1.25, GND + PED + 2.4, z]} len={7.5} size={0.26} />
      ))}
      <B p={[-3.75, GND + PED + 2.49, -0.5]} s={[5, 0.06, 4]} c="#9aa4b0" metal={0.5} />

      {/* bracing X: bidang belakang (bay 1) dan sisi kiri */}
      <Pipe a={[-5, GND + PED + 0.2, ROWZ[0]]} b={[-2.5, top - 0.2, ROWZ[0]]} r={0.035} c={COL.steel} seg={5} />
      <Pipe a={[-5, top - 0.2, ROWZ[0]]} b={[-2.5, GND + PED + 0.2, ROWZ[0]]} r={0.035} c={COL.steel} seg={5} />
      <Pipe a={[-5, GND + PED + 0.2, ROWZ[0]]} b={[-5, top - 0.2, ROWZ[1]]} r={0.035} c={COL.steel} seg={5} />
      <Pipe a={[-5, top - 0.2, ROWZ[0]]} b={[-5, GND + PED + 0.2, ROWZ[1]]} r={0.035} c={COL.steel} seg={5} />

      {/* atap: bay kanan berlembar, bay tengah baru gording */}
      <Inst items={purlins} c="#9aa4b0" />
      <B p={[1.25, top + 0.2, -0.5]} s={[2.7, 0.04, 4.3]} c="#8aa3bd" metal={0.5} />
      <Inst items={purlinsSheet} c="#9aa4b0" />

      {/* scaffolding di sisi depan */}
      <Inst items={stand} c={COL.steel} />
      <Inst items={ledgers} c={COL.steel} />
      <Inst items={transoms} c={COL.steel} />
      <B p={[-2.5, GND + 2.15, 2.1]} s={[5.1, 0.05, 0.9]} c={COL.yellow} />
      <B p={[-2.5, GND + 3.35, 2.1]} s={[5.1, 0.05, 0.9]} c={COL.yellow} />
      <Pipe a={[-5, GND + 0.1, 2.5]} b={[-1.25, GND + 2.1, 2.5]} r={0.025} c={COL.steel} seg={4} />
      <Pipe a={[-1.25, GND + 0.1, 2.5]} b={[-5, GND + 2.1, 2.5]} r={0.025} c={COL.steel} seg={4} />

      {/* tangga kerja ke mezzanine */}
      <Stairs p={[4.6, GND, -0.8]} h={2.9} w={0.8} dir={-1} steps={12} />
      <Rail p={[3.4, GND + 2.9, 0.3]} len={2.2} h={0.9} rot={[0, Math.PI / 2, 0]} />

      {/* dua pedestal kosong untuk kolom berikutnya */}
      {[-2.5, 1.5].map((z) => (
        <group key={z}>
          <B p={[5.8, GND + 0.2, z]} s={[0.8, 0.4, 0.8]} c="#8b8f96" metal={0} rough={0.95} />
          <Leg p={[5.8, GND + 0.4, z]} h={1.6} size={0.2} />
        </group>
      ))}

      {/* tumpukan balok baja di sadel */}
      <Inst items={pallet} c={COL.frame} />
      <B p={[4.4, GND + 0.06, -4.45]} s={[3.4, 0.1, 0.12]} c={COL.concrete} />
    </group>
  );
}

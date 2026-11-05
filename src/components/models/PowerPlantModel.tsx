"use client";

import { B, C, CX, Pipe, COL, type V3 } from "./prims";
import { Inst, type InstItem } from "./instances";
import { FanUnit, Tower, Transformer } from "./industrial";

// Gambaran keseluruhan pembangkit: power house dengan louver atap, dua cerobong, area trafo, menara transmisi, tangki bahan bakar,
// unit kipas pendingin, jembatan pipa, pagar, dan jalan kecil. Berbeda dari model Gas Engine (satu unit mesin).
const GND = 0.12;
const PH_X = -2.5; // pusat power house
const PH_W = 8;
const PH_D = 4.2;
const PH_H = 3.6;

function Chimney({ x, z }: { x: number; z: number }) {
  return (
    <group>
      <C p={[x, GND + 3.5, z]} r={0.38} h={7} c="#dfe3e8" seg={16} />
      {[0.55, 0.85].map((k) => (
        <C key={k} p={[x, GND + 7 * k, z]} r={0.4} h={0.5} c={COL.red} seg={16} />
      ))}
      <C p={[x, GND + 7.02, z]} r={0.44} h={0.08} c={COL.darkSteel} seg={16} />
      <Ladder3 x={x} z={z + 0.42} />
    </group>
  );
}

/** Tangga cerobong tipis (dua rel + anak tangga dengan instancing). */
function Ladder3({ x, z }: { x: number; z: number }) {
  const rungs: InstItem[] = [];
  for (let i = 0; i < 20; i++) rungs.push({ p: [x, GND + 0.4 + i * 0.32, z], s: [0.14, 0.02, 0.02] });
  return (
    <>
      <Inst items={rungs} c={COL.steel} />
      <B p={[x - 0.07, GND + 3.4, z]} s={[0.02, 6.6, 0.02]} c={COL.steel} />
      <B p={[x + 0.07, GND + 3.4, z]} s={[0.02, 6.6, 0.02]} c={COL.steel} />
    </>
  );
}

export function PowerPlantModel() {
  const ribs: InstItem[] = [];
  for (let i = 0; i < 16; i++) for (const sd of [-1, 1]) ribs.push({ p: [PH_X - PH_W / 2 + 0.25 + i * 0.5, GND + 1.7, sd * (PH_D / 2 + 0.03)], s: [0.05, 3.2, 0.04] });
  const louvers: InstItem[] = [];
  for (let i = 0; i < 7; i++) for (const sd of [-1, 1]) louvers.push({ p: [PH_X, GND + PH_H + 0.12 + i * 0.07, sd * 0.82], s: [5.6, 0.03, 0.06], rot: [sd * 0.5, 0, 0] });
  const posts: InstItem[] = [];
  for (let x = -9.5; x <= 9.5; x += 1) for (const z of [-5.8, 5.8]) posts.push({ p: [x, GND + 0.5, z], s: [0.05, 1, 0.05] });
  for (let z = -5.5; z <= 5.5; z += 1) posts.push({ p: [9.8, GND + 0.5, z], s: [0.05, 1, 0.05] }, { p: [-9.8, GND + 0.5, z], s: [0.05, 1, 0.05] });
  const dashes: InstItem[] = [];
  for (let x = -9; x <= 9; x += 1.4) dashes.push({ p: [x, GND + 0.012, 4.9], s: [0.6, 0.01, 0.05] });
  const bridgePosts: V3[] = [-6.5, -2, 2.5, 7].map((x) => [x, GND + 1.2, 3.6]);

  return (
    <group>
      <B p={[0, 0.06, 0]} s={[20, 0.12, 12]} c={COL.concrete} metal={0.05} rough={0.9} />
      <B p={[0, GND + 0.006, 4.9]} s={[20, 0.012, 1.2]} c="#3b3f46" metal={0} rough={1} />
      <Inst items={dashes} c="#e8ebef" metal={0} rough={1} />

      {/* power house */}
      <B p={[PH_X, GND + PH_H / 2, 0]} s={[PH_W, PH_H, PH_D]} c="#c9d2dc" metal={0.2} />
      <Inst items={ribs} c="#aab5c2" />
      <B p={[PH_X, GND + PH_H + 0.05, 0]} s={[PH_W + 0.3, 0.12, PH_D + 0.3]} c={COL.darkSteel} />
      <B p={[PH_X, GND + PH_H + 0.3, 0]} s={[5.8, 0.5, 1.6]} c="#8b95a3" />
      <Inst items={louvers} c={COL.darkSteel} />
      <B p={[PH_X, GND + 2.7, PH_D / 2 + 0.02]} s={[PH_W * 0.85, 0.5, 0.03]} c={COL.glass} metal={0.9} rough={0.1} />
      <B p={[PH_X + 2.4, GND + 1.0, PH_D / 2 + 0.03]} s={[1.6, 2.0, 0.05]} c={COL.darkSteel} />
      <B p={[PH_X - 2.4, GND + 1.0, PH_D / 2 + 0.03]} s={[1.6, 2.0, 0.05]} c={COL.darkSteel} />

      {/* dua cerobong di belakang */}
      <Chimney x={-4.8} z={-3.3} />
      <Chimney x={-2.2} z={-3.3} />
      <Pipe a={[-4.8, GND + 2.5, -2.2]} b={[-4.8, GND + 2.5, -3.3]} r={0.3} c="#a9b2bd" />
      <Pipe a={[-2.2, GND + 2.5, -2.2]} b={[-2.2, GND + 2.5, -3.3]} r={0.3} c="#a9b2bd" />

      {/* area trafo + menara transmisi */}
      <B p={[4.7, GND + 0.01, 0]} s={[4.2, 0.02, 5.4]} c="#8a8f97" metal={0} rough={1} />
      <Transformer p={[4.7, GND, -1.4]} />
      <Transformer p={[4.7, GND, 1.4]} />
      <Pipe a={[1.5, GND + 2.9, -0.8]} b={[3.9, GND + 2.2, -1.3]} r={0.04} c={COL.black} seg={5} />
      <Pipe a={[1.5, GND + 2.9, 0.8]} b={[3.9, GND + 2.2, 1.5]} r={0.04} c={COL.black} seg={5} />
      <Tower p={[8.2, GND, 0]} h={5.2} w={0.55} />
      <Pipe a={[5.4, GND + 2.15, 0]} b={[8.2, GND + 4.3, 0]} r={0.025} c={COL.black} seg={4} />

      {/* tangki bahan bakar (rebah, bertumpu pada sadel) di belakang trafo */}
      <CX p={[6, GND + 1.0, -4.4]} r={0.85} h={3.4} c="#d97706" seg={18} metal={0.3} />
      {[-1.1, 1.1].map((dx) => (
        <B key={dx} p={[6 + dx, GND + 0.35, -4.4]} s={[0.2, 0.7, 1.4]} c={COL.darkSteel} />
      ))}
      <C p={[6, GND + 1.9, -4.4]} r={0.12} h={0.3} c={COL.darkSteel} />

      {/* unit kipas pendingin */}
      <FanUnit p={[-8.6, GND, 1.5]} />
      <FanUnit p={[-8.6, GND, -1.5]} />

      {/* jembatan pipa di depan power house */}
      {bridgePosts.map((p, i) => (
        <B key={i} p={p} s={[0.16, 2.2, 0.16]} c={COL.frame} />
      ))}
      <B p={[0.25, GND + 2.3, 3.6]} s={[15, 0.1, 0.6]} c={COL.frame} />
      {[
        [-0.2, COL.blue],
        [0, "#d5dae0"],
        [0.2, COL.green],
      ].map(([dz, c]) => (
        <Pipe key={c as string} a={[-8.6, GND + 2.5, 3.6 + (dz as number)]} b={[7.5, GND + 2.5, 3.6 + (dz as number)]} r={0.09} c={c as string} />
      ))}
      <Pipe a={[-8.6, GND + 2.5, 1.5]} b={[-8.6, GND + 2.5, 3.4]} r={0.09} c={COL.blue} />

      {/* pagar keliling */}
      <Inst items={posts} c="#7a838f" />
      <B p={[0, GND + 0.95, -5.8]} s={[19.2, 0.03, 0.03]} c="#7a838f" />
      <B p={[0, GND + 0.95, 5.8]} s={[19.2, 0.03, 0.03]} c="#7a838f" />
      <B p={[9.8, GND + 0.95, 0]} s={[0.03, 0.03, 11.6]} c="#7a838f" />
      <B p={[-9.8, GND + 0.95, 0]} s={[0.03, 0.03, 11.6]} c="#7a838f" />
    </group>
  );
}

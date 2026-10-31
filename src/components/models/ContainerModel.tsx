"use client";

import { B, C, Cabinet, Pipe, COL, mat } from "./prims";
import { Spin } from "./anim";

const SKIN = "#2f6f8f";
const DARK = "#245a74";
const L = 6.0;
const W = 2.4;
const H = 2.6;
const Y0 = 0.35; // dasar container (di atas balok ganjal)

function Ribs({ side }: { side: 1 | -1 }) {
  const n = 40;
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <B key={i} p={[-L / 2 + 0.15 + (i * (L - 0.3)) / (n - 1), Y0 + H / 2, side * (W / 2 + 0.02)]} s={[0.06, H - 0.3, 0.05]} c={i % 2 ? DARK : SKIN} />
      ))}
    </>
  );
}

function Window({ x }: { x: number }) {
  return (
    <group position={[x, Y0 + 1.5, W / 2 + 0.06]}>
      <B s={[1.0, 0.8, 0.06]} c="#e8ebef" />
      <B p={[0, 0, 0.035]} s={[0.84, 0.64, 0.02]} c={COL.glass} metal={0.9} rough={0.1} />
      <B p={[0, 0, 0.05]} s={[0.04, 0.64, 0.02]} c="#e8ebef" />
    </group>
  );
}

function AC({ x }: { x: number }) {
  return (
    <group position={[x, Y0 + 2.0, W / 2 + 0.3]}>
      <B s={[1.1, 0.45, 0.4]} c="#eef1f4" metal={0.2} />
      <B p={[0, -0.12, 0.21]} s={[0.9, 0.08, 0.02]} c={COL.darkSteel} />
      <B p={[0, 0.05, 0.21]} s={[0.9, 0.04, 0.02]} c={COL.darkSteel} />
      <B p={[0, -0.4, -0.1]} s={[0.1, 0.35, 0.1]} c={COL.darkSteel} />
      <Pipe a={[0.4, -0.2, 0.1]} b={[0.4, -1.3, 0.1]} r={0.02} c={COL.black} seg={5} />
    </group>
  );
}

export function ContainerModel() {
  return (
    <group>
      <B p={[0, 0.06, 0]} s={[10, 0.12, 5.2]} c={COL.concrete} metal={0.05} rough={0.9} />
      {/* Balok ganjal */}
      {[-2.4, 0, 2.4].map((x) => (
        <B key={x} p={[x, 0.22, 0]} s={[0.4, 0.2, W]} c="#a9814f" metal={0} rough={0.9} />
      ))}

      {/* Badan container berusuk */}
      <B p={[0, Y0 + H / 2, 0]} s={[L, H, W]} c={SKIN} metal={0.4} rough={0.55} />
      <B p={[0, Y0 + H + 0.02, 0]} s={[L + 0.04, 0.06, W + 0.04]} c={DARK} />
      <Ribs side={1} />
      <Ribs side={-1} />
      {/* Rusuk atap */}
      {Array.from({ length: 12 }, (_, i) => (
        <B key={i} p={[-L / 2 + 0.3 + (i * (L - 0.6)) / 11, Y0 + H + 0.07, 0]} s={[0.07, 0.04, W - 0.1]} c={DARK} />
      ))}
      {/* Rel bawah & atas */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <B p={[0, Y0 + 0.05, s * (W / 2)]} s={[L, 0.14, 0.12]} c={COL.darkSteel} />
          <B p={[0, Y0 + H - 0.02, s * (W / 2)]} s={[L, 0.14, 0.12]} c={COL.darkSteel} />
        </group>
      ))}
      {/* Tonggak sudut + corner casting */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <group key={`${sx}${sz}`}>
            <B p={[sx * (L / 2), Y0 + H / 2, sz * (W / 2)]} s={[0.14, H, 0.14]} c={COL.darkSteel} />
            <B p={[sx * (L / 2), Y0 + H + 0.02, sz * (W / 2)]} s={[0.22, 0.12, 0.22]} c="#1f2329" />
            <B p={[sx * (L / 2), Y0 + 0.02, sz * (W / 2)]} s={[0.22, 0.12, 0.22]} c="#1f2329" />
          </group>
        )),
      )}

      {/* Pintu ganda di ujung +x */}
      <B p={[L / 2 + 0.02, Y0 + H / 2, 0]} s={[0.06, H - 0.2, W - 0.2]} c={DARK} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <B p={[L / 2 + 0.07, Y0 + H / 2, s * (W / 4 - 0.02)]} s={[0.05, H - 0.3, W / 2 - 0.12]} c={SKIN} />
          {/* batang kunci + handle */}
          {[0.12, 0.38].map((o) => (
            <C key={o} p={[L / 2 + 0.14, Y0 + H / 2, s * (W / 4 - 0.02) + s * (o - 0.25) * 0.9]} r={0.025} h={H - 0.45} seg={6} c="#d3d8de" metal={0.8} rough={0.3} />
          ))}
          <B p={[L / 2 + 0.2, Y0 + 1.1, s * 0.12]} s={[0.05, 0.1, 0.3]} c={COL.yellow} />
          {[0.5, 1.2, 2.0].map((y) => (
            <C key={y} p={[L / 2 + 0.09, Y0 + y, s * (W / 2 - 0.1)]} r={0.035} h={0.18} seg={6} c={COL.black} rot={[0, 0, 0]} />
          ))}
        </group>
      ))}
      <B p={[L / 2 + 0.09, Y0 + H / 2, 0]} s={[0.04, H - 0.3, 0.03]} c={COL.black} />

      {/* Versi control room: pintu orang, jendela, AC, tangga */}
      <B p={[-1.9, Y0 + 1.05, W / 2 + 0.05]} s={[0.95, 1.9, 0.08]} c="#e8ebef" />
      <B p={[-1.9, Y0 + 1.05, W / 2 + 0.1]} s={[0.8, 1.75, 0.03]} c="#cdd3da" />
      <B p={[-1.6, Y0 + 1.05, W / 2 + 0.13]} s={[0.05, 0.25, 0.05]} c={COL.black} />
      <B p={[-1.9, Y0 + 1.75, W / 2 + 0.13]} s={[0.4, 0.3, 0.02]} c={COL.glass} metal={0.9} rough={0.1} />
      <Window x={0.2} />
      <Window x={1.7} />
      <AC x={0.95} />
      {/* Teras kecil + tangga */}
      <B p={[-1.9, 0.5, W / 2 + 0.55]} s={[1.3, 0.08, 1.0]} c={COL.yellow} />
      {[0.2, 0.35, 0.5].map((y, i) => (
        <B key={y} p={[-1.9, y - 0.05, W / 2 + 1.15 + i * 0.0]} s={[1.0, 0.04, 0.25]} c={COL.darkSteel} rot={[0, 0, 0]} />
      ))}
      <B p={[-1.9, 0.3, W / 2 + 1.05]} s={[1.0, 0.04, 0.3]} c={COL.darkSteel} />
      <B p={[-1.9, 0.15, W / 2 + 1.3]} s={[1.0, 0.04, 0.3]} c={COL.darkSteel} />
      {[-0.65, 0.65].map((x) => (
        <B key={x} p={[-1.9 + x, 0.85, W / 2 + 0.55]} s={[0.04, 0.7, 0.04]} c={COL.yellow} />
      ))}
      <B p={[-1.9, 1.2, W / 2 + 1.0]} s={[1.3, 0.04, 0.04]} c={COL.yellow} />

      {/* Lampu luar + kabel */}
      <B p={[-1.9, Y0 + 2.35, W / 2 + 0.15]} s={[0.35, 0.12, 0.2]} c="#f6f8fa" />
      <B p={[-1.9, Y0 + 2.35, W / 2 + 0.26]} s={[0.3, 0.06, 0.02]} m={mat("#fff6c9", 0.1, 0.3, { emissive: "#ffe08a", emissiveIntensity: 1 })} />

      {/* Kipas exhaust di atap */}
      <C p={[-2.0, Y0 + H + 0.2, 0]} r={0.28} h={0.25} seg={14} c={COL.steel} />
      <Spin p={[-2.0, Y0 + H + 0.35, 0]} axis="y" speed={6}>
        <>
          {[0, 1, 2].map((i) => (
            <B key={i} s={[0.4, 0.015, 0.1]} rot={[0, (i * Math.PI) / 1.5, 0]} c={COL.darkSteel} />
          ))}
        </>
      </Spin>

      {/* Panel listrik samping */}
      <Cabinet p={[3.9, 0.12, 1.7]} s={[0.8, 1.3, 0.4]} rot={[0, -0.2, 0]} />
    </group>
  );
}

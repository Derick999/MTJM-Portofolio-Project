"use client";

import { B, Ball, C, CX, Cabinet, Cone, Dome, Elbow, Flange, IBeam, Ladder, Leg, Pipe, PipeRun, Platform, Rail, Stairs, Valve, COL } from "./prims";
import { Steam } from "./anim";

const SHELL = COL.blue;
const FEED = "#4aa3d9";
const STEAM = "#cdd3da";

export function BoilerModel() {
  return (
    <group>
      {/* Pondasi beton */}
      <B p={[0.3, 0.06, 0]} s={[10, 0.12, 5.4]} c={COL.concrete} metal={0.05} rough={0.9} />

      {/* Rangka baja (skid) */}
      {[-0.75, 0.75].map((z) => (
        <IBeam key={z} p={[0, 0.5, z]} len={6.2} size={0.26} />
      ))}
      {[-2.6, -0.9, 0.9, 2.6].map((x) => (
        <B key={x} p={[x, 0.5, 0]} s={[0.18, 0.2, 1.6]} c={COL.frame} />
      ))}
      {[-2.8, 2.8].flatMap((x) => [-0.75, 0.75].map((z) => <Leg key={`${x}${z}`} p={[x, 0, z]} h={0.4} />))}
      {/* Sadel drum */}
      {[-1.8, 0, 1.8].map((x) => (
        <B key={x} p={[x, 0.85, 0]} s={[0.5, 0.5, 1.4]} c={COL.darkSteel} />
      ))}

      {/* Drum utama + tutup melengkung */}
      <CX p={[0, 1.85, 0]} r={1.05} h={5} seg={24} c={SHELL} metal={0.5} rough={0.4} />
      <Dome p={[2.5, 1.85, 0]} r={1.05} sy={0.4} rot={[0, 0, -Math.PI / 2]} c={SHELL} metal={0.5} rough={0.4} />
      <Dome p={[-2.5, 1.85, 0]} r={1.05} sy={0.4} rot={[0, 0, Math.PI / 2]} c={SHELL} metal={0.5} rough={0.4} />
      {/* Pita penguat / lagging */}
      {[-2, -1, 0, 1, 2].map((x) => (
        <CX key={x} p={[x, 1.85, 0]} r={1.075} h={0.1} seg={24} c={COL.darkSteel} />
      ))}
      {/* Manhole di dome depan */}
      <CX p={[2.86, 1.85, 0]} r={0.28} h={0.1} c={COL.steel} />
      <Flange p={[2.92, 1.85, 0]} r={0.3} axis="x" bolts={8} />
      {/* Plat nama */}
      <B p={[0.4, 1.85, 1.08]} s={[0.7, 0.35, 0.03]} c="#d9dde2" />

      {/* Smoke box + cerobong */}
      <B p={[-3.25, 1.75, 0]} s={[1, 2, 1.5]} c={COL.darkSteel} />
      <B p={[-3.25, 2.8, 0]} s={[1.1, 0.12, 1.6]} c={COL.frame} />
      <C p={[-3.25, 4.75, 0]} r={0.36} h={4} seg={16} c="#9aa3ad" />
      {[3.7, 4.3].map((y, i) => (
        <C key={y} p={[-3.25, y + 1.4, 0]} r={0.375} h={0.32} seg={16} c={i % 2 ? COL.white : COL.red} />
      ))}
      <C p={[-3.25, 6.75, 0]} r={0.43} h={0.1} seg={16} c={COL.darkSteel} />
      <Ladder p={[-3.25, 2.8, 0.42]} h={3.6} w={0.36} rot={[0, Math.PI / 2, 0]} />
      {/* Penahan cerobong */}
      <Pipe a={[-3.25, 5.2, 0.35]} b={[-2.2, 0.15, 1.9]} r={0.015} c={COL.darkSteel} />
      <Pipe a={[-3.25, 5.2, -0.35]} b={[-2.2, 0.15, -1.9]} r={0.015} c={COL.darkSteel} />
      <Steam p={[-3.25, 6.85, 0]} />

      {/* Burner di ujung depan */}
      <B p={[3.5, 1.85, 0]} s={[0.8, 1.2, 1.2]} c={COL.orange} />
      <CX p={[3.0, 1.85, 0]} r={0.3} h={0.3} c={COL.darkSteel} />
      <Cone p={[3.15, 1.85, 0]} r={0.2} h={0.35} rot={[0, 0, Math.PI / 2]} c={COL.yellow} />
      <C p={[3.5, 2.7, 0]} r={0.42} h={0.5} seg={16} c={COL.steel} />
      <Dome p={[3.5, 2.95, 0]} r={0.42} sy={0.5} c={COL.steel} />
      <CX p={[3.5, 1.2, 0.7]} r={0.2} h={0.6} rot={[0, 0, 0]} c={COL.darkSteel} />
      <B p={[3.7, 1.0, 0]} s={[1.0, 0.1, 1.3]} c={COL.frame} />
      {/* Motor blower */}
      <CX p={[4.4, 2.1, 0]} r={0.3} h={0.8} seg={16} c={COL.green} />
      <Pipe a={[3.9, 2.1, 0]} b={[3.7, 2.45, 0]} r={0.14} c={COL.steel} />
      {/* Penutup panel burner */}
      <B p={[3.5, 1.85, 0.62]} s={[0.7, 0.5, 0.03]} c={COL.darkSteel} />

      {/* Jalur steam + safety valve */}
      <C p={[0.8, 2.95, 0]} r={0.17} h={0.3} c={COL.steel} />
      <Flange p={[0.8, 3.12, 0]} r={0.26} />
      <PipeRun pts={[[0.8, 3.15, 0], [0.8, 4.0, 0], [0.8, 4.0, 2.0], [0.8, 1.4, 2.0]]} r={0.14} c={STEAM} />
      <Flange p={[0.8, 3.5, 0]} r={0.24} />
      <Flange p={[0.8, 4.0, 1.0]} r={0.24} axis="z" />
      <Valve p={[0.8, 4.0, 0.5]} r={0.12} axis="z" c={COL.red} />
      <Flange p={[0.8, 2.0, 2.0]} r={0.24} />
      {/* Cabang steam ke samping */}
      <PipeRun pts={[[0.8, 4.0, 1.4], [-0.8, 4.0, 1.4], [-0.8, 3.2, 1.4]]} r={0.1} c={STEAM} />
      <Valve p={[-0.1, 4.0, 1.4]} r={0.1} axis="x" c={COL.yellow} />
      <Ball p={[0.8, 4.0, 1.4]} r={0.17} c={STEAM} />
      {/* Safety valve */}
      <C p={[-0.7, 3.1, 0]} r={0.12} h={0.55} c={COL.red} />
      <Ball p={[-0.7, 3.45, 0]} r={0.16} c={COL.red} />
      <Pipe a={[-0.7, 3.5, 0]} b={[-0.7, 4.5, 0]} r={0.08} c={STEAM} />
      <Elbow p={[-0.7 - 0.2, 4.5, 0]} R={0.2} r={0.08} rot={[0, 0, 0]} c={STEAM} />

      {/* Jalur feedwater bercabang */}
      <PipeRun pts={[[1.8, 0.5, 2.6], [1.8, 1.4, 2.6], [1.8, 1.4, 1.7], [-1.4, 1.4, 1.7]]} r={0.1} c={FEED} />
      {[-1.2, 0.2, 1.4].map((x) => (
        <group key={x}>
          <Pipe a={[x, 1.4, 1.7]} b={[x, 1.4, 0.98]} r={0.07} c={FEED} />
          <Flange p={[x, 1.4, 1.2]} r={0.15} axis="z" />
          <Ball p={[x, 1.4, 1.7]} r={0.13} c={FEED} />
        </group>
      ))}
      <Valve p={[1.8, 1.4, 2.15]} r={0.1} axis="z" c={COL.blue} />
      {/* Pompa feedwater */}
      <B p={[1.8, 0.16, 2.8]} s={[1.3, 0.1, 0.7]} c={COL.frame} />
      <CX p={[2.3, 0.5, 2.8]} r={0.22} h={0.7} seg={14} c={COL.green} />
      <Ball p={[1.65, 0.5, 2.8]} r={0.27} c={COL.darkSteel} />
      <Pipe a={[1.8, 0.5, 2.8]} b={[1.8, 0.5, 2.6]} r={0.08} c={FEED} />

      {/* Platform, railing, dan tangga di sisi belakang */}
      <Platform p={[0.2, 2.55, -1.6]} s={[4.2, 1.0]} />
      <Rail p={[0.2, 2.55, -2.1]} len={4.2} h={0.55} />
      <Rail p={[-1.9, 2.55, -1.6]} len={1.0} h={0.55} rot={[0, Math.PI / 2, 0]} />
      {[-1.9, 0.2, 2.3].map((x) => (
        <B key={x} p={[x, 1.27, -2.0]} s={[0.1, 2.5, 0.1]} c={COL.frame} />
      ))}
      <B p={[0.2, 1.7, -2.0]} s={[4.2, 0.07, 0.07]} c={COL.frame} />
      <Stairs p={[2.3, 0.05, -1.6]} h={2.5} w={0.7} dir={1} steps={9} />
      <Rail p={[3.2, 1.3, -1.25]} len={2.0} h={0.55} rot={[0, 0, 0.9]} />

      {/* Panel kontrol */}
      <Cabinet p={[4.2, 0, 1.4]} rot={[0, -0.5, 0]} />
      <Pipe a={[4.2, 1.5, 1.2]} b={[3.7, 2.0, 0.6]} r={0.025} c={COL.black} />
    </group>
  );
}

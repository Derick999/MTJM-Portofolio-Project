"use client";

import { B, C, CX, Dome, IBeam, Pipe, PipeRun, COL, mat } from "./prims";

const BODY = "#5e7f66";

function Jack({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <B p={[0, 0.06, 0]} s={[0.6, 0.06, 0.6]} c={COL.darkSteel} />
      <C p={[0, 0.3, 0]} r={0.16} h={0.5} seg={12} c={COL.yellow} />
      <C p={[0, 0.65, 0]} r={0.1} h={0.25} seg={10} c="#dfe5ea" metal={0.8} rough={0.2} />
      <B p={[0, 0.8, 0]} s={[0.35, 0.05, 0.35]} c={COL.darkSteel} />
      <C p={[0, 0.2, 0]} r={0.19} h={0.06} seg={12} c={COL.red} />
      <PipeRun pts={[[0.15, 0.4, 0], [0.4, 0.3, 0.3], [0.7, 0.1, 0.5]]} r={0.025} c={COL.black} joint={false} />
    </group>
  );
}

export function RelocationModel() {
  return (
    <group>
      <B p={[0, 0.06, 0]} s={[11, 0.12, 5.4]} c={COL.concrete} metal={0.05} rough={0.9} />

      {/* Pelat baja dan balok rel */}
      <B p={[-1.5, 0.15, 0]} s={[3, 0.06, 3.4]} c="#5d6470" />
      <B p={[3.1, 0.15, 0]} s={[3, 0.06, 3.4]} c="#5d6470" />
      {[-0.95, 0.95].map((z) => (
        <IBeam key={z} p={[0.9, 0.3, z]} len={9} size={0.3} c={COL.yellow} />
      ))}

      {/* Roller */}
      {Array.from({ length: 9 }, (_, i) => (
        <group key={i}>
          {[-0.95, 0.95].map((z) => (
            <C key={z} p={[-1.7 + i * 0.5, 0.58, z]} r={0.11} h={0.4} rot={[Math.PI / 2, 0, 0]} seg={10} c="#c3cad2" metal={0.8} rough={0.3} />
          ))}
        </group>
      ))}

      {/* Skid peralatan */}
      {[-0.95, 0.95].map((z) => (
        <IBeam key={z} p={[0.4, 0.82, z]} len={4.6} size={0.26} c={COL.frame} />
      ))}
      {[-1.6, -0.5, 0.6, 1.7, 2.4].map((x) => (
        <B key={x} p={[x, 0.82, 0]} s={[0.15, 0.18, 2.1]} c={COL.frame} />
      ))}
      <B p={[0.4, 1.0, 0]} s={[4.6, 0.1, 2.3]} c={COL.darkSteel} />

      {/* Modul peralatan (transformator) */}
      <B p={[0.4, 2.15, 0]} s={[3.4, 2.1, 1.8]} c={BODY} metal={0.45} rough={0.45} />
      <B p={[0.4, 3.24, 0]} s={[3.5, 0.08, 1.9]} c={COL.darkSteel} />
      {[-1.2, -0.4, 0.4, 1.2].map((x) => (
        <B key={x} p={[x + 0.4, 2.15, 0.93]} s={[0.12, 1.9, 0.06]} c="#4d6a54" />
      ))}
      {/* Radiator fin di sisi */}
      {Array.from({ length: 9 }, (_, i) => (
        <B key={i} p={[-0.85 + i * 0.28 + 0.4, 2.0, 1.4]} s={[0.07, 1.7, 0.45]} c="#9fb3a5" />
      ))}
      <B p={[0.4, 3.0, 1.4]} s={[2.7, 0.08, 0.45]} c={COL.darkSteel} />
      <B p={[0.4, 1.15, 1.4]} s={[2.7, 0.08, 0.45]} c={COL.darkSteel} />
      {/* Bushing keramik */}
      {[-0.9, 0, 0.9].map((x, i) => (
        <group key={i} position={[x + 0.4, 3.28, -0.2]}>
          <C p={[0, 0.3, 0]} r={0.13} h={0.6} seg={10} c="#c8895a" metal={0.1} rough={0.6} />
          {[0.15, 0.3, 0.45].map((y) => (
            <C key={y} p={[0, y, 0]} r={0.19} h={0.06} seg={10} c="#c8895a" metal={0.1} />
          ))}
          <C p={[0, 0.65, 0]} r={0.05} h={0.12} seg={6} c={COL.steel} />
        </group>
      ))}
      {/* Konservator */}
      <CX p={[0.4, 3.75, 0.7]} r={0.3} h={2.4} seg={14} c="#6f8f77" />
      <Dome p={[1.6, 3.75, 0.7]} r={0.3} sy={0.5} rot={[0, 0, -Math.PI / 2]} c="#6f8f77" />
      <Dome p={[-0.8, 3.75, 0.7]} r={0.3} sy={0.5} rot={[0, 0, Math.PI / 2]} c="#6f8f77" />
      <Pipe a={[0.4, 3.3, 0.7]} b={[0.4, 3.5, 0.7]} r={0.05} c={COL.pipe} />
      {/* Lifting lugs */}
      {[-1.1, 1.9].map((x) => (
        <mesh key={x} position={[x, 3.32, 0.75]} rotation={[0, 0, 0]} material={mat(COL.red, 0.3, 0.5)} castShadow>
          <torusGeometry args={[0.1, 0.03, 5, 8]} />
        </mesh>
      ))}

      {/* Dongkrak hidrolik di sudut */}
      {[-1.7, 2.5].flatMap((x) => [-1.05, 1.05].map((z) => <Jack key={`${x}${z}`} x={x} z={z * 1.42} />))}

      {/* Silinder dorong horizontal + pompa hidrolik */}
      <CX p={[4.5, 0.55, 0]} r={0.14} h={1.1} seg={12} c={COL.yellow} />
      <CX p={[3.5, 0.55, 0]} r={0.07} h={0.9} seg={8} c="#dfe5ea" metal={0.8} rough={0.2} />
      <B p={[5.2, 0.35, 0]} s={[0.2, 0.7, 0.9]} c={COL.darkSteel} />
      <B p={[5.2, 0.95, 1.8]} s={[0.9, 0.55, 0.7]} c={COL.orange} />
      <PipeRun pts={[[4.9, 0.7, 0.3], [5.0, 0.7, 1.4], [5.2, 0.9, 1.6]]} r={0.025} c={COL.black} joint={false} />

      {/* Tumpukan cribbing kayu */}
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[-4.4, 0.12 + i * 0.16, -1.6]} rotation={[0, i % 2 ? Math.PI / 2 : 0, 0]}>
          <B p={[0, 0.08, -0.25]} s={[1.2, 0.14, 0.2]} c="#a9814f" metal={0} rough={0.9} />
          <B p={[0, 0.08, 0.25]} s={[1.2, 0.14, 0.2]} c="#a9814f" metal={0} rough={0.9} />
        </group>
      ))}
    </group>
  );
}

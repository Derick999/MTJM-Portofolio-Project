"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import { B, Ball, C, CX, Pipe, COL, mat, type V3 } from "./prims";
import { Inst, type InstItem } from "./instances";
import { Spin } from "./anim";
import { usePerf } from "./perf";

// Bagian yang dipakai bersama beberapa model (Power Plant, Electrical Work): lampu indikator, trafo bersirip, menara transmisi, kipas pendingin.

/** Lampu indikator kecil yang berkedip pelan (menyala tetap di perangkat lemah). */
export function Lamp({ p, c = "#ff3b2e", phase = 0, r = 0.04 }: { p: V3; c?: string; phase?: number; r?: number }) {
  const { weak } = usePerf();
  const m = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (weak || !m.current) return;
    m.current.emissiveIntensity = Math.sin(clock.elapsedTime * 3 + phase) > 0 ? 1.6 : 0.25;
  });
  return (
    <mesh position={p}>
      <sphereGeometry args={[r, 8, 6]} />
      <meshStandardMaterial ref={m} color={c} emissive={c} emissiveIntensity={1.4} />
    </mesh>
  );
}

/** Trafo daya: tangki, sirip radiator di dua sisi (instancing), konservator, tiga bushing keramik. */
export function Transformer({ p, rot = 0, scale = 1 }: { p: V3; rot?: number; scale?: number }) {
  const fins: InstItem[] = [];
  for (let i = 0; i < 11; i++)
    for (const sd of [-1, 1]) fins.push({ p: [(i - 5) * 0.15, 0.85, sd * 0.8], s: [0.05, 1.05, 0.45] });
  return (
    <group position={p} rotation={[0, rot, 0]} scale={scale}>
      <B p={[0, 0.08, 0]} s={[2, 0.16, 1.7]} c={COL.concrete} />
      <B p={[0, 0.85, 0]} s={[1.7, 1.3, 1.1]} c="#5d7a8c" metal={0.3} />
      <B p={[0, 1.52, 0]} s={[1.8, 0.08, 1.2]} c={COL.darkSteel} />
      <Inst items={fins} c="#7c97a8" metal={0.3} />
      <CX p={[0, 1.85, -0.25]} r={0.22} h={1.5} c={COL.steel} />
      <B p={[-0.6, 1.68, -0.25]} s={[0.1, 0.3, 0.2]} c={COL.darkSteel} />
      <B p={[0.6, 1.68, -0.25]} s={[0.1, 0.3, 0.2]} c={COL.darkSteel} />
      {[-1, 0, 1].map((i) => (
        <group key={i}>
          <C p={[i * 0.45, 1.85, 0.3]} r={0.07} h={0.55} c="#a0522d" seg={8} />
          <Ball p={[i * 0.45, 2.15, 0.3]} r={0.09} c={COL.darkSteel} />
        </group>
      ))}
    </group>
  );
}

/** Menara transmisi kisi: empat kaki mengerucut, ring penyangga, bracing silang, dua lengan dengan isolator. */
export function Tower({ p, h = 5, w = 0.5 }: { p: V3; h?: number; w?: number }) {
  const levels = [0, 0.38, 0.72, 1];
  const half = (t: number) => w * (1 - 0.7 * t);
  const corner = (t: number, sx: number, sz: number): V3 => [sx * half(t), t * h, sz * half(t)];
  const sgn = [-1, 1];
  return (
    <group position={p}>
      {sgn.flatMap((sx) => sgn.map((sz) => <Pipe key={`l${sx}${sz}`} a={corner(0, sx, sz)} b={corner(1, sx, sz)} r={0.035} c={COL.steel} seg={5} />))}
      {levels.slice(1).flatMap((t, i) => [
        <Pipe key={`rx${i}a`} a={corner(t, -1, -1)} b={corner(t, 1, -1)} r={0.02} c={COL.steel} seg={4} />,
        <Pipe key={`rx${i}b`} a={corner(t, -1, 1)} b={corner(t, 1, 1)} r={0.02} c={COL.steel} seg={4} />,
        <Pipe key={`rz${i}a`} a={corner(t, -1, -1)} b={corner(t, -1, 1)} r={0.02} c={COL.steel} seg={4} />,
        <Pipe key={`rz${i}b`} a={corner(t, 1, -1)} b={corner(t, 1, 1)} r={0.02} c={COL.steel} seg={4} />,
      ])}
      {levels.slice(0, -1).flatMap((t, i) => {
        const t2 = levels[i + 1];
        return [
          <Pipe key={`d${i}a`} a={corner(t, -1, -1)} b={corner(t2, 1, -1)} r={0.018} c={COL.steel} seg={4} />,
          <Pipe key={`d${i}b`} a={corner(t, 1, 1)} b={corner(t2, -1, 1)} r={0.018} c={COL.steel} seg={4} />,
          <Pipe key={`d${i}c`} a={corner(t, -1, 1)} b={corner(t2, -1, -1)} r={0.018} c={COL.steel} seg={4} />,
          <Pipe key={`d${i}d`} a={corner(t, 1, -1)} b={corner(t2, 1, 1)} r={0.018} c={COL.steel} seg={4} />,
        ];
      })}
      {[0.82, 0.62].map((t) => (
        <group key={t}>
          <B p={[0, t * h, 0]} s={[0.07, 0.07, w * 4.4]} c={COL.steel} />
          {sgn.map((sd) => (
            <group key={sd}>
              <C p={[0, t * h - 0.22, sd * w * 2.0]} r={0.035} h={0.4} c="#9db8a4" seg={6} />
              <Ball p={[0, t * h - 0.45, sd * w * 2.0]} r={0.05} c={COL.darkSteel} />
            </group>
          ))}
        </group>
      ))}
      <B p={[0, h + 0.05, 0]} s={[0.06, 0.1, 0.06]} c={COL.red} />
    </group>
  );
}

/** Unit pendingin berkipas: rangka berkisi dan kipas yang berputar (statis di perangkat lemah). */
export function FanUnit({ p, size = 1.5 }: { p: V3; size?: number }) {
  const slats: InstItem[] = [];
  for (let i = 0; i < 6; i++) for (const sd of [-1, 1]) slats.push({ p: [0, 0.25 + i * 0.12, sd * (size / 2 + 0.01)], s: [size * 0.9, 0.04, 0.03] });
  return (
    <group position={p}>
      <B p={[0, 0.5, 0]} s={[size, 1.0, size]} c="#8b95a3" />
      <Inst items={slats} c={COL.darkSteel} />
      <mesh position={[0, 1.02, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat(COL.darkSteel, 0.4, 0.5)} castShadow>
        <torusGeometry args={[size * 0.42, 0.05, 5, 16]} />
      </mesh>
      <Spin p={[0, 1.0, 0]} axis="y" speed={6}>
        <C r={0.1} h={0.1} c={COL.darkSteel} seg={8} />
        <B s={[size * 0.8, 0.03, 0.16]} c={COL.steel} />
        <B s={[0.16, 0.03, size * 0.8]} c={COL.steel} />
      </Spin>
    </group>
  );
}

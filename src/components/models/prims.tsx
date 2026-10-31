"use client";

import { useMemo } from "react";
import * as THREE from "three";

export type V3 = [number, number, number];

// ---------- Material (di-cache supaya hemat memori) ----------
const matCache = new Map<string, THREE.MeshStandardMaterial>();
export function mat(color: string, metalness = 0.45, roughness = 0.55, extra?: Partial<THREE.MeshStandardMaterialParameters>) {
  const key = `${color}|${metalness}|${roughness}|${JSON.stringify(extra ?? {})}`;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, metalness, roughness, flatShading: true, ...extra });
    matCache.set(key, m);
  }
  return m;
}

export const COL = {
  steel: "#8b95a3",
  darkSteel: "#4a525e",
  frame: "#39404b",
  yellow: "#f5b81c",
  orange: "#ff7a1a",
  red: "#d6392b",
  blue: "#2f6fa8",
  green: "#3a8f5c",
  white: "#e8ebef",
  black: "#1b1d22",
  pipe: "#a9b2bd",
  glass: "#7fc4e8",
  water: "#3aa0d8",
  concrete: "#6b6f76",
};

// ---------- Geometri bersama ----------
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const cylGeos = new Map<number, THREE.CylinderGeometry>();
function cylGeo(seg: number) {
  let g = cylGeos.get(seg);
  if (!g) {
    g = new THREE.CylinderGeometry(1, 1, 1, seg);
    cylGeos.set(seg, g);
  }
  return g;
}
const domeGeo = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
const sphereGeo = new THREE.SphereGeometry(1, 12, 8);
const coneGeo = new THREE.ConeGeometry(1, 1, 12);

// ---------- Primitif ----------
interface Base {
  p?: V3;
  rot?: V3;
  c?: string;
  m?: THREE.Material;
  metal?: number;
  rough?: number;
}
const material = ({ c = COL.steel, m, metal, rough }: Base) => m ?? mat(c, metal, rough);

/** Balok. s = ukuran [x,y,z]. */
export function B({ p = [0, 0, 0], s, rot, ...r }: Base & { s: V3 }) {
  return <mesh geometry={boxGeo} position={p} scale={s} rotation={rot} material={material(r)} castShadow receiveShadow />;
}

/** Silinder berdiri (sumbu Y). r = radius, h = tinggi. */
export function C({ p = [0, 0, 0], r, h, rot, seg = 14, ...rest }: Base & { r: number; h: number; seg?: number }) {
  return <mesh geometry={cylGeo(seg)} position={p} scale={[r, h, r]} rotation={rot} material={material(rest)} castShadow receiveShadow />;
}

/** Silinder rebah sepanjang sumbu X. */
export function CX(props: Base & { r: number; h: number; seg?: number }) {
  return <C {...props} rot={[0, 0, Math.PI / 2]} />;
}
/** Silinder rebah sepanjang sumbu Z. */
export function CZ(props: Base & { r: number; h: number; seg?: number }) {
  return <C {...props} rot={[Math.PI / 2, 0, 0]} />;
}

/** Tutup kubah setengah bola. rot untuk mengarahkan; sy = pemipihan. */
export function Dome({ p = [0, 0, 0], r, sy = 0.5, rot, ...rest }: Base & { r: number; sy?: number }) {
  return <mesh geometry={domeGeo} position={p} scale={[r, r * sy, r]} rotation={rot} material={material(rest)} castShadow receiveShadow />;
}

export function Ball({ p = [0, 0, 0], r, ...rest }: Base & { r: number }) {
  return <mesh geometry={sphereGeo} position={p} scale={r} material={material(rest)} castShadow />;
}

export function Cone({ p = [0, 0, 0], r, h, rot, ...rest }: Base & { r: number; h: number }) {
  return <mesh geometry={coneGeo} position={p} scale={[r, h, r]} rotation={rot} material={material(rest)} castShadow />;
}

/** Pipa lurus dari titik a ke titik b. */
export function Pipe({ a, b, r = 0.08, seg = 10, c = COL.pipe, ...rest }: { a: V3; b: V3; r?: number; seg?: number } & Omit<Base, "p" | "rot">) {
  const { pos, quat, len } = useMemo(() => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const dir = vb.clone().sub(va);
    const len = dir.length();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return { pos: va.add(vb).multiplyScalar(0.5), quat, len };
  }, [a, b]);
  return <mesh geometry={cylGeo(seg)} position={pos} quaternion={quat} scale={[r, len, r]} material={material({ c, ...rest })} castShadow receiveShadow />;
}

/** Rangkaian pipa melalui banyak titik, sambungan berupa bola kecil (siku). */
export function PipeRun({ pts, r = 0.08, c = COL.pipe, joint = true }: { pts: V3[]; r?: number; c?: string; joint?: boolean }) {
  return (
    <>
      {pts.slice(1).map((pt, i) => (
        <Pipe key={i} a={pts[i]} b={pt} r={r} c={c} />
      ))}
      {joint && pts.slice(1, -1).map((pt, i) => <Ball key={`j${i}`} p={pt} r={r * 1.18} c={c} />)}
    </>
  );
}

/** Flange: cakram tebal + baut di sekelilingnya. axis: 'x' | 'y' | 'z' */
export function Flange({ p, r = 0.14, axis = "y", c = COL.darkSteel, bolts = 6 }: { p: V3; r?: number; axis?: "x" | "y" | "z"; c?: string; bolts?: number }) {
  const rot: V3 = axis === "x" ? [0, 0, Math.PI / 2] : axis === "z" ? [Math.PI / 2, 0, 0] : [0, 0, 0];
  const boltPos = useMemo(
    () => Array.from({ length: bolts }, (_, i) => {
      const a = (i / bolts) * Math.PI * 2;
      return [Math.cos(a) * r * 0.82, 0, Math.sin(a) * r * 0.82] as V3;
    }),
    [bolts, r],
  );
  return (
    <group position={p} rotation={rot}>
      <C r={r} h={r * 0.28} c={c} seg={12} />
      {boltPos.map((bp, i) => (
        <C key={i} p={[bp[0], 0, bp[2]]} r={r * 0.09} h={r * 0.5} c="#d3d8de" seg={5} />
      ))}
    </group>
  );
}

/** Siku pipa 90 derajat (torus seperempat). rot memutar sekitar sumbu Y/Z. */
export function Elbow({ p, R = 0.25, r = 0.08, rot, c = COL.pipe, arc = Math.PI / 2 }: { p: V3; R?: number; r?: number; rot?: V3; c?: string; arc?: number }) {
  const geo = useMemo(() => new THREE.TorusGeometry(R, r, 8, 10, arc), [R, r, arc]);
  return <mesh geometry={geo} position={p} rotation={rot} material={mat(c, 0.5, 0.45)} castShadow />;
}

/** Valve: badan + stem + handwheel. */
export function Valve({ p, r = 0.1, axis = "x", c = COL.red }: { p: V3; r?: number; axis?: "x" | "z"; c?: string }) {
  const rot: V3 = axis === "x" ? [0, 0, 0] : [0, Math.PI / 2, 0];
  return (
    <group position={p} rotation={rot}>
      <Ball r={r * 1.6} c={COL.darkSteel} />
      <C p={[0, r * 2.2, 0]} r={r * 0.28} h={r * 2.4} c={COL.steel} seg={6} />
      <mesh position={[0, r * 3.5, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat(c, 0.2, 0.6)} castShadow>
        <torusGeometry args={[r * 1.25, r * 0.22, 5, 10]} />
      </mesh>
      <C p={[-r * 2.3, 0, 0]} r={r * 1.35} h={r * 0.6} rot={[0, 0, Math.PI / 2]} c={COL.darkSteel} seg={10} />
      <C p={[r * 2.3, 0, 0]} r={r * 1.35} h={r * 0.6} rot={[0, 0, Math.PI / 2]} c={COL.darkSteel} seg={10} />
    </group>
  );
}

/** Tangga tegak/miring. Dari p ke atas setinggi h, miring pada sumbu X sebesar tilt (radian). */
export function Stairs({ p, h = 2, w = 0.6, dir = 1, rot = [0, 0, 0] as V3, steps = 8, c = COL.yellow }: { p: V3; h?: number; w?: number; dir?: 1 | -1; rot?: V3; steps?: number; c?: string }) {
  const run = h * 0.9;
  const ang = Math.atan2(h, run);
  const len = Math.hypot(h, run);
  return (
    <group position={p} rotation={rot}>
      {[-1, 1].map((sd) => (
        <B key={sd} p={[(dir * run) / 2, h / 2, sd * (w / 2)]} s={[len, 0.07, 0.05]} rot={[0, 0, dir * ang]} c={c} />
      ))}
      {Array.from({ length: steps }, (_, i) => {
        const t = (i + 0.5) / steps;
        return <B key={i} p={[dir * run * t, h * t + 0.03, 0]} s={[0.22, 0.04, w]} c={COL.darkSteel} />;
      })}
    </group>
  );
}

/** Tangga vertikal (ladder) dengan rung. */
export function Ladder({ p, h = 2, w = 0.4, rot, c = COL.yellow }: { p: V3; h?: number; w?: number; rot?: V3; c?: string }) {
  const n = Math.max(3, Math.round(h / 0.22));
  return (
    <group position={p} rotation={rot}>
      {[-1, 1].map((sd) => (
        <B key={sd} p={[0, h / 2, sd * (w / 2)]} s={[0.04, h, 0.04]} c={c} />
      ))}
      {Array.from({ length: n }, (_, i) => (
        <C key={i} p={[0, 0.15 + (i * (h - 0.2)) / (n - 1), 0]} r={0.015} h={w} rot={[Math.PI / 2, 0, 0]} c={COL.steel} seg={5} />
      ))}
    </group>
  );
}

/** Railing sepanjang sumbu X dari -len/2 .. len/2 pada posisi p. */
export function Rail({ p, len, h = 0.5, rot, c = COL.yellow, posts }: { p: V3; len: number; h?: number; rot?: V3; c?: string; posts?: number }) {
  const n = posts ?? Math.max(2, Math.round(len / 0.7) + 1);
  return (
    <group position={p} rotation={rot}>
      {Array.from({ length: n }, (_, i) => (
        <B key={i} p={[-len / 2 + (i * len) / (n - 1), h / 2, 0]} s={[0.035, h, 0.035]} c={c} />
      ))}
      <B p={[0, h, 0]} s={[len, 0.035, 0.035]} c={c} />
      <B p={[0, h * 0.5, 0]} s={[len, 0.025, 0.025]} c={c} />
    </group>
  );
}

/** Pelat platform dengan grating (garis) sederhana. */
export function Platform({ p, s, c = COL.darkSteel }: { p: V3; s: [number, number]; c?: string }) {
  return (
    <group position={p}>
      <B s={[s[0], 0.06, s[1]]} c={c} />
      <B p={[0, -0.12, 0]} s={[s[0], 0.1, 0.06]} c={COL.frame} />
    </group>
  );
}

/** Panel kontrol/kabinet kecil dengan layar dan lampu. */
export function Cabinet({ p, s = [0.9, 1.5, 0.45], rot, c = "#cfd5dc" }: { p: V3; s?: V3; rot?: V3; c?: string }) {
  return (
    <group position={p} rotation={rot}>
      <B p={[0, s[1] / 2, 0]} s={s} c={c} metal={0.2} />
      <B p={[0, s[1] * 0.68, s[2] / 2 + 0.005]} s={[s[0] * 0.55, s[1] * 0.16, 0.02]} m={mat("#0e2a1c", 0.2, 0.3, { emissive: "#27d17a", emissiveIntensity: 0.9 })} />
      {[-1, 0, 1].map((i) => (
        <Ball key={i} p={[i * s[0] * 0.2, s[1] * 0.45, s[2] / 2 + 0.02]} r={0.035} m={mat(i === 0 ? "#ff3b2e" : "#ffc61a", 0.1, 0.4, { emissive: i === 0 ? "#ff3b2e" : "#ffc61a", emissiveIntensity: 0.8 })} />
      ))}
      <B p={[0, s[1] * 0.25, s[2] / 2 + 0.005]} s={[s[0] * 0.8, s[1] * 0.2, 0.02]} c="#aeb6bf" />
      <B p={[0, s[1] + 0.02, 0]} s={[s[0] * 1.06, 0.04, s[2] * 1.06]} c={COL.darkSteel} />
    </group>
  );
}

/** Balok baja I (profil I sederhana) sepanjang X. */
export function IBeam({ p, len, size = 0.2, rot, c = COL.frame }: { p: V3; len: number; size?: number; rot?: V3; c?: string }) {
  return (
    <group position={p} rotation={rot}>
      <B p={[0, size / 2 - 0.015, 0]} s={[len, 0.03, size * 0.8]} c={c} />
      <B p={[0, -size / 2 + 0.015, 0]} s={[len, 0.03, size * 0.8]} c={c} />
      <B s={[len, size, 0.025]} c={c} />
    </group>
  );
}

/** Kaki penopang + base plate + baut angkur. */
export function Leg({ p, h, size = 0.16, c = COL.frame }: { p: V3; h: number; size?: number; c?: string }) {
  return (
    <group position={p}>
      <B p={[0, h / 2, 0]} s={[size, h, size]} c={c} />
      <B p={[0, 0.025, 0]} s={[size * 2.2, 0.05, size * 2.2]} c={COL.darkSteel} />
      {[-1, 1].flatMap((a) => [-1, 1].map((b) => <C key={`${a}${b}`} p={[a * size * 0.8, 0.08, b * size * 0.8]} r={0.015} h={0.07} c="#d3d8de" seg={5} />))}
    </group>
  );
}

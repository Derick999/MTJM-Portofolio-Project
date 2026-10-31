"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import { Ball, mat, type V3 } from "./prims";
import { usePerf } from "./perf";

/** Uap tipis yang naik dari p. Di perangkat lemah ditampilkan statis. */
export function Steam({ p, count = 7, height = 2.6, size = 0.28, color = "#e9eef3" }: { p: V3; count?: number; height?: number; size?: number; color?: string }) {
  const { weak } = usePerf();
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const material = mat(color, 0, 1, { transparent: true, opacity: 0.4, depthWrite: false, flatShading: false });

  useFrame(({ clock }) => {
    if (weak) return;
    const t = clock.elapsedTime * 0.35;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const k = (t + i / count) % 1;
      m.position.set(Math.sin(k * 5 + i) * 0.18 * k, k * height, Math.cos(k * 4 + i) * 0.12 * k);
      const s = size * (0.5 + k * 1.6);
      m.scale.setScalar(s);
      (m.material as THREE.MeshStandardMaterial).opacity = 0.45 * (1 - k);
    });
  });

  return (
    <group position={p}>
      {Array.from({ length: count }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={[0, (i / count) * height, 0]}
          scale={size * (0.5 + (i / count) * 1.6)}
          material={material.clone()}
        >
          <sphereGeometry args={[1, 8, 6]} />
        </mesh>
      ))}
    </group>
  );
}

/** Memutar anak-anaknya pada sumbu tertentu (kipas). */
export function Spin({ p, axis = "z", speed = 3, children }: { p: V3; axis?: "x" | "y" | "z"; speed?: number; children: React.ReactNode }) {
  const { weak } = usePerf();
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!weak && ref.current) ref.current.rotation[axis] += dt * speed;
  });
  return (
    <group position={p} ref={ref}>
      {children}
    </group>
  );
}

export { Ball };

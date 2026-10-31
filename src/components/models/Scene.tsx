"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { ContactShadows, Grid, OrbitControls } from "@react-three/drei";
import type { CategoryId } from "@/lib/categories";
import { PerfContext } from "./perf";
import { BoilerModel } from "./BoilerModel";
import { GensetModel } from "./GensetModel";
import { WaterModel } from "./WaterModel";
import { PipingModel } from "./PipingModel";
import { RelocationModel } from "./RelocationModel";
import { ContainerModel } from "./ContainerModel";

const MODELS: Record<CategoryId, () => React.JSX.Element> = {
  boiler: BoilerModel,
  genset: GensetModel,
  water: WaterModel,
  piping: PipingModel,
  relokasi: RelocationModel,
  container: ContainerModel,
};

// Titik pandang per model (target kamera di tengah objek).
const TARGET: Record<CategoryId, [number, number, number]> = {
  boiler: [0, 2.4, 0],
  genset: [0, 1.4, 0],
  water: [0, 1.7, 0],
  piping: [0, 1.6, 0],
  relokasi: [0, 1.4, 0],
  container: [0, 1.2, 0],
};

/** Perangkat lemah: CPU sedikit, RAM kecil, atau pengguna meminta gerak berkurang. */
function detectWeak() {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const slowCpu = (nav.hardwareConcurrency ?? 8) <= 4;
  const lowMem = (nav.deviceMemory ?? 8) <= 4;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return slowCpu || lowMem || reduce;
}

/** Atur jarak kamera sesuai rasio layar supaya seluruh model muat (HP portrait lebih jauh). */
function CameraRig({ target }: { target: [number, number, number] }) {
  const { camera, size } = useThree();
  const aspect = size.width / size.height;
  useEffect(() => {
    const d = 15 * Math.max(1, 0.95 / aspect);
    camera.position.copy(new Vector3(9, 5.5, 10.5).normalize().multiplyScalar(d));
    camera.lookAt(...target);
  }, [camera, aspect, target]);
  return null;
}

export default function Scene({ category }: { category: CategoryId }) {
  const [weak, setWeak] = useState<boolean | null>(null);
  useEffect(() => setWeak(detectWeak()), []);
  if (weak === null) return null;

  const Model = MODELS[category];
  return (
    <Canvas
        key={category}
        frameloop={weak ? "demand" : "always"}
        dpr={weak ? 1 : [1, 1.75]}
        camera={{ position: [9, 5.5, 10.5], fov: 36, near: 0.1, far: 100 }}
        gl={{ antialias: !weak, powerPreference: "low-power" }}
      >
        <CameraRig target={TARGET[category]} />
        <hemisphereLight args={["#ffffff", "#8aa3bd", 1.1]} />
        <directionalLight position={[6, 10, 5]} intensity={1.9} />
        <directionalLight position={[-6, 4, -4]} intensity={0.5} color="#cfe6ff" />
        <PerfContext.Provider value={{ weak }}>
          <Suspense fallback={null}>
            <Model />
          </Suspense>
        </PerfContext.Provider>
        <Grid
          position={[0, 0.001, 0]}
          args={[30, 30]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#b4c7dc"
          sectionSize={2.5}
          sectionThickness={1}
          sectionColor="#1887cd"
          fadeDistance={22}
          fadeStrength={1.5}
          infiniteGrid
        />
        <ContactShadows position={[0, 0.01, 0]} scale={18} blur={2.6} opacity={0.35} far={6} frames={weak ? 1 : 60} resolution={512} />
        <OrbitControls
          target={TARGET[category]}
          enableDamping
          autoRotate={!weak}
          autoRotateSpeed={0.6}
          minDistance={6}
          maxDistance={36}
          maxPolarAngle={Math.PI / 2 - 0.03}
          enablePan={false}
        />
    </Canvas>
  );
}

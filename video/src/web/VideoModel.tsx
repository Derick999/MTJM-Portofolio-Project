import { useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { ContactShadows, Grid } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import type { CategoryId } from "@/lib/categories";
import { PerfContext } from "@/components/models/perf";
import { BoilerModel } from "@/components/models/BoilerModel";
import { GensetModel } from "@/components/models/GensetModel";
import { WaterModel } from "@/components/models/WaterModel";
import { PipingModel } from "@/components/models/PipingModel";
import { RelocationModel } from "@/components/models/RelocationModel";
import { ContainerModel } from "@/components/models/ContainerModel";

// Viewer 3D untuk video: model, pencahayaan, grid, dan bayangan sama dengan src/components/models/Scene.tsx di web.
// Bedanya: kamera berputar mengikuti frame (di web: OrbitControls autoRotate berbasis waktu nyata), dan mode "weak"
// dipakai agar uap/kipas statis (deterministik per frame).
const MODELS: Record<CategoryId, () => React.JSX.Element> = {
  boiler: BoilerModel,
  genset: GensetModel,
  water: WaterModel,
  piping: PipingModel,
  relokasi: RelocationModel,
  container: ContainerModel,
};

// Titik pandang per model (sama dengan Scene.tsx)
const TARGET: Record<CategoryId, [number, number, number]> = {
  boiler: [0, 2.4, 0],
  genset: [0, 1.4, 0],
  water: [0, 1.7, 0],
  piping: [0, 1.6, 0],
  relokasi: [0, 1.4, 0],
  container: [0, 1.2, 0],
};

const Rig = ({ target, angleDeg, aspect }: { target: [number, number, number]; angleDeg: number; aspect: number }) => {
  const { camera } = useThree();
  const d = 15 * Math.max(1, 0.95 / aspect); // sama dengan CameraRig di web
  const base = new Vector3(9, 5.5, 10.5).normalize().multiplyScalar(d);
  const a = (angleDeg * Math.PI) / 180;
  const x = base.x * Math.cos(a) + base.z * Math.sin(a);
  const z = -base.x * Math.sin(a) + base.z * Math.cos(a);
  camera.position.set(x, base.y, z);
  camera.lookAt(...target);
  return null;
};

/** Kotak viewer persis seperti src/components/ModelViewer.tsx (bingkai, latar gradasi, bar petunjuk di bawah). */
export const VideoModel = ({ category, angleDeg, opacity = 1 }: { category: CategoryId; angleDeg: number; opacity?: number }) => {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [handle] = useState(() => delayRender("viewer-size"));
  useLayoutEffect(() => {
    const el = box.current;
    if (el && !size) {
      setSize({ w: el.clientWidth, h: el.clientHeight });
      continueRender(handle);
    }
  }, [size, handle]);

  const Model = MODELS[category];
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-line bg-surface">
      <div ref={box} className="viewer-bg relative min-h-0 flex-1" role="img" aria-label={`Ilustrasi 3D ${category}`}>
        {size && (
          <div style={{ position: "absolute", inset: 0, opacity }}>
            <ThreeCanvas width={size.w} height={size.h} camera={{ fov: 36, near: 0.1, far: 100, position: [9, 5.5, 10.5] }} gl={{ antialias: true }}>
              <Rig target={TARGET[category]} angleDeg={angleDeg} aspect={size.w / size.h} />
              <hemisphereLight args={["#ffffff", "#8aa3bd", 1.1]} />
              <directionalLight position={[6, 10, 5]} intensity={1.9} />
              <directionalLight position={[-6, 4, -4]} intensity={0.5} color="#cfe6ff" />
              <PerfContext.Provider value={{ weak: true }}>
                <Model />
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
              <ContactShadows position={[0, 0.01, 0]} scale={18} blur={2.6} opacity={0.35} far={6} frames={1} resolution={512} />
            </ThreeCanvas>
          </div>
        )}
      </div>
      <p className="border-t border-line bg-surface px-3 py-2 text-center text-xs text-muted">Ilustrasi 3D &middot; seret untuk memutar &middot; scroll / cubit untuk zoom</p>
    </div>
  );
};

"use client";

import { B, C, COL } from "./prims";

/** Model sementara untuk kategori yang model 3D-nya belum dibuat: pedestal dengan tumpukan balok dan silinder. */
export function PlaceholderModel() {
  return (
    <group>
      <B p={[0, 0.1, 0]} s={[6, 0.2, 4.4]} c="#c9d3de" />
      <B p={[-1.2, 0.95, 0]} s={[2.4, 1.5, 2]} c="#6f8aa8" />
      <B p={[1.4, 0.7, 0.4]} s={[1.6, 1, 1.4]} c="#8aa3bd" />
      <C p={[1.6, 1.9, -0.9]} r={0.45} h={1.6} c={COL.darkSteel} />
      <B p={[-1.2, 1.85, 0]} s={[1.2, 0.3, 1.2]} c="#1887cd" />
    </group>
  );
}

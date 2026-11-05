"use client";

import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { mat, type V3 } from "./prims";

export interface InstItem {
  p: V3;
  s: V3;
  rot?: V3;
}

const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 12);

/** Banyak balok/silinder identik dalam satu draw call (penyangga, baut, kisi, tiang pagar). Silinder: sumbu Y, s = [r, tinggi, r]. */
export function Inst({ kind = "box", items, c, metal, rough }: { kind?: "box" | "cyl"; items: InstItem[]; c: string; metal?: number; rough?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new THREE.Object3D();
    items.forEach((it, i) => {
      o.position.set(...it.p);
      o.rotation.set(...(it.rot ?? [0, 0, 0]));
      o.scale.set(...it.s);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [items]);
  if (!items.length) return null;
  return <instancedMesh ref={ref} args={[kind === "box" ? boxGeo : cylGeo, mat(c, metal, rough), items.length]} castShadow receiveShadow />;
}

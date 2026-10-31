import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { CONFIG } from "../../config";

/** Bloom/glow untuk lampu kota dan halo atmosfer. Mengganti render bawaan dengan EffectComposer. */
export const Post = () => {
  const { gl, scene, camera, size } = useThree();
  const b = CONFIG.globe.bloom;

  const { composer, bloom } = useMemo(() => {
    gl.toneMapping = THREE.NoToneMapping;
    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), b.strength, b.radius, b.threshold);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    return { composer, bloom };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);

  useEffect(() => {
    composer.setPixelRatio(gl.getPixelRatio());
    composer.setSize(size.width, size.height);
    bloom.strength = b.strength;
    bloom.radius = b.radius;
    bloom.threshold = b.threshold;
  }, [composer, bloom, gl, size, b.strength, b.radius, b.threshold]);

  useFrame(() => composer.render(), 1);
  return null;
};

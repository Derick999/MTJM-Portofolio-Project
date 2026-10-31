import { useMemo } from "react";
import { Easing, random, spring, staticFile, useVideoConfig } from "remotion";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { CONFIG } from "../../config";
import { GEO, MAP_DOTS, type ScheduledDot } from "../../data";
import { getCameraState, R, toVec, type CameraState } from "./cameraPath";

const G = CONFIG.globe;

// ---------------------------------------------------------------------------
// Permukaan Bumi malam: laut navy gelap, daratan hijau gelap, lampu kota emas (NASA Black Marble).
// Semua dihitung di shader supaya lampu redup ikut terang dan warnanya emas.
// ---------------------------------------------------------------------------
const earthVert = /* glsl */ `
  varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }`;

const earthFrag = /* glsl */ `
  uniform sampler2D dayMap; uniform sampler2D nightMap;
  uniform float gain; uniform float boost; uniform vec3 lightColor;
  varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void main() {
    vec3 day = texture2D(dayMap, vUv).rgb;
    vec3 nl = texture2D(nightMap, vUv).rgb;

    // daratan vs laut dari warna peta siang
    float land = smoothstep(0.0, 0.06, max(day.r, day.g) - day.b * 0.85);
    vec3 ocean = vec3(0.0008, 0.0055, 0.024) + day * vec3(0.004, 0.024, 0.085);
    float dl = dot(day, vec3(0.3, 0.6, 0.1));
    vec3 ground = vec3(0.004, 0.012, 0.005) + vec3(0.7, 1.0, 0.45) * (0.014 + min(dl, 0.28) * 0.07);   // hijau gelap seragam, gurun tidak menyala
    vec3 surface = mix(ocean, ground, land);

    // lampu kota: buang noise dasar, angkat yang redup, beri warna emas
    float l = max(nl.r, max(nl.g, nl.b));
    l = smoothstep(0.003, 0.85, l);
    vec3 lights = lightColor * pow(l, boost) * gain;
    lights += nl * 0.8 * l;                       // pertahankan sedikit putih pada pusat kota

    // tepi atmosfer: kilau biru di dekat horizon
    float ndv = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
    float rim = pow(1.0 - ndv, 6.0);
    surface += vec3(0.05, 0.2, 0.6) * rim * 0.7;

    gl_FragColor = vec4(surface + lights, 1.0);
  }`;

export const EarthSurface = () => {
  const [day, night] = useLoader(THREE.TextureLoader, [staticFile("textures/earth.jpg"), staticFile("textures/night.jpg")]);
  const mat = useMemo(() => {
    day.colorSpace = THREE.SRGBColorSpace;
    night.colorSpace = THREE.SRGBColorSpace;
    day.anisotropy = 8;
    night.anisotropy = 8;
    return new THREE.ShaderMaterial({
      vertexShader: earthVert,
      fragmentShader: earthFrag,
      uniforms: {
        dayMap: { value: day },
        nightMap: { value: night },
        gain: { value: G.lights.gain },
        boost: { value: G.lights.boost },
        lightColor: { value: new THREE.Vector3(...G.lights.color) },
      },
    });
  }, [day, night]);
  return (
    <mesh material={mat}>
      <sphereGeometry args={[R, 192, 192]} />
    </mesh>
  );
};

// ---------------------------------------------------------------------------
// Lapisan awan terpisah (bergeser sangat pelan)
// ---------------------------------------------------------------------------
const cloudFrag = /* glsl */ `
  uniform sampler2D cloudMap; uniform float opacity; uniform vec3 tint;
  uniform float clearR; uniform float feather; uniform vec4 region;   // region = lng0, lat0, rx, ry (derajat)
  varying vec2 vUv; varying vec3 vP;
  void main() {
    float c = texture2D(cloudMap, vUv).g;
    // lembut dan berserat: dua ambang bertumpuk, bukan satu ambang keras
    float a = (smoothstep(0.22, 1.0, c) * 0.55 + smoothstep(0.55, 1.0, c) * 0.45) * opacity;

    // area Indonesia dibersihkan dari tengah ke luar (koordinat tetap di permukaan Bumi, ikut berputar)
    float lat = degrees(asin(clamp(vP.y / length(vP), -1.0, 1.0)));
    float lng = degrees(atan(-vP.z, vP.x));
    float e = length(vec2((lng - region.x) / region.z, (lat - region.y) / region.w));
    a *= smoothstep(clearR - feather, clearR, e);

    gl_FragColor = vec4(tint * (0.6 + 0.5 * c), a);
  }`;
const cloudVert = /* glsl */ `
  varying vec2 vUv; varying vec3 vP;
  void main() { vUv = uv; vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

const cloudCurve = Easing.bezier(G.cloudFade.curve[0], G.cloudFade.curve[1], G.cloudFade.curve[2], G.cloudFade.curve[3]);

export const Clouds = ({ t }: { t: number }) => {
  const map = useLoader(THREE.TextureLoader, staticFile("textures/clouds.jpg"));
  const F = G.cloudFade;
  const mat = useMemo(() => {
    map.anisotropy = 4;
    return new THREE.ShaderMaterial({
      vertexShader: cloudVert,
      fragmentShader: cloudFrag,
      uniforms: {
        cloudMap: { value: map },
        opacity: { value: G.cloudOpacity },
        tint: { value: new THREE.Vector3(0.5, 0.58, 0.74) },
        clearR: { value: 0 },
        feather: { value: F.feather },
        region: { value: new THREE.Vector4(F.region.lng, F.region.lat, F.region.rx, F.region.ry) },
      },
      transparent: true,
      depthWrite: false,
    });
  }, [map, F]);

  // progres fade 0..1: seluruh lapisan memudar ke edgeKeep, area Indonesia dibersihkan dari tengah ke luar
  const k = cloudCurve(Math.min(1, Math.max(0, (t - F.from) / (F.to - F.from))));
  mat.uniforms.opacity.value = G.cloudOpacity * (1 - (1 - F.edgeKeep) * k);
  mat.uniforms.clearR.value = k * (1.0 + F.feather + 0.15); // sampai e = 1,0 benar-benar bersih
  return (
    <mesh material={mat} rotation={[0, (t * G.cloudDriftDegPerSec * Math.PI) / 180, 0]}>
      <sphereGeometry args={[R * 1.006, 128, 128]} />
    </mesh>
  );
};

// ---------------------------------------------------------------------------
// Halo atmosfer: cahaya biru terang tipis di tepi, dihitung dari jarak terdekat sinar ke Bumi
// ---------------------------------------------------------------------------
const atmoVert = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }`;
const atmoFrag = /* glsl */ `
  uniform float planetR;
  varying vec3 vWorld;
  void main() {
    vec3 dir = normalize(vWorld - cameraPosition);
    float d = length(cross(dir, cameraPosition));   // jarak terdekat sinar ke pusat Bumi
    float h = max(d - planetR, 0.0);
    float core = exp(-h / 0.017);
    float glow = exp(-h / 0.12);
    vec3 col = mix(vec3(0.16, 0.45, 1.0), vec3(0.62, 0.88, 1.0), core) ;
    float a = core * 1.05 + glow * 0.30;
    gl_FragColor = vec4(col * a, 1.0);
  }`;
const atmosphereMat = new THREE.ShaderMaterial({
  vertexShader: atmoVert,
  fragmentShader: atmoFrag,
  uniforms: { planetR: { value: R } },
  side: THREE.BackSide,
  blending: THREE.AdditiveBlending,
  transparent: true,
  depthWrite: false,
});

export const Atmosphere = () => (
  <mesh material={atmosphereMat}>
    <sphereGeometry args={[R * 1.28, 96, 96]} />
  </mesh>
);

// ---------------------------------------------------------------------------
// Bintang
// ---------------------------------------------------------------------------
export const Stars = () => {
  const geo = useMemo(() => {
    const n = 2600;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const th = random(`star-th-${i}`) * Math.PI * 2;
      const ph = Math.acos(2 * random(`star-ph-${i}`) - 1);
      const rr = 120;
      pos.set([rr * Math.sin(ph) * Math.cos(th), rr * Math.cos(ph), rr * Math.sin(ph) * Math.sin(th)], i * 3);
      const b = 0.35 + 0.65 * Math.pow(random(`star-b-${i}`), 2.5);
      col.set([b * 0.85, b * 0.92, b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial vertexColors size={1.6} sizeAttenuation={false} transparent opacity={0.9} depthWrite={false} />
    </points>
  );
};

// ---------------------------------------------------------------------------
// Garis batas provinsi (tipis, hanya adegan 3) dan titik proyek
// ---------------------------------------------------------------------------
export const Outlines = ({ opacity }: { opacity: number }) => {
  const geo = useMemo(() => {
    const pts: number[] = [];
    const ring = (r: number[][]) => {
      for (let i = 0; i < r.length - 1; i++) {
        const a = toVec(r[i][1], r[i][0], R * 1.002);
        const b = toVec(r[i + 1][1], r[i + 1][0], R * 1.002);
        pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    };
    for (const ft of GEO.features) {
      const g = ft.geometry;
      if (g.type === "Polygon") (g.coordinates as number[][][]).forEach(ring);
      else (g.coordinates as number[][][][]).forEach((poly) => poly.forEach(ring));
    }
    const bg = new THREE.BufferGeometry();
    bg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
    return bg;
  }, []);
  if (opacity <= 0.001) return null;
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#7fc8ff" transparent opacity={opacity} depthWrite={false} />
    </lineSegments>
  );
};

/** Warna kategori web sedikit dicerahkan supaya terbaca di atas Bumi gelap (tetap satu keluarga warna, tetap jenuh). */
const glowColor = (hex: string) => {
  const hsl = { h: 0, s: 0, l: 0 };
  new THREE.Color(hex).getHSL(hsl);
  return new THREE.Color().setHSL(hsl.h, Math.min(1, Math.max(hsl.s, 0.7) * 1.1), 0.52);
};

// ---------------------------------------------------------------------------
// Titik proyek = sprite billboard: selalu menghadap kamera, ukuran tetap di layar (piksel),
// selalu bulat sempurna (tidak gepeng oleh perspektif), dan dikaitkan ke koordinat lat/lon di permukaan.
// ---------------------------------------------------------------------------
const DOT_PX = { halo: 78, core: 26, center: 10, ringFrom: 40, ringTo: 74 }; // diameter dalam piksel pada tinggi 1080
const HUB_PX = { halo: 130, core: 36, center: 14, ringFrom: 54, ringTo: 230 }; // titik Bekasi: lebih besar, ring pulsa jauh lebih lebar
const rad = (d: number) => (d * Math.PI) / 180;
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const makeTexture = (draw: (ctx: CanvasRenderingContext2D, s: number) => void) => {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  draw(canvas.getContext("2d")!, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
};

/** Tekstur titik: halo lembut, cakram, dan cincin (semua putih, diwarnai lewat material). */
const useDotTextures = () =>
  useMemo(() => {
    const halo = makeTexture((ctx, s) => {
      const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      g.addColorStop(0, "rgba(255,255,255,0.9)");
      g.addColorStop(0.55, "rgba(255,255,255,0.35)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, s, s);
    });
    const disc = makeTexture((ctx, s) => {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(s / 2, s / 2, s / 2 - 4, 0, Math.PI * 2);
      ctx.fill();
    });
    const ring = makeTexture((ctx, s) => {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.arc(s / 2, s / 2, s / 2 - 10, 0, Math.PI * 2);
      ctx.stroke();
    });
    return { halo, disc, ring };
  }, []);

type Tex = ReturnType<typeof useDotTextures>;

const Dot = ({
  p,
  f,
  cam,
  height,
  tex,
}: {
  p: ScheduledDot;
  f: number;
  cam: CameraState;
  height: number;
  tex: Tex;
}) => {
  const { fps } = useVideoConfig();
  const start = p.startSec * fps; // frame (sejak awal adegan 3) saat titik ini muncul
  const pop = spring({ frame: f - start, fps, config: p.isHub ? { damping: 12, stiffness: 80, mass: 1 } : { damping: 15, stiffness: 90, mass: 0.9 } });
  const { pos, color } = useMemo(() => ({ pos: toVec(p.lat, p.lng, R * 1.003), color: p.isHub ? new THREE.Color(p.color) : glowColor(p.color) }), [p]);
  if (f < start) return null;

  // 1 piksel layar = berapa unit scene pada jarak titik ini (ukuran konsisten di layar)
  const dist = cam.position.distanceTo(pos);
  const px = (2 * Math.tan(rad(cam.fov) / 2) * dist) / height;
  // titik yang berada di balik cakrawala disembunyikan perlahan
  const facing = pos.clone().normalize().dot(cam.position.clone().sub(pos).normalize());
  const vis = smoothstep(0.02, 0.2, facing);
  if (vis <= 0.001) return null;

  const age = (f - start) / fps;
  const size = (d: number) => d * px * Math.max(pop, 0.0001);
  const common = { transparent: true, depthTest: false, depthWrite: false } as const;
  const P = p.isHub ? HUB_PX : DOT_PX;
  const order = p.isHub ? 20 : 10; // titik Bekasi digambar paling atas

  // riak: titik biasa satu cincin; Bekasi dua cincin bergantian yang jauh lebih besar
  const phase = (rate: number, shift = 0) => (age * rate + shift) % 1;
  const rings = p.isHub ? [phase(0.5), phase(0.5, 0.5)] : [phase(0.6)];
  return (
    <group position={pos}>
      <sprite scale={[size(P.halo), size(P.halo), 1]} renderOrder={order}>
        <spriteMaterial map={tex.halo} color={color} opacity={(p.isHub ? 0.6 : 0.5) * vis} {...common} />
      </sprite>
      {rings.map((rp, i) => {
        const d = P.ringFrom + (P.ringTo - P.ringFrom) * rp;
        return (
          <sprite key={i} scale={[size(d), size(d), 1]} renderOrder={order + 1}>
            <spriteMaterial map={tex.ring} color={color} opacity={(p.isHub ? 0.95 : 0.85) * (1 - rp) * vis} {...common} />
          </sprite>
        );
      })}
      <sprite scale={[size(P.core), size(P.core), 1]} renderOrder={order + 2}>
        <spriteMaterial map={tex.disc} color={color} opacity={vis} {...common} />
      </sprite>
      <sprite scale={[size(P.center), size(P.center), 1]} renderOrder={order + 3}>
        <spriteMaterial map={tex.disc} color="#ffffff" opacity={vis} {...common} />
      </sprite>
    </group>
  );
};

export const Dots = ({ f, t, aspect, height }: { f: number; t: number; aspect: number; height: number }) => {
  const tex = useDotTextures();
  const cam = getCameraState(t, aspect);
  return (
    <>
      {MAP_DOTS.map((p) => (
        <Dot key={p.slug} p={p} f={f} cam={cam} height={height} tex={tex} />
      ))}
    </>
  );
};

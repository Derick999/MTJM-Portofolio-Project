import * as THREE from "three";
import { Easing } from "remotion";
import { CONFIG, EARTH_FADE_IN_AT_SEC, SCENES } from "../../config";

export const R = 3; // radius Bumi (unit scene)
const G = CONFIG.globe;
const J = G.journey;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const rad = (d: number) => (d * Math.PI) / 180;

/** lat/lng -> posisi pada bola (sama dengan pemetaan UV SphereGeometry three.js: bujur 0 di +X, 90 BT di -Z) */
export const toVec = (lat: number, lng: number, r: number) => {
  const la = rad(lat);
  const lo = rad(lng);
  return new THREE.Vector3(r * Math.cos(la) * Math.cos(lo), r * Math.sin(la), -r * Math.cos(la) * Math.sin(lo));
};

/** Awal perjalanan kamera = saat teks adegan 1 mulai memudar (Bumi juga mulai fade in). */
export const JOURNEY_START = EARTH_FADE_IN_AT_SEC;

const curve = Easing.bezier(J.curve[0], J.curve[1], J.curve[2], J.curve[3]);

/** Progres perjalanan 0..1 pada waktu t (detik sejak awal video). SATU kurva untuk semua parameter kamera. */
export const journeyProgress = (t: number) => curve(clamp01((t - JOURNEY_START) / (J.end - JOURNEY_START)));

/** Putaran Bumi (radian di sumbu Y): berputar ke timur, melambat (ease-out), berhenti di 0 saat Indonesia tepat di tengah. */
export const spinAt = (t: number) => {
  const p = clamp01((t - JOURNEY_START) / (G.spinEndAt - JOURNEY_START));
  return rad(G.spinFromDeg) * (1 - easeOutCubic(p));
};

// Titik bidik tetap di permukaan, dan basis lokal di titik itu (atas, utara, timur).
export const TARGET = toVec(J.target.lat, J.target.lng, R);
const UP = TARGET.clone().normalize();
const NORTH = new THREE.Vector3(0, 1, 0).sub(UP.clone().multiplyScalar(UP.y)).normalize();
const EAST = new THREE.Vector3().crossVectors(NORTH, UP);

export interface CameraState {
  position: THREE.Vector3;
  up: THREE.Vector3;
  fov: number;
  progress: number;
}

/**
 * Posisi kamera yang berjarak `dist` dari titik bidik dan memandang titik itu dengan sudut pandang ke bawah `depressionDeg`
 * (diukur terhadap bidang horizontal di posisi KAMERA, 90 = tegak lurus ke bawah). Kamera berada di selatan titik bidik.
 * Dicari numerik karena kelengkungan Bumi membuat sudut di kamera berbeda dari sudut di titik bidik.
 */
const solveCamera = (dist: number, depressionDeg: number, heading: THREE.Vector3) => {
  const at = (phi: number) => {
    const rc = R * Math.cos(phi) + Math.sqrt(Math.max(dist * dist - R * R * Math.sin(phi) ** 2, 0));
    const uC = UP.clone().multiplyScalar(Math.cos(phi)).addScaledVector(heading, -Math.sin(phi));
    const C = uC.clone().multiplyScalar(rc);
    const view = TARGET.clone().sub(C).normalize();
    return { C, depression: (Math.asin(THREE.MathUtils.clamp(-view.dot(uC), -1, 1)) * 180) / Math.PI };
  };
  let lo = 0;
  let hi = Math.min(Math.asin(Math.min(1, dist / R)), Math.PI / 2);
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (at(mid).depression > depressionDeg) lo = mid;
    else hi = mid;
  }
  return at((lo + hi) / 2).C;
};

/**
 * Keadaan kamera pada waktu t. Kamera mengorbit titik bidik: jarak, sudut pandang ke bawah, FOV, dan roll
 * semuanya diinterpolasi dengan progres yang sama (satu gerakan), dan selalu menghadap titik bidik.
 */
export const getCameraState = (t: number, aspect = 16 / 9): CameraState => {
  const p = journeyProgress(t);
  // Layar lebih sempit (mis. 1:1) -> mundur sedikit supaya Indonesia tetap muat.
  const wide = 1 + (Math.max(1, 16 / 9 / aspect) - 1) * 0.55;
  // setelah perjalanan selesai, dorongan sangat pelan dengan kecepatan konstan sampai akhir adegan 3 (kamera tidak pernah diam)
  // (tidak dibatasi di akhir adegan 3: peta tetap bergerak maju saat jendela browser naik di depannya)
  const drift = 1 - J.drift * Math.max(0, (t - J.end) / (SCENES.s3[1] - J.end));
  const dist = Math.exp(lerp(Math.log(J.from.dist), Math.log(J.to.dist), p)) * wide * drift;
  const depression = lerp(J.from.elev, J.to.elev, p);
  const fov = lerp(J.from.fov, J.to.fov, p);
  const roll = rad(lerp(J.from.roll, J.to.roll, p));

  const heading = NORTH.clone().multiplyScalar(Math.cos(rad(J.yaw))).addScaledVector(EAST, Math.sin(rad(J.yaw)));
  const position = solveCamera(dist, depression, heading);

  const view = TARGET.clone().sub(position).normalize();
  // "atas" layar = utara lokal, dimiringkan oleh roll
  const up0 = heading.clone().sub(view.clone().multiplyScalar(heading.dot(view))).normalize();
  const up = up0.applyAxisAngle(view, roll);
  return { position, up, fov, progress: p };
};

/** Terapkan keadaan kamera ke kamera three. */
export const placeCamera = (camera: THREE.Camera, t: number, aspect = 16 / 9) => {
  const s = getCameraState(t, aspect);
  camera.position.copy(s.position);
  camera.up.copy(s.up);
  camera.lookAt(TARGET);
  const c = camera as THREE.PerspectiveCamera;
  if (c.isPerspectiveCamera && c.fov !== s.fov) {
    c.fov = s.fov;
    c.updateProjectionMatrix();
  }
};

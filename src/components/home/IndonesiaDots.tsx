// Pola titik-titik berbentuk kepulauan Indonesia (perkiraan dekoratif) untuk latar hero bila tidak ada foto. SVG statis, ringan.
const ISLANDS: { cx: number; cy: number; rx: number; ry: number; rot: number }[] = [
  { cx: 135, cy: 190, rx: 150, ry: 26, rot: 38 }, // Sumatra
  { cx: 320, cy: 285, rx: 90, ry: 13, rot: -4 }, // Jawa
  { cx: 410, cy: 170, rx: 78, ry: 72, rot: 0 }, // Kalimantan
  { cx: 535, cy: 150, rx: 18, ry: 52, rot: 10 }, // Sulawesi (lengan utara)
  { cx: 560, cy: 215, rx: 26, ry: 12, rot: 35 },
  { cx: 520, cy: 255, rx: 30, ry: 12, rot: -20 },
  { cx: 450, cy: 305, rx: 10, ry: 9, rot: 0 }, // Bali, Lombok, ...
  { cx: 505, cy: 312, rx: 50, ry: 8, rot: -8 }, // Nusa Tenggara
  { cx: 640, cy: 175, rx: 30, ry: 26, rot: 0 }, // Maluku
  { cx: 800, cy: 205, rx: 125, ry: 52, rot: -8 }, // Papua
];

export function IndonesiaDots({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 960 400" preserveAspectRatio="xMidYMid slice" aria-hidden className={className}>
      <defs>
        <pattern id="mtjm-dots" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="2.2" fill="currentColor" />
        </pattern>
        <clipPath id="mtjm-islands">
          {ISLANDS.map((i, k) => (
            <ellipse key={k} cx={i.cx} cy={i.cy} rx={i.rx} ry={i.ry} transform={`rotate(${i.rot} ${i.cx} ${i.cy})`} />
          ))}
        </clipPath>
      </defs>
      <rect width="960" height="400" fill="url(#mtjm-dots)" clipPath="url(#mtjm-islands)" />
    </svg>
  );
}

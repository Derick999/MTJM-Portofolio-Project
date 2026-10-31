import type { CSSProperties, ImgHTMLAttributes } from "react";
import { staticFile } from "remotion";

// Pengganti next/image untuk komponen web di dalam Remotion: <img> biasa. `fill` = absolut memenuhi induk.
type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height"> & {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  unoptimized?: boolean;
};

export default function Image({ src, fill, priority: _p, quality: _q, unoptimized: _u, sizes: _s, width, height, style, ...rest }: Props) {
  void _p;
  void _q;
  void _u;
  void _s;
  const url = src.startsWith("/") ? staticFile(src.slice(1)) : src;
  const fillStyle: CSSProperties = fill ? { position: "absolute", inset: 0, width: "100%", height: "100%" } : {};
  return <img src={url} width={width} height={height} style={{ ...fillStyle, ...style }} {...rest} />;
}

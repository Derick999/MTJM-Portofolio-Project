import Image from "next/image";

interface Props {
  src: string | undefined;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/** Foto proyek dengan fallback. SVG placeholder tidak lewat optimizer next/image. */
export function ProjectPhoto({ src, alt, sizes = "(max-width: 768px) 100vw, 50vw", priority, className = "" }: Props) {
  if (!src) return <div className={`skeleton ${className}`} role="img" aria-label={alt} />;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={src.endsWith(".svg")}
      className={`object-cover ${className}`}
    />
  );
}

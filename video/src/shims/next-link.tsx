import type { AnchorHTMLAttributes, ReactNode } from "react";

// Pengganti next/link di video: tautan biasa (tidak ada navigasi sungguhan).
export default function Link({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

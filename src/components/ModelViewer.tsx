"use client";

import dynamic from "next/dynamic";
import type { CategoryId } from "@/lib/categories";

const Scene = dynamic(() => import("./models/Scene"), {
  ssr: false,
  loading: () => <ViewerPlaceholder />,
});

function ViewerPlaceholder() {
  return (
    <div className="grid h-full w-full place-items-center" role="status">
      <div className="text-center text-sm text-muted">
        <div className="skeleton mx-auto mb-3 h-16 w-16 rounded-full" />
        Memuat model 3D...
      </div>
    </div>
  );
}

export function ModelViewer({ category, label }: { category: CategoryId; label: string }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-line bg-surface">
      <div
        className="viewer-bg relative min-h-0 flex-1"
        role="img"
        aria-label={`Ilustrasi 3D ${label}. Seret untuk memutar, cubit atau scroll untuk zoom.`}
      >
        <Scene category={category} />
      </div>
      {/* Petunjuk di bar sendiri supaya tidak menutupi model. */}
      <p className="border-t border-line bg-surface px-3 py-2 text-center text-xs text-muted">
        Ilustrasi 3D &middot; seret untuk memutar &middot; scroll / cubit untuk zoom
      </p>
    </div>
  );
}

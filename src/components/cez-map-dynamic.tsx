"use client";

import dynamic from "next/dynamic";

export const CezMap = dynamic(
  () => import("@/components/cez-map").then((m) => m.CezMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[72vh] items-center justify-center rounded-3xl border bg-white text-sm text-slate-500">
        Loading CEZ Master Plan…
      </div>
    ),
  }
);

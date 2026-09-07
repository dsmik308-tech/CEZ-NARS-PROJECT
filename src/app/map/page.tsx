import { AppShell } from "@/components/app-shell";
import { CezMap } from "@/components/cez-map-dynamic";

export default function MapPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-widest text-[#0c43a8]">
          CEZ GIS Foundation
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">PEZA Property Map Registry</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Identify registered land and building assets from the CEZ Master Plan. Click markers to
          access their corresponding NARS records.
        </p>
      </div>

      <CezMap />
    </AppShell>
  );
}

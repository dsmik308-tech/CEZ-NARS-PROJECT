import { AppShell } from "@/components/app-shell";
import { PropertyForm } from "@/components/property-form";

export default function NewPropertyPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-widest text-[#0c43a8]">
          GIS / Property Registration
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Create Land or Building Record</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Complete the editable NARS property record. Once saved, the central database, GIS map,
          and NARS summary update automatically.
        </p>
      </div>

      <PropertyForm />
    </AppShell>
  );
}

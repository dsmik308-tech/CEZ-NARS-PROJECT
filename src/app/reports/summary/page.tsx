import { AppShell } from "@/components/app-shell";
import { PrintButton } from "@/components/print-button";
import { SummaryReport } from "@/components/summary-report";

export default function SummaryPage() {
  return (
    <AppShell>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-[#0c43a8]">
            NARS Report Template
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Land & Building Summary</h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            Automatically aggregated from registered Land, Building, and Specialized Asset records.
          </p>
        </div>
        <PrintButton />
      </div>

      <SummaryReport />
    </AppShell>
  );
}

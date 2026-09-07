"use client";

export function PrintButton({ label = "Print Report" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print rounded-xl bg-[#082664] px-5 py-3 text-sm font-bold text-white shadow-lg"
    >
      {label}
    </button>
  );
}

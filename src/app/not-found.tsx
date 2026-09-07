import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl">
        <p className="text-sm font-bold uppercase tracking-widest text-[#0c43a8]">PEZA NARS</p>
        <h1 className="mt-3 text-3xl font-black">Record not found</h1>
        <p className="mt-3 text-slate-600">
          The page or property record you requested is not in the registry.
        </p>
        <Link
          href="/registry"
          className="mt-6 inline-block rounded-xl bg-[#082664] px-5 py-3 text-sm font-bold text-white"
        >
          Back to Registry
        </Link>
      </div>
    </main>
  );
}

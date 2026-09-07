import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl">
        <p className="text-sm font-bold uppercase tracking-widest text-red-600">Access denied</p>
        <h1 className="mt-3 text-3xl font-black">Your role cannot open this page</h1>
        <p className="mt-3 text-slate-600">
          PEZA NARS uses role-based permissions. Ask a System Administrator if you need encoder,
          approver, or auditor rights.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/registry" className="rounded-xl bg-[#082664] px-5 py-3 text-sm font-bold text-white">
            Back to Registry
          </Link>
          <Link href="/login" className="rounded-xl border px-5 py-3 text-sm font-bold">
            Switch account
          </Link>
        </div>
      </div>
    </main>
  );
}

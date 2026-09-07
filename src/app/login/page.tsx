"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { Eye, EyeOff, Lock, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { ROLE_META, Role } from "@/lib/permissions";
import { useAuth } from "@/components/auth-provider";

const DEMO_ACCOUNTS: Array<{ username: string; password: string; role: Role }> = [
  { username: "admin", password: "PEZA-Admin-2026", role: "ADMIN" },
  { username: "encoder", password: "PEZA-Encoder-2026", role: "ENCODER" },
  { username: "reviewer", password: "PEZA-Reviewer-2026", role: "REVIEWER" },
  { username: "approver", password: "PEZA-Approver-2026", role: "APPROVER" },
  { username: "auditor", password: "PEZA-Auditor-2026", role: "AUDITOR" },
];

function safeNext(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/login")) {
    return "/registry";
  }
  return next;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, remember }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || "Sign-in failed.");
        return;
      }
      toast.success(`Welcome, ${data.user.fullName}`);
      await refresh();
      router.push(safeNext(searchParams.get("next")));
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-[#061b49] lg:block">
        <Image
          src="/assets/peza-building.jpg"
          alt="PEZA building"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#061b49]/80 via-[#082664]/70 to-[#0c43a8]/60" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 overflow-hidden rounded-full bg-white">
              <Image src="/assets/peza-logo.png" alt="PEZA logo" fill className="object-cover" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-200">
                Philippine Economic Zone Authority
              </p>
              <h1 className="text-xl font-black">National Asset Registry System</h1>
            </div>
          </div>

          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              <ShieldCheck className="h-4 w-4 text-cyan-200" />
              Official use only · Role-based access
            </p>
            <h2 className="mt-6 max-w-xl text-5xl font-black leading-tight">
              Secure access to PEZA land and building records.
            </h2>
            <p className="mt-4 max-w-lg text-blue-100">
              Sign in with your assigned NARS role. All logins, record changes, and user
              administration actions are written to the audit trail.
            </p>
          </div>

          <p className="text-xs text-blue-200">
            UACS / Organizational Code 350460000000 · Cavite Economic Zone GIS foundation
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border bg-white">
              <Image src="/assets/peza-logo.png" alt="PEZA logo" fill className="object-cover" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">PEZA</p>
              <h1 className="font-black text-[#082664]">NARS Sign-in</h1>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-premium">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#0c43a8]">
              Authorized users
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">Sign in</h2>
            <p className="mt-2 text-sm text-slate-500">
              Use your PEZA NARS username or official email.
            </p>

            <form onSubmit={onSubmit} className="mt-8 grid gap-4">
              <label className="grid gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Username or email
                </span>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                    className="w-full rounded-xl border border-slate-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
                    placeholder="admin"
                  />
                </div>
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Password
                </span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-slate-300 py-2 pl-10 pr-10 text-sm outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
                    placeholder="••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-2.5 text-slate-400"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Keep me signed in for 7 days
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[#082664] px-4 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-60"
              >
                {submitting ? "Signing in…" : "Sign in to NARS"}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-slate-500">
              Forgot password? Contact PEZA ICT / Asset Registry Division.
            </p>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Demo accounts — click to fill
            </p>
            <div className="mt-3 grid gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.username}
                  type="button"
                  onClick={() => {
                    setUsername(account.username);
                    setPassword(account.password);
                  }}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <span>
                    <span className="font-bold text-[#082664]">{account.username}</span>
                    <span className="ml-2 text-xs text-slate-500">{ROLE_META[account.role].label}</span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">{account.password}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link href="/" className="font-semibold text-[#0c43a8]">
              Back to landing page
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Loading sign-in…</div>}>
      <LoginForm />
    </Suspense>
  );
}

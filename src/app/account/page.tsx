"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth-provider";
import { ROLE_META, isRole, roleLabel } from "@/lib/permissions";
import { formatDateTime } from "@/lib/utils";

export default function AccountPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const meta = isRole(user?.role) ? ROLE_META[user.role] : null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (nextPassword !== confirm) {
      toast.error("New password confirmation does not match.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, nextPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || "Could not change password.");
        return;
      }
      toast.success("Password updated.");
      setCurrentPassword("");
      setNextPassword("");
      setConfirm("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-widest text-[#0c43a8]">My account</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">{user?.fullName || "Account"}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Profile</h2>
          <div className="mt-5 grid gap-3">
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Username</p>
              <p className="font-semibold">{user?.username}</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email</p>
              <p className="font-semibold">{user?.email}</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Role</p>
              <div className="mt-1">
                <Badge tone={meta?.tone || "slate"}>{roleLabel(user?.role)}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-600">{meta?.description}</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Office</p>
              <p className="font-semibold">{user?.office || "—"}</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Last login
              </p>
              <p className="font-semibold">{formatDateTime(user?.lastLoginAt)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Change password</h2>
          <p className="mt-2 text-sm text-slate-600">
            Use at least 10 characters. Do not reuse your PEZA email password.
          </p>
          <form onSubmit={onSubmit} className="mt-5 grid gap-4">
            <Input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="New password"
              value={nextPassword}
              onChange={(e) => setNextPassword(e.target.value)}
              required
              minLength={10}
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={10}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Updating…" : "Update password"}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </AppShell>
  );
}

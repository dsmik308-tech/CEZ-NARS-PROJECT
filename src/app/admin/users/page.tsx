"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ROLE_META, ROLES, Role, roleLabel } from "@/lib/permissions";
import { formatDateTime } from "@/lib/utils";

type ManagedUser = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  office: string | null;
  active: boolean;
  lastLoginAt: string | null;
  failedAttempts: number;
  lockedUntil: string | null;
};

const emptyForm = {
  username: "",
  email: "",
  fullName: "",
  role: "ENCODER",
  office: "Cavite Economic Zone",
  password: "",
};

export default function UsersAdminPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/users");
    if (!res.ok) {
      toast.error("Unable to load users.");
      return;
    }
    setUsers(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function createUser(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || "Could not create user.");
        return;
      }
      toast.success(`Created ${data.username}`);
      setForm(emptyForm);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function patch(id: string, body: Record<string, unknown>, okMessage: string) {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.message || "Update failed.");
      return;
    }
    toast.success(okMessage);
    load();
  }

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-widest text-[#0c43a8]">
          Access control
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">User Management</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Create NARS accounts, assign roles, deactivate users, unlock locked accounts, and reset
          passwords. Every action is written to the audit log.
        </p>
      </div>

      <form
        onSubmit={createUser}
        className="mb-6 grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3"
      >
        <Input
          placeholder="Full name"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          required
        />
        <Input
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <Input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_META[role].label}
            </option>
          ))}
        </Select>
        <Input
          placeholder="Office / zone"
          value={form.office}
          onChange={(e) => setForm({ ...form, office: e.target.value })}
        />
        <Input
          placeholder="Temporary password (10+ chars)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <div className="md:col-span-3 flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Creating…" : "Create user"}
          </Button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-wider text-slate-600">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Office</th>
              <th className="px-4 py-3">Last login</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const locked = u.lockedUntil && new Date(u.lockedUntil).getTime() > Date.now();
              return (
                <tr key={u.id} className="border-t border-slate-200">
                  <td className="px-4 py-3">
                    <p className="font-bold">{u.fullName}</p>
                    <p className="text-xs text-slate-500">
                      {u.username} · {u.email}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={ROLE_META[u.role]?.tone || "slate"}>{roleLabel(u.role)}</Badge>
                  </td>
                  <td className="px-4 py-3">{u.office || "—"}</td>
                  <td className="px-4 py-3">{formatDateTime(u.lastLoginAt)}</td>
                  <td className="px-4 py-3">
                    {!u.active ? (
                      <Badge tone="red">Inactive</Badge>
                    ) : locked ? (
                      <Badge tone="gold">Locked</Badge>
                    ) : (
                      <Badge tone="green">Active</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        className="rounded-lg border px-3 py-2 text-xs font-bold"
                        onClick={() =>
                          patch(u.id, { active: !u.active }, u.active ? "User deactivated" : "User reactivated")
                        }
                      >
                        {u.active ? "Deactivate" : "Activate"}
                      </button>
                      {locked && (
                        <button
                          className="rounded-lg border px-3 py-2 text-xs font-bold"
                          onClick={() => patch(u.id, { unlock: true }, "Account unlocked")}
                        >
                          Unlock
                        </button>
                      )}
                      <button
                        className="rounded-lg border px-3 py-2 text-xs font-bold"
                        onClick={() => {
                          const password = window.prompt("New temporary password (10+ characters)");
                          if (!password) return;
                          patch(u.id, { password }, "Password reset");
                        }}
                      >
                        Reset password
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

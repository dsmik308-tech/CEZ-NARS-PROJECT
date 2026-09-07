"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

type Log = {
  id: string;
  username: string | null;
  action: string;
  entity: string | null;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
};

export default function AuditPage() {
  const [q, setQ] = useState("");
  const [logs, setLogs] = useState<Log[]>([]);

  async function load() {
    const url = new URL("/api/audit", window.location.origin);
    if (q) url.searchParams.set("q", q);
    const res = await fetch(url);
    if (res.ok) setLogs(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-widest text-[#0c43a8]">
          Accountability
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Audit Log</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Sign-ins, record changes, and user administration events for PEZA NARS.
        </p>
      </div>

      <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_auto]">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Search username, action, details..."
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        />
        <Button onClick={load}>Search</Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-wider text-slate-600">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Details</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-slate-200">
                <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                <td className="px-4 py-3 font-semibold">{log.username || "—"}</td>
                <td className="px-4 py-3 font-mono text-xs">{log.action}</td>
                <td className="px-4 py-3">{log.entity || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{log.details || "—"}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{log.ipAddress}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-slate-500">
                  No audit events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

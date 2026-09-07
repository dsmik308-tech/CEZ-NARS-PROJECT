"use client";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { PropertyTable } from "@/components/property-table";
import { peso } from "@/lib/utils";
import type { PropertyRecord } from "@/types";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";

export default function RegistryPage() {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("");
  const [records, setRecords] = useState<PropertyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { allowed } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    const url = new URL("/api/properties", window.location.origin);
    if (q) url.searchParams.set("q", q);
    if (kind) url.searchParams.set("kind", kind);
    const data = await fetch(url).then((r) => r.json());
    setRecords(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [q, kind]);

  useEffect(() => {
    load();
  }, []);

  const totals = useMemo(() => {
    return {
      count: records.length,
      nbv: records.reduce((sum, r) => sum + (r.netBookValue || 0), 0),
      land: records.filter((r) => r.propertyKind === "LAND").length,
      building: records.filter((r) => r.propertyKind === "BUILDING").length,
    };
  }, [records]);

  return (
    <AppShell>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-[#0c43a8]">
            Central Property Database
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Land & Building Registry</h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            Search, filter, view, edit, and delete GIS-linked NARS master property records.
          </p>
        </div>

        {allowed("create") && (
          <Link
            href="/registry/new"
            className="rounded-xl bg-[#082664] px-5 py-3 text-center text-sm font-bold text-white shadow-lg"
          >
            Add Asset
          </Link>
        )}
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-4">
        {[
          ["Records in view", String(totals.count)],
          ["Land parcels", String(totals.land)],
          ["Buildings", String(totals.building)],
          ["Net book value", peso(totals.nbv)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
            <p className="mt-1 text-xl font-black text-[#082664]">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_220px_auto]">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Search asset name, account code, phase, block..."
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        />

        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All Asset Kinds</option>
          <option value="LAND">Land</option>
          <option value="BUILDING">Building</option>
          <option value="SPECIALIZED">Specialized</option>
        </select>

        <Button onClick={load}>{loading ? "Loading..." : "Search"}</Button>
      </div>

      <PropertyTable records={records} onDeleted={load} />
    </AppShell>
  );
}

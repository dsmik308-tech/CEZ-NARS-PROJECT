"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { MASTER_CATEGORY_META } from "@/lib/nars-master-catalog";
import { parseMetadata } from "@/lib/master-data";

type MasterRow = {
  id: string;
  category: string;
  code?: string | null;
  label: string;
  metadata?: string | null;
  active: boolean;
  sortOrder: number;
};

type RegionRow = {
  id: string;
  code: string;
  name: string;
  _count?: { provinces: number; properties: number };
};

type ProvinceRow = {
  id: string;
  code: string;
  name: string;
  regionId: string;
  region?: { name: string };
  _count?: { properties: number };
};

export default function MasterDataPage() {
  const [category, setCategory] = useState("ASSET_TYPE");
  const [rows, setRows] = useState<MasterRow[]>([]);
  const [regions, setRegions] = useState<RegionRow[]>([]);
  const [provinces, setProvinces] = useState<ProvinceRow[]>([]);
  const [regionFilter, setRegionFilter] = useState("");
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<MasterRow | null>(null);
  const [editingGeo, setEditingGeo] = useState<RegionRow | ProvinceRow | null>(null);
  const [form, setForm] = useState({ label: "", code: "", assetType: "", sortOrder: "0" });
  const [geoForm, setGeoForm] = useState({ name: "", code: "", regionId: "" });

  const meta = MASTER_CATEGORY_META.find((item) => item.id === category);
  const isGeo = category === "REGIONS" || category === "PROVINCES";

  async function load() {
    if (category === "REGIONS") {
      const data = await fetch("/api/master-data?category=REGIONS").then((r) => r.json());
      setRegions(data);
      return;
    }
    if (category === "PROVINCES") {
      const [r, p] = await Promise.all([
        fetch("/api/master-data?category=REGIONS").then((res) => res.json()),
        fetch(
          `/api/master-data?category=PROVINCES${regionFilter ? `&regionId=${regionFilter}` : ""}`
        ).then((res) => res.json()),
      ]);
      setRegions(r);
      setProvinces(p);
      return;
    }
    const data = await fetch(
      `/api/master-data?category=${category}&includeInactive=1`
    ).then((r) => r.json());
    setRows(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    load();
    setEditing(null);
    setEditingGeo(null);
    setForm({ label: "", code: "", assetType: "", sortOrder: String(rows.length) });
    setGeoForm({ name: "", code: "", regionId: regionFilter });
    setQ("");
  }, [category, regionFilter]);

  const assetTypes = useMemo(
    () =>
      category === "ACCOUNT_CODE"
        ? Array.from(
            new Set(
              rows
                .map((row) => parseMetadata(row.metadata).assetType)
                .filter(Boolean)
            )
          )
        : [],
    [category, rows]
  );

  const filteredRows = rows.filter((row) => {
    const hay = `${row.label} ${row.code || ""}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  const filteredProvinces = provinces.filter((row) =>
    `${row.name} ${row.region?.name || ""}`.toLowerCase().includes(q.toLowerCase())
  );

  async function saveOption(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        category,
        label: form.label,
        code: form.code || form.label,
        sortOrder: Number(form.sortOrder) || 0,
        metadata:
          category === "ACCOUNT_CODE" && form.assetType
            ? { assetType: form.assetType }
            : category === "ASSET_TYPE" && form.code
            ? { accountCode: form.code }
            : undefined,
      };
      const res = await fetch(editing ? `/api/master-data/${editing.id}` : "/api/master-data", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || "Save failed.");
        return;
      }
      toast.success(editing ? "Reference value updated." : "Reference value created.");
      setEditing(null);
      setForm({ label: "", code: "", assetType: "", sortOrder: "0" });
      load();
    } finally {
      setSaving(false);
    }
  }

  async function saveGeo(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const isRegion = category === "REGIONS";
      const endpoint = editingGeo
        ? isRegion
          ? `/api/master-data/regions/${editingGeo.id}`
          : `/api/master-data/provinces/${editingGeo.id}`
        : isRegion
          ? "/api/master-data/regions"
          : "/api/master-data/provinces";
      const res = await fetch(endpoint, {
        method: editingGeo ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isRegion
            ? { name: geoForm.name, code: geoForm.code }
            : { name: geoForm.name, code: geoForm.code, regionId: geoForm.regionId || regionFilter }
        ),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || "Save failed.");
        return;
      }
      toast.success(
        editingGeo
          ? isRegion
            ? "Region updated."
            : "Province updated."
          : isRegion
            ? "Region created."
            : "Province created."
      );
      setEditingGeo(null);
      setGeoForm({ name: "", code: "", regionId: regionFilter });
      load();
    } finally {
      setSaving(false);
    }
  }

  async function removeOption(row: MasterRow) {
    if (!confirm(`Delete “${row.label}”?`)) return;
    const res = await fetch(`/api/master-data/${row.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Delete failed.");
      return;
    }
    toast.success("Deleted.");
    load();
  }

  async function toggleActive(row: MasterRow) {
    const res = await fetch(`/api/master-data/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !row.active }),
    });
    if (!res.ok) {
      toast.error("Update failed.");
      return;
    }
    load();
  }

  async function removeRegion(row: RegionRow) {
    if (!confirm(`Delete region “${row.name}”?`)) return;
    const res = await fetch(`/api/master-data/regions/${row.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.message || "Delete failed.");
      return;
    }
    toast.success("Region deleted.");
    load();
  }

  async function removeProvince(row: ProvinceRow) {
    if (!confirm(`Delete province “${row.name}”?`)) return;
    const res = await fetch(`/api/master-data/provinces/${row.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.message || "Delete failed.");
      return;
    }
    toast.success("Province deleted.");
    load();
  }

  async function restoreOfficial() {
    if (
      !confirm(
        "Restore the official NARS reference lists? This replaces dropdown values with the Bureau of the Treasury / PEZA catalog."
      )
    ) {
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/master-data/restore", { method: "POST" });
      if (!res.ok) {
        toast.error("Restore failed.");
        return;
      }
      toast.success("Official NARS master data restored.");
      load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-[#0c43a8]">
            Reference tables
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Master Data</h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            Maintain the NARS dropdowns used on land and building registration. Asset Type drives
            Account Code. Region drives Province.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={restoreOfficial} disabled={saving}>
          Restore official NARS list
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
          {MASTER_CATEGORY_META.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              className={`mb-1 w-full rounded-xl px-3 py-3 text-left text-sm font-semibold ${
                category === item.id
                  ? "bg-[#082664] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </aside>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-2xl font-black">{meta?.label}</h2>
            <p className="mt-1 text-sm text-slate-600">{meta?.description}</p>
          </div>

          {!isGeo && (
            <form onSubmit={saveOption} className="mb-5 grid gap-3 md:grid-cols-4">
              <Input
                placeholder="Label"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                required
              />
              <Input
                placeholder={category === "ACCOUNT_CODE" ? "Account code" : "Code (optional)"}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
              {category === "ACCOUNT_CODE" ? (
                <Input
                  placeholder="Linked asset type"
                  value={form.assetType}
                  onChange={(e) => setForm({ ...form, assetType: e.target.value })}
                  list="asset-type-options"
                />
              ) : (
                <Input
                  placeholder="Sort order"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                />
              )}
              <Button type="submit" disabled={saving}>
                {editing ? "Update value" : "Add value"}
              </Button>
              {assetTypes.length > 0 && (
                <datalist id="asset-type-options">
                  {assetTypes.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              )}
            </form>
          )}

          {isGeo && (
            <form onSubmit={saveGeo} className="mb-5 grid gap-3 md:grid-cols-4">
              {category === "PROVINCES" && (
                <Select
                  value={geoForm.regionId || regionFilter}
                  onChange={(e) => {
                    setGeoForm({ ...geoForm, regionId: e.target.value });
                    setRegionFilter(e.target.value);
                  }}
                  required
                >
                  <option value="">Select region...</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </Select>
              )}
              <Input
                placeholder={category === "REGIONS" ? "Region name" : "Province name"}
                value={geoForm.name}
                onChange={(e) => setGeoForm({ ...geoForm, name: e.target.value })}
                required
              />
              <Input
                placeholder="Code (optional)"
                value={geoForm.code}
                onChange={(e) => setGeoForm({ ...geoForm, code: e.target.value })}
              />
              <Button type="submit" disabled={saving}>
                {editingGeo
                  ? category === "REGIONS"
                    ? "Update region"
                    : "Update province"
                  : category === "REGIONS"
                    ? "Add region"
                    : "Add province"}
              </Button>
            </form>
          )}

          <div className="mb-4">
            <Input
              placeholder="Search values..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {category === "REGIONS" && (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-3 py-2">Region</th>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Provinces</th>
                  <th className="px-3 py-2">Properties</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {regions
                  .filter((row) => row.name.toLowerCase().includes(q.toLowerCase()))
                  .map((row) => (
                    <tr key={row.id} className="border-t">
                      <td className="px-3 py-2 font-semibold">{row.name}</td>
                      <td className="px-3 py-2">{row.code}</td>
                      <td className="px-3 py-2">{row._count?.provinces || 0}</td>
                      <td className="px-3 py-2">{row._count?.properties || 0}</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          className="rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white"
                          onClick={() => removeRegion(row)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {category === "PROVINCES" && (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-3 py-2">Province</th>
                  <th className="px-3 py-2">Region</th>
                  <th className="px-3 py-2">Properties</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProvinces.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-3 py-2 font-semibold">{row.name}</td>
                    <td className="px-3 py-2">{row.region?.name}</td>
                    <td className="px-3 py-2">{row._count?.properties || 0}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-lg border px-3 py-1 text-xs font-bold"
                          onClick={() => {
                            setEditingGeo(row);
                            setGeoForm({ name: row.name, code: row.code, regionId: row.regionId });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white"
                          onClick={() => removeProvince(row)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!isGeo && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Label</th>
                    <th className="px-3 py-2">Code</th>
                    <th className="px-3 py-2">Link</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => {
                    const metaJson = parseMetadata(row.metadata);
                    return (
                      <tr key={row.id} className="border-t">
                        <td className="px-3 py-2 font-semibold">{row.label}</td>
                        <td className="px-3 py-2 font-mono text-xs">{row.code}</td>
                        <td className="px-3 py-2 text-xs text-slate-500">
                          {metaJson.assetType || metaJson.accountCode || "—"}
                        </td>
                        <td className="px-3 py-2">
                          <Badge tone={row.active ? "green" : "slate"}>
                            {row.active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex justify-end gap-2">
                            <button
                              className="rounded-lg border px-3 py-1 text-xs font-bold"
                              onClick={() => {
                                setEditing(row);
                                setForm({
                                  label: row.label,
                                  code: row.code || "",
                                  assetType: metaJson.assetType || "",
                                  sortOrder: String(row.sortOrder),
                                });
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="rounded-lg border px-3 py-1 text-xs font-bold"
                              onClick={() => toggleActive(row)}
                            >
                              {row.active ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              className="rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white"
                              onClick={() => removeOption(row)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-10 text-center text-slate-500">
                        No values in this list.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

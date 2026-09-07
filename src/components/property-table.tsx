"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { formatDate, kindLabel, peso } from "@/lib/utils";
import type { PropertyRecord } from "@/types";
import { useAuth } from "@/components/auth-provider";

export function PropertyTable({
  records,
  onDeleted,
}: {
  records: PropertyRecord[];
  onDeleted?: () => void;
}) {
  const { allowed } = useAuth();

  async function remove(id: string, name: string) {
    if (!confirm(`Delete NARS record “${name}”? This cannot be undone.`)) return;
    const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete record.");
      return;
    }
    toast.success("Record deleted. Summary and GIS will update.");
    onDeleted?.();
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[1100px] text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase tracking-wider text-slate-600">
          <tr>
            <th className="px-4 py-3">Asset</th>
            <th className="px-4 py-3">Kind</th>
            <th className="px-4 py-3">Account Code</th>
            <th className="px-4 py-3">Region</th>
            <th className="px-4 py-3">Province</th>
            <th className="px-4 py-3">CEZ Location</th>
            <th className="px-4 py-3">NBV</th>
            <th className="px-4 py-3">Updated</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-t border-slate-200 hover:bg-slate-50">
              <td className="px-4 py-3">
                <Link href={`/registry/${r.id}`} className="font-bold text-[#082664] hover:underline">
                  {r.assetName}
                </Link>
                <p className="text-xs text-slate-500">{r.assetDescription}</p>
              </td>
              <td className="px-4 py-3">
                <Badge
                  tone={
                    r.propertyKind === "LAND"
                      ? "blue"
                      : r.propertyKind === "BUILDING"
                      ? "red"
                      : "gold"
                  }
                >
                  {kindLabel(r.propertyKind)}
                </Badge>
              </td>
              <td className="px-4 py-3">{r.accountCode}</td>
              <td className="px-4 py-3">{r.region?.name}</td>
              <td className="px-4 py-3">{r.province?.name}</td>
              <td className="px-4 py-3">
                {[r.cezPhase, r.cezBlock, r.cezLot].filter(Boolean).join(" ")}
              </td>
              <td className="px-4 py-3 font-semibold">{peso(r.netBookValue)}</td>
              <td className="px-4 py-3">{formatDate(r.updatedAt)}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/registry/${r.id}`}
                    className="rounded-lg border px-3 py-2 text-xs font-bold"
                  >
                    View
                  </Link>
                  {allowed("edit") && (
                    <Link
                      href={`/registry/${r.id}/edit`}
                      className="rounded-lg border px-3 py-2 text-xs font-bold"
                    >
                      Edit
                    </Link>
                  )}
                  {allowed("delete") && (
                    <button
                      onClick={() => remove(r.id, r.assetName)}
                      className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}

          {records.length === 0 && (
            <tr>
              <td colSpan={9} className="px-4 py-16 text-center text-slate-500">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

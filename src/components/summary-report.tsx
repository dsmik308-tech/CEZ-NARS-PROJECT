"use client";

import { useEffect, useState } from "react";
import { peso } from "@/lib/utils";

const HEADERS = [
  "No. of Assets",
  "Acquisition Cost",
  "Net Book Value",
  "Sound/Market Value",
  "Accumulated Depreciation",
  "Assessed Value",
  "Appraised Value",
  "Improvement / Rehabilitation",
  "Replacement Value",
];

function get(obj: unknown, path: string): number {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
  return typeof value === "number" ? value : 0;
}

export function SummaryReport() {
  const [summary, setSummary] = useState<{
    rows: Array<Record<string, unknown>>;
    totals: Array<Record<string, unknown>>;
  } | null>(null);

  useEffect(() => {
    fetch("/api/summary")
      .then((r) => r.json())
      .then(setSummary)
      .catch(() => setSummary({ rows: [], totals: [] }));
  }, []);

  if (!summary) {
    return <div className="rounded-2xl bg-white p-10">Loading summary...</div>;
  }

  function moneyCells(prefix: string, row: Record<string, unknown>) {
    return (
      <>
        <td>{get(row, `${prefix}._count.id`)}</td>
        <td>{peso(get(row, `${prefix}._sum.acquisitionCost`))}</td>
        <td>{peso(get(row, `${prefix}._sum.netBookValue`))}</td>
        <td>{peso(get(row, `${prefix}._sum.soundMarketValueAmount`))}</td>
        <td>{peso(get(row, `${prefix}._sum.accumulatedDepreciation`))}</td>
        <td>{peso(get(row, `${prefix}._sum.assessedValueAmount`))}</td>
        <td>{peso(get(row, `${prefix}._sum.appraisedValueAmount`))}</td>
        <td>{peso(get(row, `${prefix}._sum.improvementValueAmount`))}</td>
        <td>{peso(get(row, `${prefix}._sum.replacementValueAmount`))}</td>
      </>
    );
  }

  return (
    <div className="print-sheet overflow-x-auto bg-white p-6">
      <div className="mb-12 text-center">
        <h1 className="text-xl font-normal">BUREAU OF THE TREASURY</h1>
        <h2 className="mt-2 text-lg font-semibold">Asset Management Service</h2>
        <h3 className="text-lg font-semibold">Asset Registry Division</h3>
      </div>

      <div className="mb-10">
        <p className="font-semibold">National Government Non-Financial Assets</p>
        <p className="mt-3">From: Philippine Economic Zone Authority</p>
        <p>Date Submitted: __________________</p>
      </div>

      <table className="report-table min-w-[2600px]">
        <thead>
          <tr>
            <th colSpan={28} className="report-blue text-center text-base">
              Agency Name NARS Submission
            </th>
          </tr>
          <tr>
            <th rowSpan={2} className="report-blue">
              Regional Offices
            </th>
            <th colSpan={9} className="report-yellow">
              Building Assets
            </th>
            <th colSpan={9} className="report-green">
              Land Assets
            </th>
            <th colSpan={9} className="report-yellow">
              Specialized Assets
            </th>
          </tr>
          <tr>
            {HEADERS.map((h) => (
              <th key={`b-${h}`} className="report-yellow">
                {h}
              </th>
            ))}
            {HEADERS.map((h) => (
              <th key={`l-${h}`} className="report-green">
                {h}
              </th>
            ))}
            {HEADERS.map((h) => (
              <th key={`s-${h}`} className="report-yellow">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {summary.rows.map((row) => (
            <tr key={String(row.region)}>
              <td className="report-blue">{String(row.region)}</td>
              {moneyCells("buildings", row)}
              {moneyCells("lands", row)}
              {moneyCells("specialized", row)}
            </tr>
          ))}
        </tbody>
      </table>

      <aside className="mt-10 w-[520px]">
        <table className="report-table">
          <thead>
            <tr>
              <th colSpan={3} className="report-blue text-base">
                Assets Reported to NARS
              </th>
            </tr>
            <tr>
              <th className="bg-yellow-300">Asset Types</th>
              <th className="bg-yellow-300">Number of Assets</th>
              <th className="bg-yellow-300">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {summary.totals.map((t) => (
              <tr key={String(t.propertyKind)}>
                <td>{String(t.propertyKind)}</td>
                <td>{get(t, "_count.id")}</td>
                <td>{peso(get(t, "_sum.netBookValue"))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </aside>
    </div>
  );
}

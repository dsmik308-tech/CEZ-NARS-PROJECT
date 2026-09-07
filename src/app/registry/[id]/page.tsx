import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { formatDate, kindLabel, peso } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CezMap } from "@/components/cez-map-dynamic";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function PropertyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: { region: true, province: true },
  });

  if (!property) notFound();
  const user = await getCurrentUser();
  const canEdit = can(user?.role, "edit");

  const rows = [
    ["Organizational Code", property.organizationCode],
    ["Asset Type", property.assetType],
    ["Account Code", property.accountCode],
    ["Region", property.region?.name],
    ["Province", property.province?.name],
    ["City / Municipality", property.cityMunicipality],
    ["Barangay", property.barangay],
    ["CEZ Phase", property.cezPhase],
    ["CEZ Block", property.cezBlock],
    ["CEZ Lot", property.cezLot],
    ["Owner", property.owner],
    ["Mode of Acquisition", property.modeOfAcquisitionConveyance],
    ["TCT / TD No.", property.tctTdNumber],
    ["Date of Acquisition", formatDate(property.dateOfAcquisition)],
    ["Acquisition Cost", peso(property.acquisitionCost)],
    ["Accumulated Depreciation", peso(property.accumulatedDepreciation)],
    ["Net Book Value", peso(property.netBookValue)],
    ["Sound / Market Value", peso(property.soundMarketValueAmount)],
    ["Appraised Value", peso(property.appraisedValueAmount)],
    ["Assessed Value", peso(property.assessedValueAmount)],
    ["Replacement Value", peso(property.replacementValueAmount)],
    ["Asset Condition", property.assetCondition],
    ["Structure Material", property.structureMaterial],
    ["Land Classification", property.landClassification],
    ["Security Type", property.securityType],
    ["Floor / Lot Area (sq.m.)", property.floorLotAreaSqm?.toLocaleString()],
    ["Insured", property.isInsured ? "Yes" : "No"],
    ["Policy Type", property.policyType],
    ["Insurer", property.insurerName],
  ];

  return (
    <AppShell>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-[#0c43a8]">
            NARS Property Record
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">{property.assetName}</h1>
          <p className="mt-3 max-w-3xl text-slate-600">{property.assetDescription}</p>
          <div className="mt-3">
            <Badge
              tone={
                property.propertyKind === "LAND"
                  ? "blue"
                  : property.propertyKind === "BUILDING"
                  ? "red"
                  : "gold"
              }
            >
              {kindLabel(property.propertyKind)}
            </Badge>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href="/registry"
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold"
          >
            Back
          </Link>
          <Link
            href={`/registry/${property.id}/edit`}
            className="rounded-xl bg-[#082664] px-5 py-3 text-sm font-bold text-white shadow-lg"
          >
            Edit Record
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            {rows.map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {label}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{value || "—"}</p>
              </div>
            ))}
          </div>
          {property.remarks && (
            <div className="mt-6 rounded-xl border border-slate-200 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Remarks
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-700">{property.remarks}</p>
            </div>
          )}
        </section>

        <div>
          {property.latitude && property.longitude ? (
            <CezMap
              compact
              highlightId={property.id}
              picked={{ lat: property.latitude, lng: property.longitude }}
            />
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-sm text-slate-500">
              This record is not pinned to the CEZ Master Plan.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

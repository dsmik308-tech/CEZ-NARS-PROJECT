"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PropertyInput, propertySchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CEZ_PHASES } from "@/lib/map";
import { isOthers, parseMetadata } from "@/lib/master-data";

const CezMap = dynamic(() => import("@/components/cez-map").then((m) => m.CezMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-3xl border bg-slate-50 text-sm text-slate-500">
      Loading CEZ Master Plan…
    </div>
  ),
});

type Option = {
  id: string;
  label?: string;
  name?: string;
  code?: string;
  metadata?: string | null;
};

async function getMaster(category: string, extra?: Record<string, string>) {
  const url = new URL(`/api/master-data`, window.location.origin);
  url.searchParams.set("category", category);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value) url.searchParams.set(key, value);
    }
  }
  const data = await fetch(url).then((r) => r.json());
  return Array.isArray(data) ? (data as Option[]) : [];
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
      {children}
    </span>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  valueKey = "label",
  labelKey = "label",
}: {
  label: string;
  value?: string | null;
  onChange: (value: string) => void;
  options: Option[];
  valueKey?: "id" | "label" | "name" | "code";
  labelKey?: "label" | "name";
}) {
  return (
    <label className="grid gap-1">
      <FieldLabel>{label}</FieldLabel>
      <Select value={value || ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option.id} value={String((option as Record<string, unknown>)[valueKey] ?? "")}>
            {String((option as Record<string, unknown>)[labelKey] ?? "")}
          </option>
        ))}
      </Select>
    </label>
  );
}

function toDateInput(value?: string | Date | null) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function PropertyForm({
  initial,
}: {
  initial?: Partial<PropertyInput> & { id?: string };
}) {
  const [regions, setRegions] = useState<Option[]>([]);
  const [provinces, setProvinces] = useState<Option[]>([]);
  const [orgCodes, setOrgCodes] = useState<Option[]>([]);
  const [assetTypes, setAssetTypes] = useState<Option[]>([]);
  const [accountCodes, setAccountCodes] = useState<Option[]>([]);
  const [modes, setModes] = useState<Option[]>([]);
  const [currencies, setCurrencies] = useState<Option[]>([]);
  const [conditions, setConditions] = useState<Option[]>([]);
  const [materials, setMaterials] = useState<Option[]>([]);
  const [floodDefences, setFloodDefences] = useState<Option[]>([]);
  const [landClasses, setLandClasses] = useState<Option[]>([]);
  const [securityTypes, setSecurityTypes] = useState<Option[]>([]);
  const [policyTypes, setPolicyTypes] = useState<Option[]>([]);
  const [disposalModes, setDisposalModes] = useState<Option[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<PropertyInput>({
    resolver: zodResolver(propertySchema) as never,
    defaultValues: {
      organizationCode: "350460000000",
      propertyKind: "LAND",
      currency: "PHP",
      gisGeometryType: "POINT",
      ...initial,
      dateOfAcquisition: toDateInput(initial?.dateOfAcquisition as never) as never,
    },
  });

  const regionId = watch("regionId");
  const latitude = watch("latitude");
  const longitude = watch("longitude");
  const assetType = watch("assetType");

  useEffect(() => {
    Promise.all([
      getMaster("REGIONS"),
      getMaster("ORGANIZATIONAL_CODE"),
      getMaster("ASSET_TYPE"),
      getMaster("MODE_OF_ACQUISITION_CONVEYANCE"),
      getMaster("CURRENCY"),
      getMaster("ASSET_CONDITION"),
      getMaster("STRUCTURE_MATERIAL"),
      getMaster("FLOOD_DEFENCES"),
      getMaster("LAND_CLASSIFICATION"),
      getMaster("SECURITY_TYPE"),
      getMaster("POLICY_TYPE"),
      getMaster("MODE_OF_DISPOSAL"),
    ]).then(([r, org, at, mo, cu, co, ma, fd, lc, st, pt, md]) => {
      setRegions(r);
      setOrgCodes(org);
      setAssetTypes(at);
      setModes(mo);
      setCurrencies(cu);
      setConditions(co);
      setMaterials(ma);
      setFloodDefences(fd);
      setLandClasses(lc);
      setSecurityTypes(st);
      setPolicyTypes(pt);
      setDisposalModes(md);
    });
  }, []);

  useEffect(() => {
    if (!regionId) {
      setProvinces([]);
      return;
    }
    getMaster("PROVINCES", { regionId }).then(setProvinces);
  }, [regionId]);

  useEffect(() => {
    if (!assetType) {
      getMaster("ACCOUNT_CODE").then(setAccountCodes);
      return;
    }
    getMaster("ACCOUNT_CODE", { assetType }).then((codes) => {
      setAccountCodes(codes);
      const current = watch("accountCode");
      const match = codes.find((option) => parseMetadata(option.metadata).assetType === assetType);
      if (match && (!current || !codes.some((option) => option.label === current || option.code === current))) {
        setValue("accountCode", match.label);
      }
    });
  }, [assetType, setValue, watch]);

  async function onSubmit(data: PropertyInput) {
    const method = initial?.id ? "PATCH" : "POST";
    const url = initial?.id ? `/api/properties/${initial.id}` : "/api/properties";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      toast.error(payload.message || "Failed to save record.");
      return;
    }

    toast.success("NARS record saved. Registry, GIS, and summary will refresh.");
    window.location.href = "/registry";
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8">
      {errors.assetName && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Please complete required fields (asset name and asset type).
        </p>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black">A. General Information</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <SelectField
            label="Organizational Code / UACS"
            value={watch("organizationCode")}
            onChange={(v) => setValue("organizationCode", v)}
            options={orgCodes}
          />

          <label className="grid gap-1">
            <FieldLabel>Property Kind</FieldLabel>
            <Select {...register("propertyKind")}>
              <option value="LAND">Land</option>
              <option value="BUILDING">Building</option>
              <option value="SPECIALIZED">Specialized Asset</option>
            </Select>
          </label>

          <SelectField
            label="Asset Type"
            value={watch("assetType")}
            onChange={(v) => setValue("assetType", v, { shouldValidate: true })}
            options={assetTypes}
          />

          <SelectField
            label="Account Code per Asset Type"
            value={watch("accountCode")}
            onChange={(v) => setValue("accountCode", v)}
            options={accountCodes}
          />

          <label className="grid gap-1 md:col-span-2">
            <FieldLabel>Asset Name</FieldLabel>
            <Input {...register("assetName")} placeholder="Official asset name" />
          </label>

          <label className="grid gap-1 md:col-span-3">
            <FieldLabel>Asset Description</FieldLabel>
            <Input {...register("assetDescription")} placeholder="Brief description of the property" />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black">B. Location Information</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <SelectField
            label="Region"
            value={watch("regionId")}
            onChange={(v) => {
              setValue("regionId", v);
              setValue("provinceId", "");
            }}
            options={regions}
            valueKey="id"
            labelKey="name"
          />

          <SelectField
            label="Region & Province"
            value={watch("provinceId")}
            onChange={(v) => setValue("provinceId", v)}
            options={provinces}
            valueKey="id"
            labelKey="name"
          />

          <label className="grid gap-1">
            <FieldLabel>City / Municipality</FieldLabel>
            <Input {...register("cityMunicipality")} />
          </label>

          <Input placeholder="Barangay" {...register("barangay")} />
          <Input placeholder="Street Name" {...register("streetName")} />
          <Input placeholder="Subdivision / Purok" {...register("subdivisionPurok")} />
          <Input placeholder="House / Lot / Block No." {...register("houseLotBlockNo")} />

          <Input placeholder="Latitude / Image Y" {...register("latitude")} />
          <Input placeholder="Longitude / Image X" {...register("longitude")} />

          <label className="grid gap-1">
            <FieldLabel>CEZ Phase</FieldLabel>
            <Select {...register("cezPhase")}>
              <option value="">Select phase...</option>
              {CEZ_PHASES.map((phase) => (
                <option key={phase.id} value={phase.id}>
                  {phase.label}
                </option>
              ))}
            </Select>
          </label>
          <Input placeholder="CEZ Block" {...register("cezBlock")} />
          <Input placeholder="CEZ Lot" {...register("cezLot")} />
        </div>

        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold text-slate-600">
            Click on the CEZ Master Plan to link this asset to a map location.
            {latitude && longitude ? (
              <span className="ml-2 text-[#0c43a8]">
                Pin: {Number(latitude).toFixed(1)}, {Number(longitude).toFixed(1)}
              </span>
            ) : null}
          </p>
          <CezMap
            selectable
            compact
            highlightId={initial?.id}
            picked={
              latitude && longitude
                ? { lat: Number(latitude), lng: Number(longitude) }
                : null
            }
            onPick={(lat, lng) => {
              setValue("latitude", lat);
              setValue("longitude", lng);
              toast.message("Map pin captured", {
                description: `Image coordinates ${lat.toFixed(1)}, ${lng.toFixed(1)}`,
              });
            }}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black">C. Legal Information</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Input placeholder="Owner" {...register("owner")} />
          <SelectField
            label="Mode of Acquisition / Conveyance"
            value={watch("modeOfAcquisitionConveyance")}
            onChange={(v) => setValue("modeOfAcquisitionConveyance", v)}
            options={modes}
          />
          {isOthers(watch("modeOfAcquisitionConveyance")) && (
            <Input placeholder="Specify other mode" {...register("acquisitionConveyanceInfo")} />
          )}
          <label className="grid gap-1">
            <FieldLabel>Date of Acquisition</FieldLabel>
            <Input type="date" {...register("dateOfAcquisition")} />
          </label>
          <Input placeholder="TCT / TD Number" {...register("tctTdNumber")} />
          <Input placeholder="Donor / Seller / Transferor" {...register("donorSellerTransferor")} />
          <Input placeholder="Donee / Buyer / Transferee" {...register("doneeBuyerTransferee")} />
          <Input placeholder="Impediment Details" {...register("impedimentDetails")} />
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <input type="checkbox" {...register("withImpediments")} />
            With impediments
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <input type="checkbox" {...register("structureLandOwnedByAgency")} />
            Owned by agency
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <input type="checkbox" {...register("landTctTdAvailable")} />
            TCT / TD available
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black">D. Financial Information</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <SelectField
            label="Currency"
            value={watch("currency")}
            onChange={(v) => setValue("currency", v)}
            options={currencies}
          />
          <Input placeholder="Acquisition Cost" {...register("acquisitionCost")} />
          <Input placeholder="Accumulated Depreciation" {...register("accumulatedDepreciation")} />
          <Input placeholder="Net Book Value" {...register("netBookValue")} />
          <Input placeholder="Sound / Market Value" {...register("soundMarketValueAmount")} />
          <Input placeholder="Improvement Value" {...register("improvementValueAmount")} />
          <Input placeholder="Appraised Value" {...register("appraisedValueAmount")} />
          <Input placeholder="Assessed Value" {...register("assessedValueAmount")} />
          <Input placeholder="Replacement Value" {...register("replacementValueAmount")} />
          <Input placeholder="Asset Life (years)" {...register("assetLifeYears")} />
          <Input placeholder="Years Used" {...register("numberOfYearsUsed")} />
          <SelectField
            label="Mode of Disposal"
            value={watch("modeOfDisposal")}
            onChange={(v) => setValue("modeOfDisposal", v)}
            options={disposalModes}
          />
          {isOthers(watch("modeOfDisposal")) && (
            <Input placeholder="Specify other disposal mode" {...register("disposalInfo")} />
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black">E. Insurance Information</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <input type="checkbox" {...register("isInsured")} />
            Insured
          </label>
          <SelectField
            label="Policy Type"
            value={watch("policyType")}
            onChange={(v) => setValue("policyType", v)}
            options={policyTypes}
          />
          {isOthers(watch("policyType")) && (
            <Input placeholder="Specify other policy type" {...register("policyTypeOther")} />
          )}
          <Input placeholder="Insurer Name" {...register("insurerName")} />
          <Input placeholder="Policy Number" {...register("policyNumber")} />
          <Input placeholder="Insured Name" {...register("insuredName")} />
          <Input placeholder="Issuing Branch" {...register("issuingBranch")} />
          <Input placeholder="Total Coverage Amount" {...register("totalCoverageAmount")} />
          <Input placeholder="Total Premium Amount" {...register("totalPremiumAmount")} />
          <label className="grid gap-1">
            <FieldLabel>Period From</FieldLabel>
            <Input type="date" {...register("periodFrom")} />
          </label>
          <label className="grid gap-1">
            <FieldLabel>Period To</FieldLabel>
            <Input type="date" {...register("periodTo")} />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black">F. Technical Specification Information</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <SelectField
            label="Asset Condition"
            value={watch("assetCondition")}
            onChange={(v) => setValue("assetCondition", v)}
            options={conditions}
          />
          <SelectField
            label="Structure Material"
            value={watch("structureMaterial")}
            onChange={(v) => setValue("structureMaterial", v)}
            options={materials}
          />
          {isOthers(watch("structureMaterial")) && (
            <Input placeholder="Specify other structure material" {...register("structureMaterialOther")} />
          )}
          <SelectField
            label="Flood Defences"
            value={watch("floodDefence")}
            onChange={(v) => setValue("floodDefence", v)}
            options={floodDefences}
          />
          {isOthers(watch("floodDefence")) && (
            <Input placeholder="Specify other flood defence" {...register("floodDefenceOther")} />
          )}
          <SelectField
            label="Land Classification"
            value={watch("landClassification")}
            onChange={(v) => setValue("landClassification", v)}
            options={landClasses}
          />
          {isOthers(watch("landClassification")) && (
            <Input placeholder="Specify other land classification" {...register("landClassificationOther")} />
          )}
          <SelectField
            label="Security Type"
            value={watch("securityType")}
            onChange={(v) => setValue("securityType", v)}
            options={securityTypes}
          />
          {isOthers(watch("securityType")) && (
            <Input placeholder="Specify other security type" {...register("securityTypeOther")} />
          )}
          <Input placeholder="Floor / Lot Area in sq.m." {...register("floorLotAreaSqm")} />
          <Input placeholder="Annual Average Occupants" {...register("annualAverageOccupants")} />
          <Input placeholder="No. of Fire Extinguishers" {...register("numberOfFireExtinguishers")} />
          <Input placeholder="No. of Sprinklers" {...register("numberOfSprinklers")} />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black">G. Remarks</h2>
        <textarea
          {...register("remarks")}
          className="mt-4 min-h-32 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
        />
      </section>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save NARS Record"}
        </Button>
      </div>
    </form>
  );
}

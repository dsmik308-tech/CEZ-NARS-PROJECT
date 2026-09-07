export const ORG_CODE = "350460000000";
export const AGENCY_NAME = "Philippine Economic Zone Authority";
export const AGENCY_SHORT = "PEZA";

export const PROPERTY_KINDS = [
  { value: "LAND", label: "Land" },
  { value: "BUILDING", label: "Building" },
  { value: "SPECIALIZED", label: "Specialized Asset" },
] as const;

export const NARS_SECTIONS = [
  { id: "A", title: "General Information" },
  { id: "B", title: "Location Information" },
  { id: "C", title: "Legal Information" },
  { id: "D", title: "Financial Information" },
  { id: "E", title: "Insurance Information" },
  { id: "F", title: "Technical Specification Information" },
  { id: "G", title: "Remarks" },
] as const;

export const MONEY_FIELDS = [
  "acquisitionCost",
  "netBookValue",
  "soundMarketValueAmount",
  "accumulatedDepreciation",
  "assessedValueAmount",
  "appraisedValueAmount",
  "improvementValueAmount",
  "replacementValueAmount",
] as const;

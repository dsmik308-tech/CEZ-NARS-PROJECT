export type AuthUser = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  office: string | null;
  lastLoginAt: string | Date | null;
};

export type PropertyKind = "LAND" | "BUILDING" | "SPECIALIZED";
export type GisGeometryType = "POINT" | "POLYGON" | "RECTANGLE";

export type Region = {
  id: string;
  code: string;
  name: string;
};

export type Province = {
  id: string;
  code: string;
  name: string;
  regionId: string;
};

export type MasterOption = {
  id: string;
  category: string;
  code?: string | null;
  label: string;
  active?: boolean;
  sortOrder?: number;
};

export type PropertyRecord = {
  id: string;
  organizationCode: string;
  propertyKind: PropertyKind;
  assetType: string;
  accountCode?: string | null;
  assetName: string;
  assetDescription?: string | null;
  regionId?: string | null;
  provinceId?: string | null;
  region?: Region | null;
  province?: Province | null;
  cityMunicipality?: string | null;
  barangay?: string | null;
  streetName?: string | null;
  subdivisionPurok?: string | null;
  houseLotBlockNo?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  gisGeometryType?: GisGeometryType;
  cezPhase?: string | null;
  cezBlock?: string | null;
  cezLot?: string | null;
  owner?: string | null;
  tctTdNumber?: string | null;
  modeOfAcquisitionConveyance?: string | null;
  dateOfAcquisition?: string | null;
  currency?: string | null;
  acquisitionCost?: number | null;
  accumulatedDepreciation?: number | null;
  netBookValue?: number | null;
  soundMarketValueAmount?: number | null;
  improvementValueAmount?: number | null;
  appraisedValueAmount?: number | null;
  assessedValueAmount?: number | null;
  replacementValueAmount?: number | null;
  isInsured?: boolean | null;
  policyType?: string | null;
  insurerName?: string | null;
  policyNumber?: string | null;
  assetCondition?: string | null;
  structureMaterial?: string | null;
  floodDefence?: string | null;
  floorLotAreaSqm?: number | null;
  landClassification?: string | null;
  securityType?: string | null;
  remarks?: string | null;
  createdAt: string;
  updatedAt: string;
};

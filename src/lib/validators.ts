import { z } from "zod";

const emptyToNull = (value: unknown) => {
  if (value === "" || value === undefined) return null;
  return value;
};

const optionalText = z.preprocess(emptyToNull, z.string().nullable().optional());

const optionalNumber = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) return null;
  return value;
}, z.coerce.number().nullable().optional());

const optionalInt = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) return null;
  return value;
}, z.coerce.number().int().nullable().optional());

const optionalDate = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) return null;
  return value;
}, z.coerce.date().nullable().optional());

const optionalBool = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) return null;
  if (value === "true" || value === "on" || value === true || value === 1 || value === "1") {
    return true;
  }
  if (value === "false" || value === false || value === 0 || value === "0") {
    return false;
  }
  return value;
}, z.boolean().nullable().optional());

export const propertySchema = z.object({
  organizationCode: z.string().min(1).default("350460000000"),
  propertyKind: z.enum(["LAND", "BUILDING", "SPECIALIZED"]),

  assetType: z.string().min(1, "Asset type is required."),
  accountCode: optionalText,

  assetName: z.string().min(1, "Asset name is required."),
  assetDescription: optionalText,

  regionId: optionalText,
  provinceId: optionalText,

  cityMunicipality: optionalText,
  barangay: optionalText,
  streetName: optionalText,
  subdivisionPurok: optionalText,
  houseLotBlockNo: optionalText,

  latitude: optionalNumber,
  longitude: optionalNumber,

  gisGeometryType: z.enum(["POINT", "POLYGON", "RECTANGLE"]).default("POINT"),
  gisGeometry: z.any().optional().nullable(),
  cezPhase: optionalText,
  cezBlock: optionalText,
  cezLot: optionalText,

  owner: optionalText,
  withImpediments: optionalBool,
  impedimentDetails: optionalText,
  modeOfAcquisitionConveyance: optionalText,
  acquisitionConveyanceInfo: optionalText,
  dateOfAcquisition: optionalDate,
  donorSellerTransferor: optionalText,
  doneeBuyerTransferee: optionalText,
  structureLandOwnedByAgency: optionalBool,
  landTctTdAvailable: optionalBool,
  tctTdNumber: optionalText,

  currency: optionalText,
  acquisitionCost: optionalNumber,
  accumulatedDepreciation: optionalNumber,
  netBookValue: optionalNumber,
  assetLifeYears: optionalInt,
  numberOfYearsUsed: optionalInt,
  soundMarketValueCurrency: optionalText,
  soundMarketValueAmount: optionalNumber,
  dateOfValuation: optionalDate,
  improvementValueCurrency: optionalText,
  improvementValueAmount: optionalNumber,
  latestImprovementDate: optionalDate,
  appraisedValueCurrency: optionalText,
  appraisedValueAmount: optionalNumber,
  dateOfAppraisal: optionalDate,
  assessedValueCurrency: optionalText,
  assessedValueAmount: optionalNumber,
  dateOfAssessment: optionalDate,
  replacementValueCurrency: optionalText,
  replacementValueAmount: optionalNumber,
  modeOfDisposal: optionalText,
  disposalInfo: optionalText,
  dateOfDisposal: optionalDate,
  disposalValue: optionalNumber,

  isInsured: optionalBool,
  policyType: optionalText,
  policyTypeOther: optionalText,
  totalCoverageCurrency: optionalText,
  totalCoverageAmount: optionalNumber,
  totalPremiumCurrency: optionalText,
  totalPremiumAmount: optionalNumber,
  periodFrom: optionalDate,
  periodTo: optionalDate,
  insurerName: optionalText,
  issuingBranch: optionalText,
  insuredName: optionalText,
  policyNumber: optionalText,
  nonInsurableCurrency: optionalText,
  nonInsurableValue: optionalNumber,

  assetCondition: optionalText,
  agencyAssetClassification: optionalText,
  annualAverageOccupants: optionalInt,
  structureMaterial: optionalText,
  structureMaterialOther: optionalText,
  numberOfFireExtinguishers: optionalInt,
  numberOfSprinklers: optionalInt,
  numberOfFireHose: optionalInt,
  floodDefence: optionalText,
  floodDefenceOther: optionalText,
  floorLotAreaSqm: optionalNumber,
  landClassification: optionalText,
  landClassificationOther: optionalText,
  securityType: optionalText,
  securityTypeOther: optionalText,

  remarks: optionalText,
});

export const propertyPatchSchema = propertySchema.partial();

export type PropertyInput = z.infer<typeof propertySchema>;

export const MASTER_CATEGORIES = [
  "ORGANIZATIONAL_CODE",
  "ASSET_TYPE",
  "ACCOUNT_CODE",
  "MODE_OF_ACQUISITION_CONVEYANCE",
  "CURRENCY",
  "MODE_OF_DISPOSAL",
  "POLICY_TYPE",
  "ASSET_CONDITION",
  "STRUCTURE_MATERIAL",
  "FLOOD_DEFENCES",
  "LAND_CLASSIFICATION",
  "SECURITY_TYPE",
] as const;

export type MasterCategory = (typeof MASTER_CATEGORIES)[number];

export function parseMetadata(value?: string | null): Record<string, string> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") return parsed as Record<string, string>;
  } catch {
    return {};
  }
  return {};
}

export function isOthers(value?: string | null) {
  const normalized = (value || "").trim().toUpperCase();
  return normalized === "OTHERS" || normalized.startsWith("OTHERS ") || normalized.startsWith("OTHERS—") || normalized.startsWith("OTHERS -");
}

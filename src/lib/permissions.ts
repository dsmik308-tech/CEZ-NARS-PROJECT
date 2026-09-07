export const ROLES = ["ADMIN", "ENCODER", "REVIEWER", "APPROVER", "AUDITOR"] as const;

export type Role = (typeof ROLES)[number];

export type Permission =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "manageUsers"
  | "manageMaster"
  | "viewAudit";

export const ROLE_META: Record<
  Role,
  { label: string; description: string; tone: "blue" | "gold" | "red" | "slate" | "green" }
> = {
  ADMIN: {
    label: "System Administrator",
    description: "Full control of records, users, and audit logs",
    tone: "red",
  },
  ENCODER: {
    label: "Asset Encoder",
    description: "Create and update GIS-linked NARS records",
    tone: "blue",
  },
  REVIEWER: {
    label: "Reviewer",
    description: "Inspect registry records without changing them",
    tone: "slate",
  },
  APPROVER: {
    label: "Approver",
    description: "Review and endorse NARS submissions",
    tone: "gold",
  },
  AUDITOR: {
    label: "Auditor",
    description: "Read-only access including the activity log",
    tone: "green",
  },
};

const MATRIX: Record<Role, Permission[]> = {
  ADMIN: ["view", "create", "edit", "delete", "manageUsers", "manageMaster", "viewAudit"],
  ENCODER: ["view", "create", "edit"],
  REVIEWER: ["view"],
  APPROVER: ["view"],
  AUDITOR: ["view", "viewAudit"],
};

export function isRole(value: string | null | undefined): value is Role {
  return !!value && (ROLES as readonly string[]).includes(value);
}

export function can(role: string | null | undefined, permission: Permission) {
  if (!isRole(role)) return false;
  return MATRIX[role].includes(permission);
}

export function roleLabel(role: string | null | undefined) {
  if (!isRole(role)) return role || "Unknown";
  return ROLE_META[role].label;
}

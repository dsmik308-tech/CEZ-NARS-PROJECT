import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function peso(value?: number | null) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export function formatDateTime(value?: string | Date | null) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(value?: string | Date | null) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function emptyToNull<T extends Record<string, unknown>>(data: T): T {
  const next = { ...data };
  for (const key of Object.keys(next) as (keyof T)[]) {
    const value = next[key];
    if (value === "" || value === undefined) {
      next[key] = null as T[keyof T];
    }
  }
  return next;
}

export function kindLabel(kind?: string | null) {
  if (kind === "LAND") return "Land";
  if (kind === "BUILDING") return "Building";
  if (kind === "SPECIALIZED") return "Specialized Asset";
  return kind || "Asset";
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CURRENCY } from "@/utils/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a monetary amount using the currency configured for the deployment. */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

/** Compact form for dashboard tiles, e.g. `₦1.2M`. */
export function formatCompactCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: CURRENCY,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount || 0);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-NG").format(value || 0);
}

/** Turns `CHECKED_IN` into `Checked in` for enum values without an explicit label. */
export function humanizeEnum(value: string): string {
  const lower = value.toLowerCase().replace(/_/g, " ");
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

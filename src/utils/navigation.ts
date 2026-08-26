import type { LinkProps } from "@tanstack/react-router";
import {
  BedDoubleIcon,
  BuildingIcon,
  CalendarCheckIcon,
  ChartColumnIcon,
  ConciergeBellIcon,
  LayoutDashboardIcon,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "./types/Auth.type";

export type NavItem = {
  label: string;
  description: string;
  to: LinkProps["to"];
  icon: LucideIcon;
  /** Omit to show the item to every signed-in role. */
  roles?: UserRole[];
};

/**
 * Dashboard navigation, mirroring the authorisation the API enforces:
 * `/reservations` and the check-in/out transitions are staff-only, and
 * `/reports` plus room management are Admin-only.
 */
export const DASHBOARD_NAV: NavItem[] = [
  {
    label: "Overview",
    description: "Occupancy and activity at a glance",
    to: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    label: "Room catalogue",
    description: "Browse and reserve rooms and bedspaces",
    to: "/dashboard/rooms",
    icon: BedDoubleIcon,
  },
  {
    label: "My reservations",
    description: "Your stays and their status",
    to: "/dashboard/reservations",
    icon: CalendarCheckIcon,
    roles: ["GUEST", "STUDENT"],
  },
  {
    label: "Front desk",
    description: "Check guests in and out",
    to: "/dashboard/front-desk",
    icon: ConciergeBellIcon,
    roles: ["RECEPTIONIST", "ADMIN"],
  },
  {
    label: "Manage rooms",
    description: "Create, price and retire rooms",
    to: "/dashboard/manage-rooms",
    icon: BuildingIcon,
    roles: ["ADMIN"],
  },
  {
    label: "Reports",
    description: "Period analytics and revenue",
    to: "/dashboard/reports",
    icon: ChartColumnIcon,
    roles: ["ADMIN"],
  },
];

export function navItemsForRole(role: UserRole | null): NavItem[] {
  if (!role) return [];
  return DASHBOARD_NAV.filter((item) => !item.roles || item.roles.includes(role));
}

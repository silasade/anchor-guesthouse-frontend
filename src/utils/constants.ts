import type { ReservationStatus } from "./types/Reservation.type";
import type { RoomCategory, RoomStatus, RoomType } from "./types/Room.type";
import type { UserRole } from "./types/Auth.type";

export const APP_NAME = import.meta.env.VITE_APP_NAME || "StayHub";
export const CURRENCY = import.meta.env.VITE_APP_CURRENCY || "NGN";

/** Name of the cookie holding the JWT issued by `/auth/login`. */
export const AUTH_TOKEN_KEY = "stayhub_token";

/** The API issues tokens with `expiresIn: "7d"`. */
export const AUTH_TOKEN_TTL_DAYS = 7;

/** The daily checkout cutoff enforced by the reservation service. */
export const CHECKOUT_CUTOFF_HOUR = 12;
export const CHECKOUT_CUTOFF_LABEL = "12:00 PM (Noon)";

export const ROLE_LABELS: Record<UserRole, string> = {
  GUEST: "Guest",
  STUDENT: "Student",
  RECEPTIONIST: "Receptionist",
  ADMIN: "Administrator",
};

export const ROOM_CATEGORY_LABELS: Record<RoomCategory, string> = {
  GUEST: "Guest House",
  STUDENT: "Student Hostel",
};

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  SINGLE: "Single Room",
  DOUBLE: "Double Bedspace",
  TRIPLE: "Triple Bedspace",
};

export const ROOM_TYPE_BEDSPACES: Record<RoomType, number> = {
  SINGLE: 1,
  DOUBLE: 2,
  TRIPLE: 3,
};

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  OCCUPIED: "Occupied",
  MAINTENANCE: "Maintenance",
};

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  RESERVED: "Reserved",
  CHECKED_IN: "Checked in",
  CHECKED_OUT: "Checked out",
  CANCELLED: "Cancelled",
};

/**
 * The reservation service refuses cross-category bookings: only `GUEST` users
 * may take `SINGLE` guest rooms and only `STUDENT` users may take `DOUBLE` /
 * `TRIPLE` bedspaces. Staff roles hold no booking rights of their own.
 */
export const ROLE_BOOKABLE_CATEGORY: Partial<Record<UserRole, RoomCategory>> = {
  GUEST: "GUEST",
  STUDENT: "STUDENT",
};

export const STAFF_ROLES: UserRole[] = ["RECEPTIONIST", "ADMIN"];

import type { User } from "./types/Auth.type";
import type { Reservation } from "./types/Reservation.type";
import type { Room } from "./types/Room.type";

/**
 * List endpoints populate `room` and `user`; write endpoints return bare
 * ObjectId strings. These guards let a single component render either shape.
 */

export function getReservationRoom(reservation: Reservation): Room | null {
  return typeof reservation.room === "object" ? reservation.room : null;
}

export function getReservationUser(reservation: Reservation): User | null {
  return typeof reservation.user === "object" ? reservation.user : null;
}

export function getRoomNumber(reservation: Reservation): string {
  return getReservationRoom(reservation)?.roomNumber ?? "Unknown room";
}

export function getGuestName(reservation: Reservation): string {
  return getReservationUser(reservation)?.name ?? "Unknown guest";
}

/** A stay the front desk can still act on. */
export function isActiveReservation(reservation: Reservation): boolean {
  return (
    reservation.status === "RESERVED" || reservation.status === "CHECKED_IN"
  );
}

/** Owners may cancel their own stay only before it is checked out. */
export function canCancelReservation(reservation: Reservation): boolean {
  return isActiveReservation(reservation);
}

/** Free-text match across the fields the API has no query parameter for. */
export function matchesReservationSearch(
  reservation: Reservation,
  term: string,
): boolean {
  if (!term.trim()) return true;
  const needle = term.trim().toLowerCase();
  const room = getReservationRoom(reservation);
  const user = getReservationUser(reservation);

  return [
    room?.roomNumber,
    user?.name,
    user?.email,
    user?.studentId,
    reservation.notes,
  ]
    .filter(Boolean)
    .some((field) => String(field).toLowerCase().includes(needle));
}

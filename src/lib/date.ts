import dayjs from "dayjs";
import { CHECKOUT_CUTOFF_HOUR } from "@/utils/constants";

/**
 * Snaps a date to the 12:00 PM checkout boundary the API works in. Sending
 * noon-aligned timestamps keeps the client-side night estimate identical to the
 * `Math.ceil` the reservation service performs.
 */
export function toCheckoutCutoff(date: string | Date): Date {
  return dayjs(date).hour(CHECKOUT_CUTOFF_HOUR).minute(0).second(0).millisecond(0).toDate();
}

/** Serialises a `<input type="date">` value into the ISO string the API expects. */
export function toCutoffISOString(date: string | Date): string {
  return toCheckoutCutoff(date).toISOString();
}

/** Mirrors `ReservationService.calculateNights` — whole days, never below one. */
export function calculateNights(
  checkInDate: string | Date,
  checkOutDate: string | Date,
): number {
  const start = toCheckoutCutoff(checkInDate);
  const end = toCheckoutCutoff(checkOutDate);
  const nights = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  return nights > 0 ? nights : 1;
}

export function formatDate(date?: string | Date | null): string {
  if (!date) return "—";
  return dayjs(date).format("DD MMM YYYY");
}

export function formatDateTime(date?: string | Date | null): string {
  if (!date) return "—";
  return dayjs(date).format("DD MMM YYYY, h:mm A");
}

/** `<input type="date">` needs a bare `YYYY-MM-DD`. */
export function toDateInputValue(date: string | Date): string {
  return dayjs(date).format("YYYY-MM-DD");
}

export function todayInputValue(): string {
  return toDateInputValue(new Date());
}

export function addDaysInputValue(days: number, from: string | Date = new Date()): string {
  return toDateInputValue(dayjs(from).add(days, "day").toDate());
}

/** True while the stay has not yet passed today's noon cutoff. */
export function isBeforeCutoffToday(date: string | Date): boolean {
  return dayjs(date).isAfter(toCheckoutCutoff(new Date()));
}

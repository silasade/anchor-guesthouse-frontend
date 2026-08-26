import type { User } from "./Auth.type";
import type { Room, RoomCategory } from "./Room.type";
import type { Timestamped } from "./common";

export const RESERVATION_STATUSES = [
  "RESERVED",
  "CHECKED_IN",
  "CHECKED_OUT",
  "CANCELLED",
] as const;

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

/**
 * `room` and `user` arrive as raw ObjectId strings from the write endpoints and
 * as populated documents from the list endpoints, so both shapes are modelled.
 */
export type Reservation = Timestamped & {
  room: Room | string;
  user: User | string;
  userCategory: RoomCategory;
  checkInDate: string;
  checkOutDate: string;
  totalNights: number;
  totalCost: number;
  status: ReservationStatus;
  reservedAt: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  notes?: string;
};

export type ReservationListResponse = {
  reservations: Reservation[];
};

export type ReservationResponse = {
  reservation: Reservation;
};

export type CreateReservationPayload = {
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  notes?: string;
  /** Admin / Receptionist only — books on behalf of another user. */
  targetUserId?: string;
};

export type ReservationFilters = {
  status?: ReservationStatus | "ALL";
  userCategory?: RoomCategory | "ALL";
  roomId?: string;
  search?: string;
};

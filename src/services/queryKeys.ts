import type { ReportQuery } from "@/utils/types/Report.type";
import type { ReservationFilters } from "@/utils/types/Reservation.type";
import type { RoomFilters } from "@/utils/types/Room.type";

/**
 * Single source of truth for cache keys so mutations can invalidate precisely
 * instead of guessing at string literals.
 */
export const queryKeys = {
  session: ["session"] as const,

  rooms: {
    all: ["rooms"] as const,
    list: (filters?: RoomFilters) => ["rooms", "list", filters ?? {}] as const,
    detail: (roomId: string) => ["rooms", "detail", roomId] as const,
  },

  reservations: {
    all: ["reservations"] as const,
    mine: ["reservations", "mine"] as const,
    list: (filters?: ReservationFilters) =>
      ["reservations", "list", filters ?? {}] as const,
  },

  reports: {
    all: ["reports"] as const,
    detail: (query?: ReportQuery) => ["reports", "detail", query ?? {}] as const,
  },
} as const;

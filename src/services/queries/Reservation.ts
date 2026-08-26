import { useQuery } from "@tanstack/react-query";
import { requests } from "../api";
import { queryKeys } from "../queryKeys";
import type {
  ReservationFilters,
  ReservationListResponse,
} from "@/utils/types/Reservation.type";

/** Reservation history for the signed-in user, newest first. */
export const useGetMyReservations = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.reservations.mine,
    queryFn: () =>
      requests<ReservationListResponse>("reservations/my-reservations"),
    enabled,
    select: (response) => response.data.reservations,
  });
};

/**
 * Full reservation ledger. Restricted to `ADMIN` and `RECEPTIONIST` by the API,
 * so callers must gate `enabled` on the caller's role.
 */
export const useGetAllReservations = (
  filters: ReservationFilters = {},
  enabled = true,
) => {
  const { status, userCategory, roomId } = filters;

  return useQuery({
    queryKey: queryKeys.reservations.list({ status, userCategory, roomId }),
    queryFn: () =>
      requests<ReservationListResponse>("reservations", {
        query: { status, userCategory, roomId },
      }),
    enabled,
    select: (response) => response.data.reservations,
  });
};

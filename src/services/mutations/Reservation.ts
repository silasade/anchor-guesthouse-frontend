import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requests } from "../api";
import { queryKeys } from "../queryKeys";
import { generateToast } from "@/lib/generateToast";
import type {
  CreateReservationPayload,
  ReservationResponse,
} from "@/utils/types/Reservation.type";

/**
 * Every reservation transition mutates room availability too, so all four
 * mutations refresh rooms, reservations and reports together.
 */
function useReservationInvalidation() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.reservations.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
  };
}

const useCreateReservation = () => {
  const invalidate = useReservationInvalidation();

  return useMutation({
    mutationFn: (body: CreateReservationPayload) =>
      requests<ReservationResponse>("reservations", { method: "POST", body }),
    onSuccess: () => {
      invalidate();
      generateToast("success", "Room reserved successfully.");
    },
    onError: (error: Error) => generateToast("error", error.message),
  });
};

/** Front desk arrival — moves the stay to `CHECKED_IN` and the room to `OCCUPIED`. */
const useCheckInReservation = () => {
  const invalidate = useReservationInvalidation();

  return useMutation({
    mutationFn: (reservationId: string) =>
      requests<ReservationResponse>(`reservations/${reservationId}/check-in`, {
        method: "POST",
      }),
    onSuccess: () => {
      invalidate();
      generateToast("success", "Checked in successfully.");
    },
    onError: (error: Error) => generateToast("error", error.message),
  });
};

/** Departure at the noon cutoff — frees the room unless another stay overlaps. */
const useCheckOutReservation = () => {
  const invalidate = useReservationInvalidation();

  return useMutation({
    mutationFn: (reservationId: string) =>
      requests<ReservationResponse>(`reservations/${reservationId}/check-out`, {
        method: "POST",
      }),
    onSuccess: () => {
      invalidate();
      generateToast("success", "Checked out successfully.");
    },
    onError: (error: Error) => generateToast("error", error.message),
  });
};

/** Cancellation. Allowed for staff on any stay, and for owners on their own. */
const useUnreserveReservation = () => {
  const invalidate = useReservationInvalidation();

  return useMutation({
    mutationFn: (reservationId: string) =>
      requests<ReservationResponse>(`reservations/${reservationId}/unreserve`, {
        method: "POST",
      }),
    onSuccess: () => {
      invalidate();
      generateToast("success", "Reservation cancelled and room released.");
    },
    onError: (error: Error) => generateToast("error", error.message),
  });
};

export {
  useCheckInReservation,
  useCheckOutReservation,
  useCreateReservation,
  useUnreserveReservation,
};

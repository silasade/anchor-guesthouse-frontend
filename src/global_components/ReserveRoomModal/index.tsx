import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon, Loader2Icon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  reservationSchema,
  type ReservationSchemaType,
} from "@/global_components/-formSchemas";
import {
  addDaysInputValue,
  calculateNights,
  todayInputValue,
  toCutoffISOString,
} from "@/lib/date";
import { formatCurrency } from "@/lib/utils";
import { useCreateReservation } from "@/services/mutations/Reservation";
import { CHECKOUT_CUTOFF_LABEL, ROOM_TYPE_LABELS } from "@/utils/constants";
import type { Room } from "@/utils/types/Room.type";

type ReserveRoomModalProps = {
  room: Room | null;
  onOpenChange: (open: boolean) => void;
  onReserved?: () => void;
};

/**
 * Collects the stay dates and previews the cost using the same night maths the
 * reservation service applies, so the figure shown matches the one persisted.
 */
function ReserveRoomModal({
  room,
  onOpenChange,
  onReserved,
}: ReserveRoomModalProps) {
  const { mutateAsync: createReservation, isPending } = useCreateReservation();

  const form = useForm<ReservationSchemaType>({
    resolver: zodResolver(reservationSchema),
    mode: "onChange",
    defaultValues: {
      checkInDate: todayInputValue(),
      checkOutDate: addDaysInputValue(1),
      notes: "",
    },
  });

  const { reset, register, handleSubmit, watch, formState } = form;

  useEffect(() => {
    if (room) {
      reset({
        checkInDate: todayInputValue(),
        checkOutDate: addDaysInputValue(1),
        notes: "",
      });
    }
  }, [room, reset]);

  const checkInDate = watch("checkInDate");
  const checkOutDate = watch("checkOutDate");

  const estimate = useMemo(() => {
    if (!room || !checkInDate || !checkOutDate) return null;
    if (new Date(checkOutDate) <= new Date(checkInDate)) return null;
    const nights = calculateNights(checkInDate, checkOutDate);
    return { nights, total: nights * room.costPerNight };
  }, [room, checkInDate, checkOutDate]);

  const onSubmit = async (values: ReservationSchemaType) => {
    if (!room) return;
    try {
      await createReservation({
        roomId: room._id,
        checkInDate: toCutoffISOString(values.checkInDate),
        checkOutDate: toCutoffISOString(values.checkOutDate),
        notes: values.notes?.trim() || undefined,
      });
      onOpenChange(false);
      onReserved?.();
    } catch {
      // The mutation surfaces the API message through a toast.
    }
  };

  return (
    <Dialog open={!!room} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reserve {room?.roomNumber}</DialogTitle>
          <DialogDescription>
            {room ? ROOM_TYPE_LABELS[room.roomType] : ""} ·{" "}
            {room ? formatCurrency(room.costPerNight) : ""} per night
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="checkInDate">Check-in</Label>
              <Input
                id="checkInDate"
                type="date"
                min={todayInputValue()}
                aria-invalid={!!formState.errors.checkInDate}
                {...register("checkInDate")}
              />
              {formState.errors.checkInDate && (
                <p className="text-destructive text-xs">
                  {formState.errors.checkInDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOutDate">Check-out</Label>
              <Input
                id="checkOutDate"
                type="date"
                min={checkInDate || todayInputValue()}
                aria-invalid={!!formState.errors.checkOutDate}
                {...register("checkOutDate")}
              />
              {formState.errors.checkOutDate && (
                <p className="text-destructive text-xs">
                  {formState.errors.checkOutDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Arrival time, accessibility needs, roommate preference…"
              {...register("notes")}
            />
          </div>

          <Alert variant="info">
            <InfoIcon />
            <AlertDescription>
              <p>
                Stays run on a {CHECKOUT_CUTOFF_LABEL} cycle. Payment is
                collected in person at the front desk on arrival.
              </p>
            </AlertDescription>
          </Alert>

          {estimate && (
            <div className="bg-muted flex items-center justify-between rounded-lg px-4 py-3">
              <span className="text-muted-foreground text-sm">
                {estimate.nights} night{estimate.nights > 1 ? "s" : ""}
              </span>
              <span className="text-lg font-semibold">
                {formatCurrency(estimate.total)}
              </span>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !formState.isValid}>
              {isPending && <Loader2Icon className="animate-spin" />}
              Confirm reservation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ReserveRoomModal;

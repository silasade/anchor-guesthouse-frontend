import { CalendarIcon, LogInIcon, LogOutIcon, MoonIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CategoryBadge,
  ReservationStatusBadge,
} from "@/global_components/StatusBadge";
import { formatDate, formatDateTime } from "@/lib/date";
import { formatCurrency } from "@/lib/utils";
import { ROOM_TYPE_LABELS } from "@/utils/constants";
import {
  canCancelReservation,
  getReservationRoom,
} from "@/utils/reservation";
import type { Reservation } from "@/utils/types/Reservation.type";

type ReservationCardProps = {
  reservation: Reservation;
  onCancel?: (reservation: Reservation) => void;
};

function ReservationCard({ reservation, onCancel }: ReservationCardProps) {
  const room = getReservationRoom(reservation);

  return (
    <Card className="gap-4 py-5">
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-lg font-semibold tracking-tight">
              {room?.roomNumber ?? "Room"}
            </p>
            <p className="text-muted-foreground text-xs">
              {room ? ROOM_TYPE_LABELS[room.roomType] : "Room details pending"}
            </p>
          </div>
          <ReservationStatusBadge status={reservation.status} />
        </div>
        <CategoryBadge category={reservation.userCategory} className="w-fit" />
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-0.5">
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <CalendarIcon className="size-3.5" />
              Check-in
            </p>
            <p className="text-sm font-medium">
              {formatDate(reservation.checkInDate)}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <CalendarIcon className="size-3.5" />
              Check-out
            </p>
            <p className="text-sm font-medium">
              {formatDate(reservation.checkOutDate)}
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <MoonIcon className="size-3.5" />
            {reservation.totalNights} night
            {reservation.totalNights > 1 ? "s" : ""}
          </span>
          <span className="text-lg font-semibold">
            {formatCurrency(reservation.totalCost)}
          </span>
        </div>

        {(reservation.checkedInAt || reservation.checkedOutAt) && (
          <div className="text-muted-foreground space-y-1 text-xs">
            {reservation.checkedInAt && (
              <p className="flex items-center gap-1.5">
                <LogInIcon className="size-3.5" />
                Checked in {formatDateTime(reservation.checkedInAt)}
              </p>
            )}
            {reservation.checkedOutAt && (
              <p className="flex items-center gap-1.5">
                <LogOutIcon className="size-3.5" />
                Checked out {formatDateTime(reservation.checkedOutAt)}
              </p>
            )}
          </div>
        )}

        {reservation.notes && (
          <p className="bg-muted text-muted-foreground rounded-md px-3 py-2 text-xs">
            {reservation.notes}
          </p>
        )}
      </CardContent>

      {onCancel && canCancelReservation(reservation) && (
        <CardFooter>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onCancel(reservation)}
          >
            Cancel reservation
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default ReservationCard;

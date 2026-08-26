import { LogInIcon, LogOutIcon, XCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CategoryBadge,
  ReservationStatusBadge,
} from "@/global_components/StatusBadge";
import { formatDate } from "@/lib/date";
import { formatCurrency } from "@/lib/utils";
import {
  getReservationRoom,
  getReservationUser,
} from "@/utils/reservation";
import type { Reservation } from "@/utils/types/Reservation.type";

export type LedgerAction = "check-in" | "check-out" | "unreserve";

type ReservationLedgerProps = {
  reservations: Reservation[];
  onAction: (action: LedgerAction, reservation: Reservation) => void;
};

/**
 * The front-desk table. Which buttons appear follows the reservation service's
 * own guards: check-in only from `RESERVED`, check-out only from `CHECKED_IN`,
 * and cancellation only while the stay is still open.
 */
function ReservationLedger({
  reservations,
  onAction,
}: ReservationLedgerProps) {
  return (
    <div className="border-border overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Guest / Student</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Stay</TableHead>
            <TableHead>Nights</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => {
            const room = getReservationRoom(reservation);
            const user = getReservationUser(reservation);
            const canCheckIn = reservation.status === "RESERVED";
            const canCheckOut = reservation.status === "CHECKED_IN";
            const canCancel = canCheckIn || canCheckOut;

            return (
              <TableRow key={reservation._id}>
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="font-medium">{user?.name ?? "Unknown"}</p>
                    <p className="text-muted-foreground text-xs">
                      {user?.studentId ?? user?.email ?? "—"}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {room?.roomNumber ?? "—"}
                </TableCell>
                <TableCell>
                  <CategoryBadge category={reservation.userCategory} />
                </TableCell>
                <TableCell>
                  <div className="text-xs">
                    <p>{formatDate(reservation.checkInDate)}</p>
                    <p className="text-muted-foreground">
                      to {formatDate(reservation.checkOutDate)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{reservation.totalNights}</TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(reservation.totalCost)}
                </TableCell>
                <TableCell>
                  <ReservationStatusBadge status={reservation.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1.5">
                    {canCheckIn && (
                      <Button
                        size="sm"
                        onClick={() => onAction("check-in", reservation)}
                      >
                        <LogInIcon />
                        Check in
                      </Button>
                    )}
                    {canCheckOut && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onAction("check-out", reservation)}
                      >
                        <LogOutIcon />
                        Check out
                      </Button>
                    )}
                    {canCancel && (
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Cancel reservation"
                        onClick={() => onAction("unreserve", reservation)}
                      >
                        <XCircleIcon />
                      </Button>
                    )}
                    {!canCancel && (
                      <span className="text-muted-foreground text-xs">
                        No actions
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default ReservationLedger;

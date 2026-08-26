import { BedSingleIcon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CategoryBadge, RoomStatusBadge } from "@/global_components/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { ROOM_TYPE_LABELS } from "@/utils/constants";
import type { Room } from "@/utils/types/Room.type";

type RoomCardProps = {
  room: Room;
  /** Omit to render the card read-only (e.g. for staff who cannot book). */
  onReserve?: (room: Room) => void;
  /** Explains why booking is unavailable, shown in place of the button. */
  disabledReason?: string;
  actions?: React.ReactNode;
};

function RoomCard({ room, onReserve, disabledReason, actions }: RoomCardProps) {
  const isBookable = room.isAvailable && room.status === "AVAILABLE";

  return (
    <Card className="gap-4 py-5 transition-shadow hover:shadow-md">
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-lg font-semibold tracking-tight">
              {room.roomNumber}
            </p>
            <p className="text-muted-foreground text-xs">
              {ROOM_TYPE_LABELS[room.roomType]}
            </p>
          </div>
          <RoomStatusBadge status={room.status} />
        </div>
        <CategoryBadge category={room.category} className="w-fit" />
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="text-muted-foreground flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            {room.totalBedspaces > 1 ? (
              <UsersIcon className="size-3.5" />
            ) : (
              <BedSingleIcon className="size-3.5" />
            )}
            {room.totalBedspaces} bedspace
            {room.totalBedspaces > 1 ? "s" : ""}
          </span>
        </div>
        <p className="text-xl font-semibold tracking-tight">
          {formatCurrency(room.costPerNight)}
          <span className="text-muted-foreground ml-1 text-xs font-normal">
            / night
          </span>
        </p>
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-2">
        {actions}
        {onReserve &&
          (disabledReason ? (
            <p className="text-muted-foreground text-xs">{disabledReason}</p>
          ) : (
            <Button
              className="w-full"
              disabled={!isBookable}
              onClick={() => onReserve(room)}
            >
              {isBookable ? "Reserve room" : "Not available"}
            </Button>
          ))}
      </CardFooter>
    </Card>
  );
}

export default RoomCard;

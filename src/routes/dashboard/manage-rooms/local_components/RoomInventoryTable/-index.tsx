import { PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryBadge, RoomStatusBadge } from "@/global_components/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { ROOM_TYPE_LABELS } from "@/utils/constants";
import type { Room } from "@/utils/types/Room.type";

type RoomInventoryTableProps = {
  rooms: Room[];
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
};

function RoomInventoryTable({
  rooms,
  onEdit,
  onDelete,
}: RoomInventoryTableProps) {
  return (
    <div className="border-border overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Room</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Bedspaces</TableHead>
            <TableHead>Cost / night</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((room) => (
            <TableRow key={room._id}>
              <TableCell className="font-medium">{room.roomNumber}</TableCell>
              <TableCell>
                <CategoryBadge category={room.category} />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {ROOM_TYPE_LABELS[room.roomType]}
              </TableCell>
              <TableCell>{room.totalBedspaces}</TableCell>
              <TableCell className="font-medium">
                {formatCurrency(room.costPerNight)}
              </TableCell>
              <TableCell>
                <RoomStatusBadge status={room.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Edit ${room.roomNumber}`}
                    onClick={() => onEdit(room)}
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Delete ${room.roomNumber}`}
                    onClick={() => onDelete(room)}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default RoomInventoryTable;

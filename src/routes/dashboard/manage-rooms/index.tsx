import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BuildingIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmationModal from "@/global_components/ConfirmationModal";
import EmptyState from "@/global_components/EmptyState";
import PageHeader from "@/global_components/PageHeader";
import ProtectedRoute from "@/global_components/ProtectedRoute";
import SearchInput from "@/global_components/SearchInput";
import StatCard from "@/global_components/StatCard";
import TablePagination from "@/global_components/TablePagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatCurrency } from "@/lib/utils";
import { useDeleteRoom } from "@/services/mutations/Room";
import { useGetRooms } from "@/services/queries/Room";
import {
  ROOM_CATEGORY_LABELS,
  ROOM_STATUS_LABELS,
} from "@/utils/constants";
import {
  ROOM_CATEGORIES,
  ROOM_STATUSES,
  type Room,
  type RoomCategory,
  type RoomStatus,
} from "@/utils/types/Room.type";
import EditRoomModal from "./local_components/EditRoomModal/-index";
import RoomFormModal from "./local_components/RoomFormModal/-index";
import RoomInventoryTable from "./local_components/RoomInventoryTable/-index";

export const Route = createFileRoute("/dashboard/manage-rooms/")({
  component: ManageRoomsRoute,
});

const PAGE_SIZE = 12;

function ManageRoomsRoute() {
  return (
    <ProtectedRoute roles={["ADMIN"]}>
      <ManageRooms />
    </ProtectedRoute>
  );
}

function ManageRooms() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<RoomCategory | "ALL">("ALL");
  const [status, setStatus] = useState<RoomStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  const debouncedSearch = useDebouncedValue(search);

  const { data: rooms = [], isLoading } = useGetRooms({ category, status });
  const { mutateAsync: deleteRoom, isPending: isDeleting } = useDeleteRoom();

  const filtered = useMemo(() => {
    const needle = debouncedSearch.trim().toLowerCase();
    if (!needle) return rooms;
    return rooms.filter((room) =>
      room.roomNumber.toLowerCase().includes(needle),
    );
  }, [rooms, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const guestRooms = rooms.filter((room) => room.category === "GUEST").length;
  const studentRooms = rooms.filter(
    (room) => room.category === "STUDENT",
  ).length;
  const totalBedspaces = rooms.reduce(
    (total, room) => total + room.totalBedspaces,
    0,
  );
  const averageRate = rooms.length
    ? Math.round(
        rooms.reduce((total, room) => total + room.costPerNight, 0) /
          rooms.length,
      )
    : 0;

  const handleDelete = async () => {
    if (!roomToDelete) return;
    try {
      await deleteRoom(roomToDelete._id);
    } finally {
      setRoomToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage rooms"
        description="Create inventory, adjust pricing and retire rooms that are out of service."
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <PlusIcon />
            Add rooms
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Guest rooms"
          value={guestRooms}
          icon={BuildingIcon}
          isLoading={isLoading}
        />
        <StatCard
          label="Student rooms"
          value={studentRooms}
          isLoading={isLoading}
        />
        <StatCard
          label="Total bedspaces"
          value={totalBedspaces}
          isLoading={isLoading}
        />
        <StatCard
          label="Average rate"
          value={formatCurrency(averageRate)}
          hint="Per night across all rooms"
          isLoading={isLoading}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search by room number…"
          className="sm:max-w-xs"
        />

        <Select
          value={category}
          onValueChange={(value) => {
            setCategory(value as RoomCategory | "ALL");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {ROOM_CATEGORIES.map((item) => (
              <SelectItem key={item} value={item}>
                {ROOM_CATEGORY_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value as RoomStatus | "ALL");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {ROOM_STATUSES.map((item) => (
              <SelectItem key={item} value={item}>
                {ROOM_STATUS_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BuildingIcon}
          title="No rooms in this view"
          description="Adjust the filters, or generate a batch of rooms to get started."
          action={
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <PlusIcon />
              Add rooms
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <RoomInventoryTable
            rooms={paginated}
            onEdit={setRoomToEdit}
            onDelete={setRoomToDelete}
          />
          <TablePagination
            page={currentPage}
            pageSize={PAGE_SIZE}
            totalItems={filtered.length}
            onPageChange={setPage}
          />
        </div>
      )}

      <RoomFormModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <EditRoomModal
        room={roomToEdit}
        onOpenChange={(open) => !open && setRoomToEdit(null)}
      />
      <ConfirmationModal
        open={!!roomToDelete}
        onOpenChange={(open) => !open && setRoomToDelete(null)}
        title={`Delete room ${roomToDelete?.roomNumber ?? ""}?`}
        description="The room is removed from the catalogue permanently. Existing reservation records keep pointing at it, so prefer setting the status to Maintenance if the room is only temporarily out of service."
        confirmLabel="Delete room"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BedDoubleIcon, InfoIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/global_components/EmptyState";
import PageHeader from "@/global_components/PageHeader";
import ReserveRoomModal from "@/global_components/ReserveRoomModal";
import RoomCard from "@/global_components/RoomCard";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSession } from "@/hooks/useSession";
import { useGetRooms } from "@/services/queries/Room";
import { ROOM_CATEGORY_LABELS } from "@/utils/constants";
import type { Room, RoomCategory, RoomStatus } from "@/utils/types/Room.type";
import RoomFilterBar from "./local_components/RoomFilterBar/-index";

export const Route = createFileRoute("/dashboard/rooms/")({
  component: RoomCatalogueRoute,
});

function RoomCatalogueRoute() {
  const { bookableCategory, isStaff } = useSession();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<RoomStatus | "ALL">("ALL");
  const [category, setCategory] = useState<RoomCategory | "ALL">("ALL");
  const [roomToReserve, setRoomToReserve] = useState<Room | null>(null);

  const debouncedSearch = useDebouncedValue(search);

  // Guests and students may only book one category, so the query is pinned to
  // it rather than letting them filter into inventory they cannot reserve.
  const effectiveCategory = bookableCategory ?? category;

  const { data: rooms = [], isLoading } = useGetRooms({
    category: effectiveCategory,
    status,
  });

  const visibleRooms = useMemo(() => {
    const needle = debouncedSearch.trim().toLowerCase();
    if (!needle) return rooms;
    return rooms.filter((room) =>
      room.roomNumber.toLowerCase().includes(needle),
    );
  }, [rooms, debouncedSearch]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Room catalogue"
        description={
          bookableCategory
            ? `Inventory you can reserve as a ${ROOM_CATEGORY_LABELS[bookableCategory].toLowerCase()} user.`
            : "Every room and bedspace across the guest house and the student hostel."
        }
      />

      {isStaff && (
        <Alert variant="info">
          <InfoIcon />
          <AlertDescription>
            <p>
              Staff accounts cannot hold reservations. Use the front desk to act
              on stays booked by guests and students.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <RoomFilterBar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        status={status}
        onStatusChange={setStatus}
        showCategoryFilter={!bookableCategory}
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="gap-4 py-5">
              <CardHeader className="gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : visibleRooms.length === 0 ? (
        <EmptyState
          icon={BedDoubleIcon}
          title="No rooms match these filters"
          description="Try clearing the search term or widening the status filter."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleRooms.map((room) => (
            <RoomCard
              key={room._id}
              room={room}
              onReserve={bookableCategory ? setRoomToReserve : undefined}
              disabledReason={
                bookableCategory && room.category !== bookableCategory
                  ? "Not available to your account type"
                  : undefined
              }
            />
          ))}
        </div>
      )}

      <ReserveRoomModal
        room={roomToReserve}
        onOpenChange={(open) => !open && setRoomToReserve(null)}
      />
    </div>
  );
}

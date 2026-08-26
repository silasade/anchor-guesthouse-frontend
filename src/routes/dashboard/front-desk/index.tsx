import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ConciergeBellIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConfirmationModal from "@/global_components/ConfirmationModal";
import EmptyState from "@/global_components/EmptyState";
import PageHeader from "@/global_components/PageHeader";
import ProtectedRoute from "@/global_components/ProtectedRoute";
import SearchInput from "@/global_components/SearchInput";
import StatCard from "@/global_components/StatCard";
import TablePagination from "@/global_components/TablePagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  useCheckInReservation,
  useCheckOutReservation,
  useUnreserveReservation,
} from "@/services/mutations/Reservation";
import { useGetAllReservations } from "@/services/queries/Reservation";
import {
  RESERVATION_STATUS_LABELS,
  ROOM_CATEGORY_LABELS,
} from "@/utils/constants";
import {
  getGuestName,
  getRoomNumber,
  matchesReservationSearch,
} from "@/utils/reservation";
import {
  RESERVATION_STATUSES,
  type Reservation,
  type ReservationStatus,
} from "@/utils/types/Reservation.type";
import {
  ROOM_CATEGORIES,
  type RoomCategory,
} from "@/utils/types/Room.type";
import ReservationLedger, {
  type LedgerAction,
} from "./local_components/ReservationLedger/-index";

export const Route = createFileRoute("/dashboard/front-desk/")({
  component: FrontDeskRoute,
});

const PAGE_SIZE = 10;

function FrontDeskRoute() {
  return (
    <ProtectedRoute roles={["RECEPTIONIST", "ADMIN"]}>
      <FrontDesk />
    </ProtectedRoute>
  );
}

const ACTION_COPY: Record<
  LedgerAction,
  { title: string; confirmLabel: string; destructive: boolean }
> = {
  "check-in": {
    title: "Check in this stay?",
    confirmLabel: "Check in",
    destructive: false,
  },
  "check-out": {
    title: "Check out this stay?",
    confirmLabel: "Check out",
    destructive: false,
  },
  unreserve: {
    title: "Cancel this reservation?",
    confirmLabel: "Cancel reservation",
    destructive: true,
  },
};

function FrontDesk() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ReservationStatus | "ALL">("ALL");
  const [userCategory, setUserCategory] = useState<RoomCategory | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [pendingAction, setPendingAction] = useState<{
    action: LedgerAction;
    reservation: Reservation;
  } | null>(null);

  const debouncedSearch = useDebouncedValue(search);

  const { data: reservations = [], isLoading } = useGetAllReservations({
    status,
    userCategory,
  });

  const checkIn = useCheckInReservation();
  const checkOut = useCheckOutReservation();
  const unreserve = useUnreserveReservation();

  const isMutating =
    checkIn.isPending || checkOut.isPending || unreserve.isPending;

  const filtered = useMemo(() => {
    const matched = reservations.filter((reservation) =>
      matchesReservationSearch(reservation, debouncedSearch),
    );
    // Reset to the first page whenever the result set shrinks past the cursor.
    return matched;
  }, [reservations, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const awaitingArrival = reservations.filter(
    (item) => item.status === "RESERVED",
  ).length;
  const inHouse = reservations.filter(
    (item) => item.status === "CHECKED_IN",
  ).length;
  const departed = reservations.filter(
    (item) => item.status === "CHECKED_OUT",
  ).length;

  const runAction = async () => {
    if (!pendingAction) return;
    const { action, reservation } = pendingAction;
    try {
      if (action === "check-in") await checkIn.mutateAsync(reservation._id);
      if (action === "check-out") await checkOut.mutateAsync(reservation._id);
      if (action === "unreserve") await unreserve.mutateAsync(reservation._id);
    } finally {
      setPendingAction(null);
    }
  };

  const copy = pendingAction ? ACTION_COPY[pendingAction.action] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Front desk"
        description="Check arrivals in, check departures out, and release rooms when plans change."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Awaiting arrival"
          value={awaitingArrival}
          icon={ConciergeBellIcon}
          isLoading={isLoading}
        />
        <StatCard label="In house" value={inHouse} isLoading={isLoading} />
        <StatCard label="Departed" value={departed} isLoading={isLoading} />
        <StatCard
          label="Ledger entries"
          value={reservations.length}
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
          placeholder="Search guest, room or note…"
          className="sm:max-w-xs"
        />

        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value as ReservationStatus | "ALL");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {RESERVATION_STATUSES.map((item) => (
              <SelectItem key={item} value={item}>
                {RESERVATION_STATUS_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={userCategory}
          onValueChange={(value) => {
            setUserCategory(value as RoomCategory | "ALL");
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
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ConciergeBellIcon}
          title="No reservations match these filters"
          description="Clear the search term or widen the status and category filters."
        />
      ) : (
        <div className="space-y-4">
          <ReservationLedger
            reservations={paginated}
            onAction={(action, reservation) =>
              setPendingAction({ action, reservation })
            }
          />
          <TablePagination
            page={currentPage}
            pageSize={PAGE_SIZE}
            totalItems={filtered.length}
            onPageChange={setPage}
          />
        </div>
      )}

      <ConfirmationModal
        open={!!pendingAction}
        onOpenChange={(open) => !open && setPendingAction(null)}
        title={copy?.title ?? ""}
        description={
          pendingAction
            ? `${getGuestName(pendingAction.reservation)} · Room ${getRoomNumber(pendingAction.reservation)}`
            : ""
        }
        confirmLabel={copy?.confirmLabel ?? "Confirm"}
        variant={copy?.destructive ? "destructive" : "default"}
        isLoading={isMutating}
        onConfirm={runAction}
      />
    </div>
  );
}

import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ConfirmationModal from "@/global_components/ConfirmationModal";
import EmptyState from "@/global_components/EmptyState";
import PageHeader from "@/global_components/PageHeader";
import ProtectedRoute from "@/global_components/ProtectedRoute";
import ReservationCard from "@/global_components/ReservationCard";
import { useUnreserveReservation } from "@/services/mutations/Reservation";
import { useGetMyReservations } from "@/services/queries/Reservation";
import { getRoomNumber, isActiveReservation } from "@/utils/reservation";
import type { Reservation } from "@/utils/types/Reservation.type";

export const Route = createFileRoute("/dashboard/reservations/")({
  component: MyReservationsRoute,
});

function MyReservationsRoute() {
  return (
    <ProtectedRoute roles={["GUEST", "STUDENT"]}>
      <MyReservations />
    </ProtectedRoute>
  );
}

function MyReservations() {
  const [reservationToCancel, setReservationToCancel] =
    useState<Reservation | null>(null);
  const { data: reservations = [], isLoading } = useGetMyReservations();
  const { mutateAsync: unreserve, isPending } = useUnreserveReservation();

  const { active, past } = useMemo(
    () => ({
      active: reservations.filter(isActiveReservation),
      past: reservations.filter((item) => !isActiveReservation(item)),
    }),
    [reservations],
  );

  const handleCancel = async () => {
    if (!reservationToCancel) return;
    try {
      await unreserve(reservationToCancel._id);
    } finally {
      setReservationToCancel(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My reservations"
        description="Every stay you have booked, newest first."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/rooms">Reserve another room</Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="gap-4 py-5">
              <CardHeader className="gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-7 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <EmptyState
          icon={CalendarCheckIcon}
          title="You have no reservations yet"
          description="Pick a room from the catalogue to make your first booking."
          action={
            <Button asChild size="sm">
              <Link to="/dashboard/rooms">Browse the catalogue</Link>
            </Button>
          }
        />
      ) : (
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
            <TabsTrigger value="past">History ({past.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {active.length === 0 ? (
              <EmptyState
                icon={CalendarCheckIcon}
                title="No active stays"
                description="Reservations you cancel or check out of move to History."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {active.map((reservation) => (
                  <ReservationCard
                    key={reservation._id}
                    reservation={reservation}
                    onCancel={setReservationToCancel}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {past.length === 0 ? (
              <EmptyState
                icon={CalendarCheckIcon}
                title="Nothing in your history yet"
                description="Completed and cancelled stays are listed here."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {past.map((reservation) => (
                  <ReservationCard
                    key={reservation._id}
                    reservation={reservation}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <ConfirmationModal
        open={!!reservationToCancel}
        onOpenChange={(open) => !open && setReservationToCancel(null)}
        title="Cancel this reservation?"
        description={
          reservationToCancel
            ? `Room ${getRoomNumber(reservationToCancel)} will be released back to the catalogue. This cannot be undone.`
            : ""
        }
        confirmLabel="Cancel reservation"
        cancelLabel="Keep it"
        variant="destructive"
        isLoading={isPending}
        onConfirm={handleCancel}
      />
    </div>
  );
}

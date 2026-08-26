import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  BedDoubleIcon,
  BuildingIcon,
  CalendarCheckIcon,
  ClockIcon,
  DoorOpenIcon,
  LogInIcon,
  WalletIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import EmptyState from "@/global_components/EmptyState";
import PageHeader from "@/global_components/PageHeader";
import ReservationCard from "@/global_components/ReservationCard";
import StatCard from "@/global_components/StatCard";
import { useSession } from "@/hooks/useSession";
import { formatCurrency } from "@/lib/utils";
import { useGetReport } from "@/services/queries/Report";
import {
  useGetAllReservations,
  useGetMyReservations,
} from "@/services/queries/Reservation";
import { useGetRooms } from "@/services/queries/Room";
import { CHECKOUT_CUTOFF_LABEL, ROLE_LABELS } from "@/utils/constants";
import { navItemsForRole } from "@/utils/navigation";

export const Route = createFileRoute("/dashboard/")({
  component: OverviewRoute,
});

function OverviewRoute() {
  const { user, role, isAdmin, isStaff, bookableCategory } = useSession();
  const isBooker = !!bookableCategory;

  const { data: rooms = [], isLoading: isLoadingRooms } = useGetRooms(
    bookableCategory ? { category: bookableCategory } : {},
  );
  const { data: myReservations = [], isLoading: isLoadingMine } =
    useGetMyReservations(isBooker);
  const { data: allReservations = [], isLoading: isLoadingAll } =
    useGetAllReservations({}, isStaff);
  const { data: report, isLoading: isLoadingReport } = useGetReport(
    { period: "month" },
    isAdmin,
  );

  const availableRooms = rooms.filter(
    (room) => room.isAvailable && room.status === "AVAILABLE",
  );
  const activeStays = myReservations.filter((reservation) =>
    ["RESERVED", "CHECKED_IN"].includes(reservation.status),
  );
  const awaitingArrival = allReservations.filter(
    (reservation) => reservation.status === "RESERVED",
  );
  const inHouse = allReservations.filter(
    (reservation) => reservation.status === "CHECKED_IN",
  );

  const occupancyRate = report
    ? Number.parseInt(report.roomOccupancy.occupancyRatePercentage, 10) || 0
    : 0;

  const quickLinks = navItemsForRole(role).filter(
    (item) => item.to !== "/dashboard",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "there"}`}
        description={`You are signed in as ${role ? ROLE_LABELS[role] : "a user"}. Stays run on a ${CHECKOUT_CUTOFF_LABEL} checkout cycle.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isBooker && (
          <>
            <StatCard
              label="Active stays"
              value={activeStays.length}
              hint="Reserved or checked in"
              icon={CalendarCheckIcon}
              isLoading={isLoadingMine}
            />
            <StatCard
              label="Rooms you can book"
              value={availableRooms.length}
              hint={
                bookableCategory === "GUEST"
                  ? "Single guest rooms available"
                  : "Student bedspaces available"
              }
              icon={DoorOpenIcon}
              isLoading={isLoadingRooms}
            />
            <StatCard
              label="Total stays"
              value={myReservations.length}
              hint="Across your full history"
              icon={BedDoubleIcon}
              isLoading={isLoadingMine}
            />
            <StatCard
              label="Lifetime spend"
              value={formatCurrency(
                myReservations
                  .filter((item) => item.status !== "CANCELLED")
                  .reduce((total, item) => total + item.totalCost, 0),
              )}
              hint="Excluding cancellations"
              icon={WalletIcon}
              isLoading={isLoadingMine}
            />
          </>
        )}

        {isStaff && (
          <>
            <StatCard
              label="Awaiting arrival"
              value={awaitingArrival.length}
              hint="Reserved, not yet checked in"
              icon={ClockIcon}
              isLoading={isLoadingAll}
            />
            <StatCard
              label="Currently in house"
              value={inHouse.length}
              hint="Checked in right now"
              icon={LogInIcon}
              isLoading={isLoadingAll}
            />
            <StatCard
              label="Rooms in inventory"
              value={rooms.length}
              hint={`${availableRooms.length} available now`}
              icon={BuildingIcon}
              isLoading={isLoadingRooms}
            />
            <StatCard
              label="All reservations"
              value={allReservations.length}
              hint="Full ledger"
              icon={CalendarCheckIcon}
              isLoading={isLoadingAll}
            />
          </>
        )}
      </div>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Last 30 days</CardTitle>
            <CardDescription>
              Occupancy snapshot and revenue booked over the trailing month.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Revenue
                </p>
                <p className="text-2xl font-semibold tracking-tight">
                  {isLoadingReport
                    ? "—"
                    : formatCurrency(report?.summary.totalRevenue ?? 0)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Reservations
                </p>
                <p className="text-2xl font-semibold tracking-tight">
                  {isLoadingReport ? "—" : (report?.summary.totalReservations ?? 0)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Cancelled
                </p>
                <p className="text-2xl font-semibold tracking-tight">
                  {isLoadingReport ? "—" : (report?.summary.cancelledCount ?? 0)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Occupancy
                </p>
                <p className="text-lg font-semibold">{occupancyRate}%</p>
              </div>
              <Progress value={occupancyRate} />
              <p className="text-muted-foreground text-xs">
                {report?.roomOccupancy.occupiedRooms ?? 0} occupied ·{" "}
                {report?.roomOccupancy.reservedRooms ?? 0} reserved ·{" "}
                {report?.roomOccupancy.availableRooms ?? 0} available
              </p>
              <Button asChild variant="outline" size="sm" className="mt-1 w-full">
                <Link to="/dashboard/reports">
                  Open full report
                  <ArrowRightIcon />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isBooker && (
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Your current stays
              </h2>
              <p className="text-muted-foreground text-sm">
                Reservations that are still open.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard/reservations">View all</Link>
            </Button>
          </div>

          {activeStays.length === 0 ? (
            <EmptyState
              icon={CalendarCheckIcon}
              title="No active stays"
              description="Reserve a room from the catalogue and it will appear here."
              action={
                <Button asChild size="sm">
                  <Link to="/dashboard/rooms">Browse the catalogue</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {activeStays.slice(0, 3).map((reservation) => (
                <ReservationCard
                  key={reservation._id}
                  reservation={reservation}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Jump to</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((item) => (
            <Link key={item.label} to={item.to}>
              <Card className="h-full gap-2 py-5 transition-shadow hover:shadow-md">
                <CardHeader>
                  <span className="bg-muted text-foreground flex size-9 items-center justify-center rounded-lg">
                    <item.icon className="size-4.5" />
                  </span>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-muted-foreground text-sm">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

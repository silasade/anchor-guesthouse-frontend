import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BanknoteIcon,
  CalendarCheckIcon,
  ChartColumnIcon,
  DoorOpenIcon,
  XCircleIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/global_components/EmptyState";
import PageHeader from "@/global_components/PageHeader";
import ProtectedRoute from "@/global_components/ProtectedRoute";
import StatCard from "@/global_components/StatCard";
import { formatDate } from "@/lib/date";
import { formatCurrency } from "@/lib/utils";
import { useGetReport } from "@/services/queries/Report";
import { CHECKOUT_CUTOFF_LABEL } from "@/utils/constants";
import type { ReportPeriod } from "@/utils/types/Report.type";
import ReportCharts from "./local_components/ReportCharts/-index";
import ReportFilters from "./local_components/ReportFilters/-index";

export const Route = createFileRoute("/dashboard/reports/")({
  component: ReportsRoute,
});

function ReportsRoute() {
  return (
    <ProtectedRoute roles={["ADMIN"]}>
      <Reports />
    </ProtectedRoute>
  );
}

function Reports() {
  const [period, setPeriod] = useState<ReportPeriod>("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // The API only honours a custom window when both bounds are present.
  const isCustomRange = !!startDate && !!endDate;

  const {
    data: report,
    isLoading,
    isError,
  } = useGetReport(
    isCustomRange ? { startDate, endDate } : { period },
  );

  const occupancyRate = report
    ? Number.parseInt(report.roomOccupancy.occupancyRatePercentage, 10) || 0
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & analytics"
        description={`Occupancy, reservation and revenue analytics. Stay lengths are computed on the ${CHECKOUT_CUTOFF_LABEL} checkout cycle.`}
      />

      <Card>
        <CardContent>
          <ReportFilters
            period={period}
            onPeriodChange={setPeriod}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onReset={() => {
              setStartDate("");
              setEndDate("");
            }}
            isCustomRange={isCustomRange}
          />
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      ) : isError || !report ? (
        <EmptyState
          icon={ChartColumnIcon}
          title="Report could not be generated"
          description="The API rejected this range. Check that the dates are valid and try again."
        />
      ) : (
        <>
          <p className="text-muted-foreground text-sm">
            Reporting on{" "}
            <span className="text-foreground font-medium">
              {formatDate(report.startDate)} – {formatDate(report.endDate)}
            </span>{" "}
            ({report.period})
          </p>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total revenue"
              value={formatCurrency(report.summary.totalRevenue)}
              hint="Excludes cancelled stays"
              icon={BanknoteIcon}
            />
            <StatCard
              label="Reservations"
              value={report.summary.totalReservations}
              hint={`${report.summary.checkedInCount} currently checked in`}
              icon={CalendarCheckIcon}
            />
            <StatCard
              label="Completed stays"
              value={report.summary.checkedOutCount}
              hint="Checked out within the period"
              icon={DoorOpenIcon}
            />
            <StatCard
              label="Cancelled"
              value={report.summary.cancelledCount}
              hint="Rooms released back to the catalogue"
              icon={XCircleIcon}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Occupancy snapshot</CardTitle>
              <CardDescription>
                Current state of the catalogue, measured across all{" "}
                {report.roomOccupancy.totalRooms} rooms.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground text-sm">
                    Occupied or reserved
                  </span>
                  <span className="text-2xl font-semibold tracking-tight">
                    {occupancyRate}%
                  </span>
                </div>
                <Progress value={occupancyRate} />
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-0.5">
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">
                    Total rooms
                  </p>
                  <p className="text-lg font-semibold">
                    {report.roomOccupancy.totalRooms}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">
                    Occupied
                  </p>
                  <p className="text-lg font-semibold">
                    {report.roomOccupancy.occupiedRooms}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">
                    Reserved
                  </p>
                  <p className="text-lg font-semibold">
                    {report.roomOccupancy.reservedRooms}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">
                    Available
                  </p>
                  <p className="text-lg font-semibold">
                    {report.roomOccupancy.availableRooms}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <ReportCharts report={report} />

          <Card>
            <CardHeader>
              <CardTitle>Category breakdown</CardTitle>
              <CardDescription>
                Guest house versus student hostel over the selected window.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Guest house
                </p>
                <p className="text-2xl font-semibold tracking-tight">
                  {formatCurrency(report.categoryBreakdown.guest.revenue)}
                </p>
                <p className="text-muted-foreground text-sm">
                  {report.categoryBreakdown.guest.reservationsCount} reservations
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Student hostel
                </p>
                <p className="text-2xl font-semibold tracking-tight">
                  {formatCurrency(report.categoryBreakdown.student.revenue)}
                </p>
                <p className="text-muted-foreground text-sm">
                  {report.categoryBreakdown.student.reservationsCount}{" "}
                  reservations
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

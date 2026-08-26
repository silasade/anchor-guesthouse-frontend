import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Report } from "@/utils/types/Report.type";

/**
 * The palette is monochrome, so the series are separated by lightness steps
 * from the shared `--chart-*` ramp rather than by hue.
 */
const RAMP = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const AXIS_STYLE = {
  fill: "var(--muted-foreground)",
  fontSize: 11,
};

const TOOLTIP_STYLE = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  color: "var(--popover-foreground)",
  fontSize: "12px",
};

function ReportCharts({ report }: { report: Report }) {
  const revenueData = [
    {
      name: "Guest house",
      revenue: report.categoryBreakdown.guest.revenue,
      reservations: report.categoryBreakdown.guest.reservationsCount,
    },
    {
      name: "Student hostel",
      revenue: report.categoryBreakdown.student.revenue,
      reservations: report.categoryBreakdown.student.reservationsCount,
    },
  ];

  const statusData = [
    { name: "Checked in", value: report.summary.checkedInCount },
    { name: "Checked out", value: report.summary.checkedOutCount },
    { name: "Cancelled", value: report.summary.cancelledCount },
    {
      name: "Reserved",
      value: Math.max(
        0,
        report.summary.totalReservations -
          report.summary.checkedInCount -
          report.summary.checkedOutCount -
          report.summary.cancelledCount,
      ),
    },
  ].filter((entry) => entry.value > 0);

  const occupancyData = [
    { name: "Occupied", value: report.roomOccupancy.occupiedRooms },
    { name: "Reserved", value: report.roomOccupancy.reservedRooms },
    { name: "Available", value: report.roomOccupancy.availableRooms },
  ].filter((entry) => entry.value > 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Revenue by category</CardTitle>
          <CardDescription>
            Booked value from stays that were not cancelled.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={revenueData}
              margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
            >
              <XAxis
                dataKey="name"
                tick={AXIS_STYLE}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                tick={AXIS_STYLE}
                axisLine={false}
                tickLine={false}
                width={72}
                tickFormatter={(value: number) => formatCurrency(value)}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                cursor={{ fill: "var(--muted)" }}
                formatter={(value) => formatCurrency(Number(value))}
              />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={90}>
                {revenueData.map((_, index) => (
                  <Cell key={index} fill={RAMP[index % RAMP.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reservation outcomes</CardTitle>
          <CardDescription>
            How stays in this period resolved.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          {statusData.length === 0 ? (
            <p className="text-muted-foreground flex h-full items-center justify-center text-sm">
              No reservations in this period.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={54}
                  outerRadius={90}
                  paddingAngle={2}
                  stroke="var(--background)"
                  strokeWidth={2}
                >
                  {statusData.map((_, index) => (
                    <Cell key={index} fill={RAMP[index % RAMP.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend
                  verticalAlign="bottom"
                  height={28}
                  formatter={(value) => (
                    <span className="text-muted-foreground text-xs">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Room occupancy</CardTitle>
          <CardDescription>
            Live snapshot across the whole property, not just this period.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          {occupancyData.length === 0 ? (
            <p className="text-muted-foreground flex h-full items-center justify-center text-sm">
              No rooms in the catalogue yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={54}
                  outerRadius={90}
                  paddingAngle={2}
                  stroke="var(--background)"
                  strokeWidth={2}
                >
                  {occupancyData.map((_, index) => (
                    <Cell key={index} fill={RAMP[index % RAMP.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend
                  verticalAlign="bottom"
                  height={28}
                  formatter={(value) => (
                    <span className="text-muted-foreground text-xs">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ReportCharts;

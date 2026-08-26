export const REPORT_PERIODS = ["day", "week", "month", "year"] as const;

export type ReportPeriod = (typeof REPORT_PERIODS)[number];

export type ReportSummary = {
  totalReservations: number;
  checkedInCount: number;
  checkedOutCount: number;
  cancelledCount: number;
  totalRevenue: number;
};

export type ReportCategoryBreakdown = {
  guest: { reservationsCount: number; revenue: number };
  student: { reservationsCount: number; revenue: number };
};

export type ReportRoomOccupancy = {
  totalRooms: number;
  occupiedRooms: number;
  reservedRooms: number;
  availableRooms: number;
  /** Server-formatted percentage string, e.g. `"64%"`. */
  occupancyRatePercentage: string;
};

export type Report = {
  period: ReportPeriod | "custom";
  startDate: string;
  endDate: string;
  checkoutCutoffPolicy: string;
  summary: ReportSummary;
  categoryBreakdown: ReportCategoryBreakdown;
  roomOccupancy: ReportRoomOccupancy;
};

export type ReportResponse = {
  report: Report;
};

export type ReportQuery = {
  period?: ReportPeriod;
  startDate?: string;
  endDate?: string;
};

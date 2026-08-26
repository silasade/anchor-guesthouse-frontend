import { useQuery } from "@tanstack/react-query";
import { requests } from "../api";
import { queryKeys } from "../queryKeys";
import type { ReportQuery, ReportResponse } from "@/utils/types/Report.type";

/**
 * `GET /reports` (Admin only). Passing both `startDate` and `endDate` overrides
 * `period` server-side and reports the range as `"custom"`.
 */
export const useGetReport = (query: ReportQuery = {}, enabled = true) => {
  const { period, startDate, endDate } = query;

  return useQuery({
    queryKey: queryKeys.reports.detail({ period, startDate, endDate }),
    queryFn: () =>
      requests<ReportResponse>("reports", {
        query: { period, startDate, endDate },
      }),
    enabled,
    select: (response) => response.data.report,
  });
};

import { RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REPORT_PERIODS, type ReportPeriod } from "@/utils/types/Report.type";

const PERIOD_LABELS: Record<ReportPeriod, string> = {
  day: "Today",
  week: "Last 7 days",
  month: "Last 30 days",
  year: "Last 365 days",
};

type ReportFiltersProps = {
  period: ReportPeriod;
  onPeriodChange: (period: ReportPeriod) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onReset: () => void;
  /** True once both custom dates are set, which overrides `period` server-side. */
  isCustomRange: boolean;
};

function ReportFilters({
  period,
  onPeriodChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onReset,
  isCustomRange,
}: ReportFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="space-y-2">
        <Label htmlFor="report-period">Period</Label>
        <Select
          value={period}
          onValueChange={(value) => onPeriodChange(value as ReportPeriod)}
          disabled={isCustomRange}
        >
          <SelectTrigger id="report-period" className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REPORT_PERIODS.map((item) => (
              <SelectItem key={item} value={item}>
                {PERIOD_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="report-start">From</Label>
        <Input
          id="report-start"
          type="date"
          value={startDate}
          max={endDate || undefined}
          onChange={(event) => onStartDateChange(event.target.value)}
          className="w-full sm:w-44"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="report-end">To</Label>
        <Input
          id="report-end"
          type="date"
          value={endDate}
          min={startDate || undefined}
          onChange={(event) => onEndDateChange(event.target.value)}
          className="w-full sm:w-44"
        />
      </div>

      {isCustomRange && (
        <Button variant="outline" onClick={onReset}>
          <RotateCcwIcon />
          Clear range
        </Button>
      )}
    </div>
  );
}

export default ReportFilters;

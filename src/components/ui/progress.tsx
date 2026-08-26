import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Deterministic bar used by the occupancy widgets. Kept as a plain element
 * rather than the Radix primitive so it can render inside tight table cells.
 */
function Progress({
  value = 0,
  className,
  indicatorClassName,
  ...props
}: React.ComponentProps<"div"> & {
  value?: number;
  indicatorClassName?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={cn(
        "bg-muted relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className={cn(
          "bg-primary h-full rounded-full transition-all duration-500",
          indicatorClassName,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export { Progress };
